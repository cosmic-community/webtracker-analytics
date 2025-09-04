(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    API_ENDPOINT: '/api/sessions',
    HEATMAP_ENDPOINT: '/api/heatmaps',
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 5000, // 5 seconds
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_EVENTS: 1000,
    SAMPLE_RATE: 1.0 // 100% sampling for demo
  };

  // State management
  let sessionId = generateSessionId();
  let events = [];
  let isActive = true;
  let lastActivityTime = Date.now();
  let pageLoadTime = Date.now();
  let batchTimer;

  // Initialize tracking
  function init() {
    if (typeof window === 'undefined' || !window.document) return;
    
    console.log('🔥 WebTracker initialized for session:', sessionId);
    
    // Create initial session
    createSession();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start batch processing
    startBatchProcessing();
    
    // Track page view
    trackEvent({
      type: 'pageview',
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Generate unique session ID
  function generateSessionId() {
    return 'wt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Create session on server
  async function createSession() {
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          session_id: sessionId,
          website_domain: window.location.hostname + ':' + (window.location.port || '80'),
          user_agent: navigator.userAgent,
          started_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to create session:', response.status);
      } else {
        console.log('✅ Session created successfully');
      }
    } catch (error) {
      console.warn('Error creating session:', error);
    }
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Mouse events
    document.addEventListener('mousemove', throttle(handleMouseMove, 100), { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    
    // Scroll events
    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
    
    // Window events
    window.addEventListener('resize', throttle(handleResize, 200), { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Focus/blur for session management
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    console.log('🎯 Event listeners attached');
  }

  // Handle mouse movement
  function handleMouseMove(event) {
    if (!shouldTrackEvent()) return;
    
    trackEvent({
      type: 'mousemove',
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Handle clicks
  function handleClick(event) {
    if (!shouldTrackEvent()) return;
    
    const target = event.target;
    const element = target.tagName.toLowerCase() + 
                   (target.className ? '.' + target.className.split(' ').join('.') : '') +
                   (target.id ? '#' + target.id : '');
    
    trackEvent({
      type: 'click',
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      url: window.location.href,
      element: element.substring(0, 100), // Limit length
      timestamp: Date.now()
    });
    
    console.log('🖱️ Click tracked:', { x: event.clientX, y: event.clientY, element });
  }

  // Handle scroll
  function handleScroll() {
    if (!shouldTrackEvent()) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const pageWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth
    );
    
    trackEvent({
      type: 'scroll',
      scrollTop: Math.round(scrollTop),
      scrollLeft: Math.round(scrollLeft),
      windowWidth,
      windowHeight,
      pageWidth,
      pageHeight,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Handle window resize
  function handleResize() {
    if (!shouldTrackEvent()) return;
    
    trackEvent({
      type: 'resize',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  // Handle page unload
  function handleBeforeUnload() {
    const sessionDuration = Date.now() - pageLoadTime;
    
    // Send final batch
    flushEvents(true);
    
    // Update session duration
    updateSession({
      duration: sessionDuration,
      ended_at: new Date().toISOString()
    });
  }

  // Handle visibility change
  function handleVisibilityChange() {
    if (document.hidden) {
      handleBlur();
    } else {
      handleFocus();
    }
  }

  // Handle focus
  function handleFocus() {
    isActive = true;
    lastActivityTime = Date.now();
  }

  // Handle blur
  function handleBlur() {
    isActive = false;
    flushEvents();
  }

  // Track an event
  function trackEvent(event) {
    if (!event || typeof event !== 'object') return;
    
    // Add unique ID
    event.id = generateEventId();
    
    // Update last activity
    lastActivityTime = Date.now();
    
    // Add to events array
    events.push(event);
    
    // Limit events array size
    if (events.length > CONFIG.MAX_EVENTS) {
      events = events.slice(-CONFIG.MAX_EVENTS);
    }
    
    // Auto-flush if batch is full
    if (events.length >= CONFIG.BATCH_SIZE) {
      flushEvents();
    }
  }

  // Generate event ID
  function generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  // Check if we should track this event
  function shouldTrackEvent() {
    if (!isActive) return false;
    if (Math.random() > CONFIG.SAMPLE_RATE) return false;
    if (Date.now() - lastActivityTime > CONFIG.SESSION_TIMEOUT) return false;
    return true;
  }

  // Start batch processing timer
  function startBatchProcessing() {
    batchTimer = setInterval(() => {
      if (events.length > 0) {
        flushEvents();
      }
    }, CONFIG.FLUSH_INTERVAL);
  }

  // Flush events to server
  async function flushEvents(isSync = false) {
    if (events.length === 0) return;
    
    const eventsToSend = [...events];
    events = [];
    
    const payload = {
      action: 'update',
      session_id: sessionId,
      events: eventsToSend,
      website_domain: window.location.hostname + ':' + (window.location.port || '80')
    };
    
    try {
      const request = fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: isSync
      });
      
      if (isSync) {
        // Don't await for synchronous calls (beforeunload)
        request.catch(() => {}); // Ignore errors for sync requests
      } else {
        const response = await request;
        if (!response.ok) {
          console.warn('Failed to send events:', response.status);
          // Re-add events on failure (but limit retries)
          if (eventsToSend.length < 100) {
            events = [...eventsToSend, ...events];
          }
        } else {
          console.log('📤 Sent', eventsToSend.length, 'events');
          
          // Send heatmap data
          await sendHeatmapData(eventsToSend);
        }
      }
    } catch (error) {
      console.warn('Error sending events:', error);
      // Re-add events on network error
      if (eventsToSend.length < 100) {
        events = [...eventsToSend, ...events];
      }
    }
  }

  // Send heatmap data
  async function sendHeatmapData(events) {
    try {
      const heatmapPayload = {
        website_domain: window.location.hostname + ':' + (window.location.port || '80'),
        page_url: window.location.pathname,
        events: events
      };
      
      const response = await fetch(CONFIG.HEATMAP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heatmapPayload)
      });
      
      if (!response.ok) {
        console.warn('Failed to send heatmap data:', response.status);
      } else {
        console.log('🗺️ Heatmap data sent');
      }
    } catch (error) {
      console.warn('Error sending heatmap data:', error);
    }
  }

  // Update session metadata
  async function updateSession(updates) {
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_session',
          session_id: sessionId,
          ...updates
        }),
        keepalive: true
      });
      
      if (!response.ok) {
        console.warn('Failed to update session:', response.status);
      }
    } catch (error) {
      console.warn('Error updating session:', error);
    }
  }

  // Utility: Throttle function
  function throttle(func, wait) {
    let timeout;
    let previous = 0;
    
    return function executedFunction(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  }

  // Clean up on page unload
  function cleanup() {
    if (batchTimer) {
      clearInterval(batchTimer);
    }
  }

  // Handle page navigation (SPA support)
  let currentPath = window.location.pathname;
  
  function checkForNavigation() {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackEvent({
        type: 'pageview',
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }
  
  // Check for navigation changes every second (for SPA support)
  setInterval(checkForNavigation, 1000);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Global cleanup
  window.addEventListener('beforeunload', cleanup);

  // Expose minimal API for debugging
  window.WebTracker = {
    getSessionId: () => sessionId,
    getEventCount: () => events.length,
    flushEvents: () => flushEvents(),
    isActive: () => isActive
  };

})();