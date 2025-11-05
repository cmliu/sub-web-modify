/**
 * Performance utilities for UI optimization
 */

// Debounce function for expensive handlers
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for high-frequency events
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if device is low-end
export function isLowEndDevice() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for low memory devices (rough heuristic)
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  
  // Check for slow connection
  const slowConnection = navigator.connection && 
    (navigator.connection.effectiveType === 'slow-2g' || 
     navigator.connection.effectiveType === '2g' ||
     navigator.connection.effectiveType === '3g');
  
  // Check for low-end CPU (rough heuristic)
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  return prefersReducedMotion || lowMemory || slowConnection || lowCores;
}

// Auto-enable performance mode on low-end devices
export function autoEnablePerformanceMode() {
  if (isLowEndDevice()) {
    const savedPerfMode = localStorage.getItem('performanceMode');
    if (savedPerfMode !== 'false') { // Only auto-enable if not explicitly disabled
      return true;
    }
  }
  return false;
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }
  
  startMonitoring() {
    // Monitor FPS
    this.monitorFPS();
    
    // Monitor long tasks
    this.monitorLongTasks();
    
    // Monitor layout shifts
    this.monitorLayoutShift();
  }
  
  monitorFPS() {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.metrics.fps = fps;
        frames = 0;
        lastTime = currentTime;
        
        // Auto-enable performance mode if FPS is consistently low
        if (fps < 30 && !document.body.classList.contains('performance-mode')) {
          this.suggestPerformanceMode();
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }
  
  monitorLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }
  
  monitorLayoutShift() {
    if ('PerformanceObserver' in window) {
      let clsScore = 0;
      
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        
        this.metrics.cumulativeLayoutShift = clsScore;
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }
  
  suggestPerformanceMode() {
    const suggestion = document.createElement('div');
    suggestion.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 122, 255, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      max-width: 280px;
      backdrop-filter: blur(10px);
    `;
    suggestion.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span>⚡ 性能建议</span>
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        检测到性能问题，建议开启性能模式以获得更流畅的体验。
      </div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <button id="enable-perf" style="background: white; color: #007AFF; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">开启</button>
        <button id="dismiss-perf" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">忽略</button>
      </div>
    `;
    
    document.body.appendChild(suggestion);
    
    document.getElementById('enable-perf').onclick = () => {
      document.body.classList.add('performance-mode');
      localStorage.setItem('performanceMode', 'true');
      document.body.removeChild(suggestion);
      window.location.reload(); // Reload to apply changes
    };
    
    document.getElementById('dismiss-perf').onclick = () => {
      document.body.removeChild(suggestion);
    };
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(suggestion)) {
        document.body.removeChild(suggestion);
      }
    }, 10000);
  }
  
  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
  
  getMetrics() {
    return this.metrics;
  }
}