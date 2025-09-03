// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Tracking Event Types
interface TrackingEvent {
  id: string;
  type: 'mousemove' | 'click' | 'scroll' | 'pageview' | 'resize';
  x?: number;
  y?: number;
  timestamp: number;
  url: string;
  element?: string;
  scrollTop?: number;
  scrollLeft?: number;
  windowWidth?: number;
  windowHeight?: number;
  pageWidth?: number;
  pageHeight?: number;
}

// Session Recording Object Type
interface TrackingSession extends CosmicObject {
  type: 'tracking-sessions';
  metadata: {
    session_id: string;
    website_domain: string;
    duration: number;
    page_views: number;
    events: TrackingEvent[];
    user_agent: string;
    ip_address?: string;
    started_at: string;
    ended_at?: string;
    total_clicks: number;
    total_scrolls: number;
    pages_visited: string[];
  };
}

// Heatmap Data Object Type
interface HeatmapData extends CosmicObject {
  type: 'heatmap-data';
  metadata: {
    website_domain: string;
    page_url: string;
    click_data: HeatPoint[];
    scroll_data: ScrollData;
    mouse_data: HeatPoint[];
    session_count: number;
    last_updated: string;
  };
}

// Website Configuration Object Type
interface WebsiteConfig extends CosmicObject {
  type: 'website-configs';
  metadata: {
    domain: string;
    api_key: string;
    user_id: string;
    settings: {
      record_sessions: boolean;
      track_heatmaps: boolean;
      sample_rate: number;
      max_session_duration: number;
      ignore_patterns: string[];
    };
    analytics: {
      total_sessions: number;
      total_page_views: number;
      total_events: number;
      last_activity: string;
    };
  };
}

// Heat Point for heatmap visualization
interface HeatPoint {
  x: number;
  y: number;
  count: number;
  intensity?: number;
}

// Scroll tracking data
interface ScrollData {
  max_scroll_percentage: number;
  avg_scroll_percentage: number;
  scroll_points: Array<{
    percentage: number;
    count: number;
  }>;
}

// API Response types
interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Session Statistics
interface SessionStats {
  totalSessions: number;
  totalPageViews: number;
  averageDuration: number;
  topPages: Array<{
    url: string;
    views: number;
  }>;
  bounceRate: number;
}

// Dashboard Analytics Data
interface DashboardData {
  sessions: TrackingSession[];
  heatmaps: HeatmapData[];
  stats: SessionStats;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Type guards for runtime validation
export function isTrackingSession(obj: CosmicObject): obj is TrackingSession {
  return obj.type === 'tracking-sessions';
}

export function isHeatmapData(obj: CosmicObject): obj is HeatmapData {
  return obj.type === 'heatmap-data';
}

export function isWebsiteConfig(obj: CosmicObject): obj is WebsiteConfig {
  return obj.type === 'website-configs';
}

// Utility types for API operations
export type CreateSessionData = Omit<TrackingSession, 'id' | 'created_at' | 'modified_at'>;
export type UpdateHeatmapData = Partial<HeatmapData['metadata']>;

// Export all interfaces
export type {
  CosmicObject,
  TrackingEvent,
  TrackingSession,
  HeatmapData,
  WebsiteConfig,
  HeatPoint,
  ScrollData,
  CosmicResponse,
  SessionStats,
  DashboardData
};