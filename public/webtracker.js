(function() {
  'use strict';
  
  console.log('🎯 WebTracker initialized');
  
  // Configuration
  const CONFIG = {
    API_ENDPOINT: '/api/sessions',
    HEATMAP_ENDPOINT: '/api/heatmaps',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    BATCH_SIZE: 50,
    BATCH_INTERVAL: 5000, // 5 seconds
    MOUSE_SAMPLE_RATE: 10, // Track every 10th mousemove
    SCROLL_THROTTLE: 100, // Throttle scroll events
    WEBSITE_DOMAIN: window.location.hostname + ':' + (window.location.port || (window.location.protocol === 'https:' ? '443' : '80'))
  };
  
  // State management
  const state = {
    sessionId: null,
    events: [],
    startTime: Date.now(),
    lastActivity: Date.now(),
    mouseMoveCounter: 0,
    isTracking: false,
    pageViews: 0,
    hasBeenActive: false
  };
  
  // Generate unique session ID
  function generateSessionId() {
    return 'wt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // Get or create session ID
  function getSessionId() {
    if (state.sessionId) {
      return state.sessionId;
    }
    
    // Try to get from sessionStorage first
    let sessionId = sessionStorage.getItem('webtracker_session_id');
    const sessionStart = sessionStorage.getItem('webtracker_session_start');
    
    // Check if session is still valid (not expired)
    if (sessionId && sessionStart) {
      const elapsed = Date.now() - parseInt(sessionStart);
      if (elapsed < CONFIG.SESSION_TIMEOUT) {
        state.sessionId = sessionId;
        state.startTime = parseInt(sessionStart);
        console.log('🎯 Resumed existing session:', sessionId);
        return sessionId;
      }
    }
    
    // Create new session
    sessionId = generateSessionId();
    state.sessionId = sessionId;
    state.startTime = Date.now();
    
    sessionStorage.setItem('webtracker_session_id', sessionId);
    sessionStorage.setItem('webtracker_session_start', state.startTime.toString());
    
    console.log('🎯 Created new session:', sessionId);
    return sessionId;
  }
  
  // Add event to queue
  function addEvent(eventData) {
    const event = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      url: window.location.pathname + window.location.search,
      ...eventData
    };
    
    state.events.push(event);
    state.lastActivity = Date.now();
    
    // Auto-flush if batch is full
    if (state.events.length >= CONFIG.BATCH_SIZE) {
      flushEvents();
    }
  }
  
  // Send events to server
  async function flushEvents() {
    if (state.events.length === 0) return;
    
    const eventsToSend = [...state.events];
    state.events = []; // Clear the queue immediately
    
    const sessionData = {
      session_id: getSessionId(),
      website_domain: CONFIG.WEBSITE_DOMAIN,
      user_agent: navigator.userAgent,
      events: eventsToSend,
      duration: Date.now() - state.startTime,
      page_views: state.pageViews
    };
    
    console.log('🎯 Sending session data:', {
      session_id: sessionData.session_id,
      events_count: eventsToSend.length,
      duration: sessionData.duration,
      page_views: sessionData.page_views
    });
    
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Session data sent successfully:', result);
        
        // Also send heatmap data
        await sendHeatmapData(eventsToSend);
      } else {
        console.error('❌ Failed to send session data:', response.status, response.statusText);
        // Put events back in queue for retry
        state.events.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error('❌ Network error sending session data:', error);
      // Put events back in queue for retry
      state.events.unshift(...eventsToSend);
    }
  }
  
  // Send heatmap data
  async function sendHeatmapData(events) {
    const heatmapData = {
      website_domain: CONFIG.WEBSITE_DOMAIN,
      page_url: window.location.pathname + window.location.search,
      events: events
    };
    
    try {
      const response = await fetch(CONFIG.HEATMAP_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heatmapData)
      });
      
      if (response.ok) {
        console.log('✅ Heatmap data sent successfully');
      } else {
        console.error('❌ Failed to send heatmap data:', response.status);
      }
    } catch (error) {
      console.error('❌ Network error sending heatmap data:', error);
    }
  }
  
  // Track mouse clicks
  function trackClick(event) {
    if (!state.isTracking) return;
    
    const element = event.target;
    const elementInfo = element.tagName.toLowerCase() + 
      (element.id ? '#' + element.id : '') +
      (element.className ? '.' + element.className.replace(/\s+/g, '.') : '');
    
    addEvent({
      type: 'click',
      x: event.clientX,
      y: event.clientY,
      element: elementInfo,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight
    });
    
    console.log('🖱️ Click tracked:', { x: event.clientX, y: event.clientY, element: elementInfo });
  }
  
  // Track mouse movement (sampled)
  function trackMouseMove(event) {
    if (!state.isTracking) return;
    
    state.mouseMoveCounter++;
    if (state.mouseMoveCounter % CONFIG.MOUSE_SAMPLE_RATE !== 0) return;
    
    addEvent({
      type: 'mousemove',
      x: event.clientX,
      y: event.clientY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  }
  
  // Track scroll events (throttled)
  let scrollTimeout = null;
  function trackScroll() {
    if (!state.isTracking) return;
    
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      addEvent({
        type: 'scroll',
        scrollTop: window.scrollY,
        scrollLeft: window.scrollX,
        scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        pageWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight
      });
      
      scrollTimeout = null;
    }, CONFIG.SCROLL_THROTTLE);
  }
  
  // Track page views
  function trackPageView() {
    state.pageViews++;
    
    addEvent({
      type: 'pageview',
      referrer: document.referrer || '',
      title: document.title || '',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight
    });
    
    console.log('📄 Page view tracked:', window.location.pathname);
  }
  
  // Track window resize
  function trackResize() {
    if (!state.isTracking) return;
    
    addEvent({
      type: 'resize',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight
    });
  }
  
  // Start tracking
  function startTracking() {
    if (state.isTracking) return;
    
    console.log('🎯 Starting WebTracker');
    state.isTracking = true;
    
    // Initialize session
    getSessionId();
    
    // Track initial page view
    trackPageView();
    
    // Event listeners
    document.addEventListener('click', trackClick, { passive: true });
    document.addEventListener('mousemove', trackMouseMove, { passive: true });
    window.addEventListener('scroll', trackScroll, { passive: true });
    window.addEventListener('resize', trackResize, { passive: true });
    
    // Periodic flush
    setInterval(flushEvents, CONFIG.BATCH_INTERVAL);
    
    // Flush on page unload
    window.addEventListener('beforeunload', flushEvents);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        flushEvents();
      } else {
        state.lastActivity = Date.now();
      }
    });
    
    // Session timeout check
    setInterval(() => {
      const timeSinceActivity = Date.now() - state.lastActivity;
      if (timeSinceActivity > CONFIG.SESSION_TIMEOUT) {
        console.log('🎯 Session timeout, creating new session');
        state.sessionId = null;
        sessionStorage.removeItem('webtracker_session_id');
        sessionStorage.removeItem('webtracker_session_start');
      }
    }, 60000); // Check every minute
    
    console.log('✅ WebTracker started successfully');
  }
  
  // Stop tracking
  function stopTracking() {
    if (!state.isTracking) return;
    
    console.log('🎯 Stopping WebTracker');
    state.isTracking = false;
    
    // Remove event listeners
    document.removeEventListener('click', trackClick);
    document.removeEventListener('mousemove', trackMouseMove);
    window.removeEventListener('scroll', trackScroll);
    window.removeEventListener('resize', trackResize);
    
    // Final flush
    flushEvents();
    
    console.log('🛑 WebTracker stopped');
  }
  
  // Public API
  window.WebTracker = {
    start: startTracking,
    stop: stopTracking,
    flush: flushEvents,
    getSessionId: getSessionId,
    addEvent: addEvent
  };
  
  // Auto-start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTracking);
  } else {
    startTracking();
  }
  
  // Handle page navigation in SPAs
  let currentUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      trackPageView();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
})();