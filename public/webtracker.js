(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE_URL: window.location.origin,
    TRACKING_ENABLED: true,
    SAMPLE_RATE: 100,
    MAX_SESSION_DURATION: 30 * 60 * 1000, // 30 minutes
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
    BATCH_SIZE: 10,
    DEBUG: false
  };

  // State management
  let sessionId = null;
  let sessionStartTime = Date.now();
  let lastActivityTime = Date.now();
  let eventQueue = [];
  let isTracking = false;
  let heartbeatTimer = null;

  // Utility functions
  function log(message, data = null) {
    if (CONFIG.DEBUG) {
      console.log('[WebTracker]', message, data);
    }
  }

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function getElementPath(element) {
    if (!element || element === document.body) return 'body';
    
    let path = [];
    while (element && element !== document.body) {
      let selector = element.tagName.toLowerCase();
      
      if (element.id) {
        selector += '#' + element.id;
        path.unshift(selector);
        break;
      }
      
      if (element.className) {
        const classes = element.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).join('.');
        }
      }
      
      path.unshift(selector);
      element = element.parentElement;
      
      if (path.length > 5) break; // Limit path depth
    }
    
    return path.join(' > ');
  }

  function createEvent(type, data = {}) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: Date.now(),
      url: window.location.href,
      ...data
    };
  }

  function addToQueue(event) {
    eventQueue.push(event);
    lastActivityTime = Date.now();
    
    if (eventQueue.length >= CONFIG.BATCH_SIZE) {
      flushEvents();
    }
  }

  async function flushEvents() {
    if (eventQueue.length === 0 || !sessionId) return;
    
    const events = [...eventQueue];
    eventQueue = [];
    
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          events: events,
          website_domain: window.location.hostname
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      log('Events flushed successfully', { count: events.length });
    } catch (error) {
      log('Failed to flush events', error);
      // Re-add events to queue for retry
      eventQueue.unshift(...events);
    }
  }

  async function startSession() {
    sessionId = generateSessionId();
    sessionStartTime = Date.now();
    
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'start',
          website_domain: window.location.hostname,
          user_agent: navigator.userAgent,
          page_url: window.location.pathname,
          referrer: document.referrer
        })
      });
      
      if (response.ok) {
        log('Session started', { sessionId });
        isTracking = true;
        startHeartbeat();
      }
    } catch (error) {
      log('Failed to start session', error);
    }
  }

  function startHeartbeat() {
    heartbeatTimer = setInterval(() => {
      const now = Date.now();
      const sessionDuration = now - sessionStartTime;
      const timeSinceActivity = now - lastActivityTime;
      
      // End session if inactive for too long or max duration reached
      if (timeSinceActivity > CONFIG.MAX_SESSION_DURATION || sessionDuration > CONFIG.MAX_SESSION_DURATION) {
        endSession();
        return;
      }
      
      // Send heartbeat event
      addToQueue(createEvent('heartbeat', {
        duration: sessionDuration,
        timeSinceActivity
      }));
      
      flushEvents();
    }, CONFIG.HEARTBEAT_INTERVAL);
  }

  async function endSession() {
    if (!isTracking || !sessionId) return;
    
    isTracking = false;
    clearInterval(heartbeatTimer);
    
    // Flush remaining events
    await flushEvents();
    
    try {
      await fetch(`${CONFIG.API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'end',
          duration: Date.now() - sessionStartTime
        })
      });
      
      log('Session ended', { sessionId });
    } catch (error) {
      log('Failed to end session', error);
    }
    
    sessionId = null;
  }

  // Event listeners
  function setupEventListeners() {
    // Mouse events
    let mouseMoveTimeout;
    document.addEventListener('mousemove', (e) => {
      if (!isTracking) return;
      
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        addToQueue(createEvent('mousemove', {
          x: e.clientX,
          y: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY
        }));
      }, 100); // Throttle mousemove events
    });

    document.addEventListener('click', (e) => {
      if (!isTracking) return;
      
      addToQueue(createEvent('click', {
        x: e.clientX,
        y: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        element: getElementPath(e.target),
        button: e.button
      }));
    });

    // Scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!isTracking) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        addToQueue(createEvent('scroll', {
          scrollTop: window.pageYOffset,
          scrollLeft: window.pageXOffset,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          pageWidth: document.documentElement.scrollWidth,
          pageHeight: document.documentElement.scrollHeight
        }));
      }, 250); // Throttle scroll events
    });

    // Page events
    window.addEventListener('resize', () => {
      if (!isTracking) return;
      
      addToQueue(createEvent('resize', {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      }));
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (!isTracking) return;
      
      addToQueue(createEvent('visibility', {
        hidden: document.hidden
      }));
    });

    // Page navigation
    window.addEventListener('beforeunload', () => {
      if (isTracking) {
        endSession();
      }
    });

    // History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      if (isTracking) {
        addToQueue(createEvent('pageview', {
          url: window.location.href,
          type: 'pushState'
        }));
      }
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      if (isTracking) {
        addToQueue(createEvent('pageview', {
          url: window.location.href,
          type: 'replaceState'
        }));
      }
    };

    window.addEventListener('popstate', () => {
      if (isTracking) {
        addToQueue(createEvent('pageview', {
          url: window.location.href,
          type: 'popstate'
        }));
      }
    });
  }

  // Initialization
  function init() {
    if (!CONFIG.TRACKING_ENABLED) {
      log('Tracking disabled');
      return;
    }

    // Check sampling rate
    if (Math.random() * 100 > CONFIG.SAMPLE_RATE) {
      log('Session skipped due to sampling rate');
      return;
    }

    log('Initializing WebTracker');
    
    // Setup event listeners
    setupEventListeners();
    
    // Start tracking when page is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startSession);
    } else {
      startSession();
    }

    // Initial page view
    if (isTracking) {
      addToQueue(createEvent('pageview', {
        url: window.location.href,
        referrer: document.referrer,
        type: 'initial'
      }));
    }
  }

  // Public API
  window.WebTracker = {
    start: startSession,
    stop: endSession,
    flush: flushEvents,
    config: CONFIG
  };

  // Auto-initialize
  init();
})();