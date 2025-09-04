(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_ENDPOINT: '/api',
    SESSION_STORAGE_KEY: 'webtracker_session_id',
    BATCH_SIZE: 50,
    FLUSH_INTERVAL: 5000, // 5 seconds
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    SAMPLE_RATE: 100, // Percentage of sessions to track
    MAX_EVENTS: 1000
  };

  // Global state
  let sessionId = null;
  let events = [];
  let flushTimer = null;
  let lastActivity = Date.now();
  let isTracking = false;
  let websiteDomain = '';

  // Utility functions
  function generateSessionId() {
    return 'wt_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
  }

  function getSessionId() {
    if (sessionId) return sessionId;
    
    // Try to get existing session from storage
    const stored = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Date.now() - data.lastActivity < CONFIG.SESSION_TIMEOUT) {
          sessionId = data.sessionId;
          return sessionId;
        }
      } catch (e) {
        console.warn('Failed to parse stored session data');
      }
    }
    
    // Generate new session ID
    sessionId = generateSessionId();
    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify({
      sessionId: sessionId,
      lastActivity: Date.now()
    }));
    
    return sessionId;
  }

  function updateLastActivity() {
    lastActivity = Date.now();
    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, JSON.stringify({
      sessionId: getSessionId(),
      lastActivity: lastActivity
    }));
  }

  function shouldTrack() {
    return Math.random() * 100 < CONFIG.SAMPLE_RATE;
  }

  function addEvent(eventData) {
    if (!isTracking) return;
    
    const event = {
      id: 'evt_' + Math.random().toString(36).substr(2, 12),
      timestamp: Date.now(),
      url: window.location.pathname + window.location.search,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pageWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      pageHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      ...eventData
    };

    events.push(event);
    updateLastActivity();

    // Limit events to prevent memory issues
    if (events.length > CONFIG.MAX_EVENTS) {
      events = events.slice(-CONFIG.MAX_EVENTS);
    }

    // Auto-flush if batch size reached
    if (events.length >= CONFIG.BATCH_SIZE) {
      flushEvents();
    }
  }

  async function flushEvents() {
    if (events.length === 0) return;

    const eventsToSend = [...events];
    events = []; // Clear the events array immediately

    try {
      console.log('Flushing', eventsToSend.length, 'events to API');
      
      const response = await fetch(`${CONFIG.API_ENDPOINT}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: getSessionId(),
          website_domain: websiteDomain,
          user_agent: navigator.userAgent,
          events: eventsToSend
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Session data saved:', result.action, result.sessionId);
        
        // Also update heatmap data
        await updateHeatmapData(eventsToSend);
      } else {
        console.error('Failed to send session data:', response.status, response.statusText);
        // Put events back if failed to send
        events = [...eventsToSend, ...events];
      }
    } catch (error) {
      console.error('Error sending session data:', error);
      // Put events back if failed to send
      events = [...eventsToSend, ...events];
    }
  }

  async function updateHeatmapData(sessionEvents) {
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/heatmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          website_domain: websiteDomain,
          page_url: window.location.pathname,
          events: sessionEvents
        })
      });

      if (response.ok) {
        console.log('Heatmap data updated successfully');
      } else {
        console.error('Failed to update heatmap data:', response.status);
      }
    } catch (error) {
      console.error('Error updating heatmap data:', error);
    }
  }

  function startFlushTimer() {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(flushEvents, CONFIG.FLUSH_INTERVAL);
  }

  function stopFlushTimer() {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  }

  // Event listeners
  function attachEventListeners() {
    // Page view tracking
    addEvent({
      type: 'pageview',
      referrer: document.referrer
    });

    // Click tracking
    document.addEventListener('click', function(e) {
      addEvent({
        type: 'click',
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
        element: e.target.tagName.toLowerCase(),
        elementId: e.target.id,
        elementClass: e.target.className
      });
    });

    // Mouse movement tracking (sampled)
    let mouseMoveCounter = 0;
    document.addEventListener('mousemove', function(e) {
      mouseMoveCounter++;
      // Sample every 10th mouse move to reduce data volume
      if (mouseMoveCounter % 10 === 0) {
        addEvent({
          type: 'mousemove',
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY
        });
      }
    });

    // Scroll tracking
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        addEvent({
          type: 'scroll',
          scrollTop: window.pageYOffset || document.documentElement.scrollTop,
          scrollLeft: window.pageXOffset || document.documentElement.scrollLeft
        });
      }, 100); // Debounce scroll events
    });

    // Window resize tracking
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        addEvent({
          type: 'resize'
        });
      }, 250); // Debounce resize events
    });

    // Page unload - flush remaining events
    window.addEventListener('beforeunload', function() {
      if (events.length > 0) {
        // Use sendBeacon for reliable delivery during page unload
        const payload = JSON.stringify({
          session_id: getSessionId(),
          website_domain: websiteDomain,
          user_agent: navigator.userAgent,
          events: events
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(`${CONFIG.API_ENDPOINT}/sessions`, payload);
        } else {
          // Fallback for browsers without sendBeacon
          flushEvents();
        }
      }
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        flushEvents();
        stopFlushTimer();
      } else {
        updateLastActivity();
        startFlushTimer();
      }
    });
  }

  // Initialize tracking
  function init() {
    // Get website domain from current location
    websiteDomain = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    
    console.log('WebTracker initialized for domain:', websiteDomain);

    // Check if we should track this session
    if (!shouldTrack()) {
      console.log('Session not selected for tracking (sample rate: ' + CONFIG.SAMPLE_RATE + '%)');
      return;
    }

    isTracking = true;
    console.log('WebTracker active - Session ID:', getSessionId());

    // Attach event listeners
    attachEventListeners();

    // Start the flush timer
    startFlushTimer();

    // Initial flush after a short delay to establish the session
    setTimeout(flushEvents, 1000);
  }

  // Public API
  window.WebTracker = {
    init: init,
    flush: flushEvents,
    addEvent: addEvent,
    getSessionId: getSessionId,
    isTracking: function() { return isTracking; }
  };

  // Auto-initialize when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

})();