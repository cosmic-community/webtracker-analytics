import { createBucketClient } from '@cosmicjs/sdk';
import type { TrackingSession, HeatmapData, WebsiteConfig, TrackingEvent, HeatPoint } from '@/types';

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

// Helper function for error handling
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Helper function to safely parse JSON strings from Cosmic metadata
function safeJsonParse<T>(jsonString: string | T[] | undefined, fallback: T[] = []): T[] {
  if (!jsonString) {
    return fallback;
  }
  
  if (Array.isArray(jsonString)) {
    return jsonString;
  }
  
  if (typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      console.warn('Failed to parse JSON string:', jsonString.substring(0, 100) + '...');
      return fallback;
    }
  }
  
  return fallback;
}

// Helper function to safely parse scroll data
function safeScrollDataParse(scrollData: string | any | undefined): any {
  if (!scrollData) {
    return {
      max_scroll_percentage: 0,
      avg_scroll_percentage: 0,
      scroll_points: []
    };
  }
  
  if (typeof scrollData === 'object' && scrollData !== null) {
    return scrollData;
  }
  
  if (typeof scrollData === 'string') {
    try {
      return JSON.parse(scrollData);
    } catch (error) {
      console.warn('Failed to parse scroll data:', scrollData.substring(0, 100));
      return {
        max_scroll_percentage: 0,
        avg_scroll_percentage: 0,
        scroll_points: []
      };
    }
  }
  
  return {
    max_scroll_percentage: 0,
    avg_scroll_percentage: 0,
    scroll_points: []
  };
}

// Session Management Functions
export async function createSession(sessionData: {
  session_id: string;
  website_domain: string;
  user_agent: string;
}): Promise<TrackingSession | null> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'tracking-sessions',
      title: `Session ${sessionData.session_id}`,
      metadata: {
        session_id: sessionData.session_id,
        website_domain: sessionData.website_domain,
        duration: 0,
        page_views: 1,
        events: [],
        user_agent: sessionData.user_agent,
        started_at: new Date().toISOString(),
        total_clicks: 0,
        total_scrolls: 0,
        pages_visited: ['/']
      }
    });
    
    return response.object as TrackingSession;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function updateSession(sessionId: string, updates: {
  events?: TrackingEvent[];
  duration?: number;
  page_views?: number;
  total_clicks?: number;
  total_scrolls?: number;
  pages_visited?: string[];
  ended_at?: string;
}): Promise<boolean> {
  try {
    await cosmic.objects.updateOne(sessionId, {
      metadata: updates
    });
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

export async function getSessions(limit: number = 50): Promise<TrackingSession[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'tracking-sessions' })
      .props(['id', 'title', 'metadata', 'created_at'])
      .depth(1);
    
    if (!response.objects || !Array.isArray(response.objects)) {
      return [];
    }

    const sessions = (response.objects as TrackingSession[]).sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return sessions.slice(0, limit);
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Failed to fetch sessions:', error);
    return [];
  }
}

export async function getSession(sessionId: string): Promise<TrackingSession | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'tracking-sessions',
      id: sessionId
    }).depth(1);
    
    return response.object as TrackingSession;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    console.error('Failed to fetch session:', error);
    return null;
  }
}

// Heatmap Management Functions
export async function updateHeatmapData(
  websiteDomain: string,
  pageUrl: string,
  events: TrackingEvent[]
): Promise<boolean> {
  try {
    // Find existing heatmap data
    let existingHeatmap: HeatmapData | null = null;
    
    try {
      const response = await cosmic.objects.find({
        type: 'heatmap-data',
        'metadata.website_domain': websiteDomain,
        'metadata.page_url': pageUrl
      }).depth(1);
      
      if (response.objects && response.objects.length > 0) {
        existingHeatmap = response.objects[0] as HeatmapData;
      }
    } catch (err) {
      // No existing heatmap found, will create new one
    }

    // Process events for heatmap data
    const clickEvents = events.filter(e => e.type === 'click' && e.x !== undefined && e.y !== undefined);
    const mouseEvents = events.filter(e => e.type === 'mousemove' && e.x !== undefined && e.y !== undefined);
    const scrollEvents = events.filter(e => e.type === 'scroll');

    const newClickData = processEventsForHeatmap(clickEvents);
    const newMouseData = processEventsForHeatmap(mouseEvents);
    const newScrollData = processScrollEvents(scrollEvents);

    if (existingHeatmap) {
      // Parse existing data safely
      const existingClickData = safeJsonParse<HeatPoint>(existingHeatmap.metadata.click_data, []);
      const existingMouseData = safeJsonParse<HeatPoint>(existingHeatmap.metadata.mouse_data, []);
      const existingScrollData = safeScrollDataParse(existingHeatmap.metadata.scroll_data);

      // Merge with existing data
      const mergedClickData = mergeHeatmapPoints(existingClickData, newClickData);
      const mergedMouseData = mergeHeatmapPoints(existingMouseData, newMouseData);
      const mergedScrollData = mergeScrollData(existingScrollData, newScrollData);

      await cosmic.objects.updateOne(existingHeatmap.id, {
        metadata: {
          click_data: JSON.stringify(mergedClickData),
          mouse_data: JSON.stringify(mergedMouseData),
          scroll_data: JSON.stringify(mergedScrollData),
          session_count: (existingHeatmap.metadata.session_count || 0) + 1,
          last_updated: new Date().toISOString()
        }
      });
    } else {
      // Create new heatmap data
      await cosmic.objects.insertOne({
        type: 'heatmap-data',
        title: `Heatmap for ${pageUrl}`,
        metadata: {
          website_domain: websiteDomain,
          page_url: pageUrl,
          click_data: JSON.stringify(newClickData),
          mouse_data: JSON.stringify(newMouseData),
          scroll_data: JSON.stringify(newScrollData),
          session_count: 1,
          last_updated: new Date().toISOString()
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating heatmap data:', error);
    return false;
  }
}

export async function getHeatmapData(websiteDomain: string, pageUrl?: string): Promise<HeatmapData[]> {
  try {
    const query: Record<string, any> = {
      type: 'heatmap-data'
    };

    // Only filter by domain if provided - allows fetching all heatmaps
    if (websiteDomain) {
      query['metadata.website_domain'] = websiteDomain;
    }

    if (pageUrl) {
      query['metadata.page_url'] = pageUrl;
    }

    const response = await cosmic.objects
      .find(query)
      .props(['id', 'title', 'metadata', 'created_at'])
      .depth(1);
    
    if (!response.objects || !Array.isArray(response.objects)) {
      return [];
    }

    // Process the heatmap data to ensure proper parsing
    const processedHeatmaps = response.objects.map((heatmap: any) => {
      const processed = { ...heatmap };
      
      // Parse JSON strings in metadata
      if (processed.metadata) {
        // Handle click_data and mouse_data parsing
        processed.metadata.click_data = safeJsonParse<HeatPoint>(processed.metadata.click_data, []);
        processed.metadata.mouse_data = safeJsonParse<HeatPoint>(processed.metadata.mouse_data, []);
        processed.metadata.scroll_data = safeScrollDataParse(processed.metadata.scroll_data);
        
        // Ensure session_count is a number
        processed.metadata.session_count = Number(processed.metadata.session_count) || 0;
      }
      
      return processed;
    });
    
    // Sort by last_updated (newest first)
    const sortedHeatmaps = processedHeatmaps.sort((a, b) => {
      const dateA = new Date(a.metadata?.last_updated || '').getTime();
      const dateB = new Date(b.metadata?.last_updated || '').getTime();
      return dateB - dateA;
    });
    
    return sortedHeatmaps as HeatmapData[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Failed to fetch heatmap data:', error);
    return [];
  }
}

// Website Configuration Functions
export async function getWebsiteConfig(domain: string): Promise<WebsiteConfig | null> {
  try {
    const response = await cosmic.objects.find({
      type: 'website-configs',
      'metadata.domain': domain
    }).depth(1);
    
    if (response.objects && response.objects.length > 0) {
      const config = response.objects[0] as WebsiteConfig;
      
      // Parse JSON strings in settings and analytics if they exist
      if (typeof config.metadata.settings === 'string') {
        try {
          config.metadata.settings = JSON.parse(config.metadata.settings);
        } catch (error) {
          console.warn('Failed to parse settings JSON:', config.metadata.settings);
        }
      }
      
      if (typeof config.metadata.analytics === 'string') {
        try {
          config.metadata.analytics = JSON.parse(config.metadata.analytics);
        } catch (error) {
          console.warn('Failed to parse analytics JSON:', config.metadata.analytics);
        }
      }
      
      return config;
    }
    
    return null;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    console.error('Failed to fetch website config:', error);
    return null;
  }
}

export async function createWebsiteConfig(domain: string): Promise<WebsiteConfig | null> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'website-configs',
      title: `Website Config for ${domain}`,
      metadata: {
        domain: domain,
        api_key: generateApiKey(),
        user_id: 'default-user',
        settings: JSON.stringify({
          record_sessions: true,
          track_heatmaps: true,
          sample_rate: 100,
          max_session_duration: 1800000, // 30 minutes
          ignore_patterns: ['/api/*', '/admin/*']
        }),
        analytics: JSON.stringify({
          total_sessions: 0,
          total_page_views: 0,
          total_events: 0,
          last_activity: new Date().toISOString()
        })
      }
    });
    
    return response.object as WebsiteConfig;
  } catch (error) {
    console.error('Error creating website config:', error);
    return null;
  }
}

// Utility Functions
function processEventsForHeatmap(events: TrackingEvent[]): HeatPoint[] {
  const pointMap: Map<string, HeatPoint> = new Map();
  
  events.forEach(event => {
    if (event.x !== undefined && event.y !== undefined) {
      // Round coordinates to nearest 20px for better clustering
      const roundedX = Math.round(event.x / 20) * 20;
      const roundedY = Math.round(event.y / 20) * 20;
      const key = `${roundedX},${roundedY}`;
      
      const existing = pointMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        pointMap.set(key, {
          x: roundedX,
          y: roundedY,
          count: 1,
          intensity: 1
        });
      }
    }
  });
  
  return Array.from(pointMap.values());
}

function processScrollEvents(events: TrackingEvent[]) {
  if (events.length === 0) {
    return {
      max_scroll_percentage: 0,
      avg_scroll_percentage: 0,
      scroll_points: []
    };
  }

  const scrollPercentages = events
    .filter(e => e.scrollTop !== undefined && e.pageHeight !== undefined && e.pageHeight > 0)
    .map(e => {
      const scrollPercent = ((e.scrollTop || 0) / (e.pageHeight || 1)) * 100;
      return Math.min(100, Math.max(0, scrollPercent));
    });

  const maxScroll = scrollPercentages.length > 0 ? Math.max(...scrollPercentages) : 0;
  const avgScroll = scrollPercentages.length > 0 
    ? scrollPercentages.reduce((a, b) => a + b, 0) / scrollPercentages.length 
    : 0;

  return {
    max_scroll_percentage: maxScroll,
    avg_scroll_percentage: avgScroll,
    scroll_points: []
  };
}

function mergeHeatmapPoints(existing: HeatPoint[], newPoints: HeatPoint[]): HeatPoint[] {
  const pointMap: Map<string, HeatPoint> = new Map();
  
  // Add existing points
  if (Array.isArray(existing)) {
    existing.forEach(point => {
      if (point && typeof point.x === 'number' && typeof point.y === 'number') {
        const key = `${point.x},${point.y}`;
        pointMap.set(key, { ...point });
      }
    });
  }
  
  // Merge new points
  if (Array.isArray(newPoints)) {
    newPoints.forEach(point => {
      if (point && typeof point.x === 'number' && typeof point.y === 'number') {
        const key = `${point.x},${point.y}`;
        const existingPoint = pointMap.get(key);
        if (existingPoint) {
          existingPoint.count += point.count;
        } else {
          pointMap.set(key, { ...point });
        }
      }
    });
  }
  
  return Array.from(pointMap.values());
}

function mergeScrollData(existing: any, newData: any) {
  const existingData = existing || { max_scroll_percentage: 0, avg_scroll_percentage: 0, scroll_points: [] };
  const newDataSafe = newData || { max_scroll_percentage: 0, avg_scroll_percentage: 0, scroll_points: [] };
  
  return {
    max_scroll_percentage: Math.max(existingData.max_scroll_percentage || 0, newDataSafe.max_scroll_percentage || 0),
    avg_scroll_percentage: ((existingData.avg_scroll_percentage || 0) + (newDataSafe.avg_scroll_percentage || 0)) / 2,
    scroll_points: [...(existingData.scroll_points || []), ...(newDataSafe.scroll_points || [])]
  };
}

function generateApiKey(): string {
  return 'wt_' + Math.random().toString(36).substr(2, 24);
}