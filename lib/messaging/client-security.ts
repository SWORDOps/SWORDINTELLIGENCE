/**
 * Client-Side Security for Real-Time Messaging
 *
 * Advanced OPSEC and anti-forensics:
 * - Screenshot detection
 * - Clipboard monitoring
 * - Screen recording detection
 * - Browser fingerprinting resistance
 * - Memory clearing on message deletion
 */

/**
 * Screenshot detection
 * Detects when user takes a screenshot (best effort, OS-dependent)
 */
export class ScreenshotDetector {
  private listeners: Array<() => void> = [];
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupDetection();
    }
  }

  /**
   * Setup screenshot detection
   */
  private setupDetection(): void {
    // Method 1: Detect canvas toDataURL calls (common screenshot method)
    this.canvas = document.createElement('canvas');
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      // Alert listeners
      this.notifyListeners();
      return originalToDataURL.apply(this, args as any);
    }.bind(this);

    // Method 2: Detect keyboard shortcuts (Cmd+Shift+4 on Mac, PrtScn on Windows)
    window.addEventListener('keydown', (e) => {
      // Mac: Cmd+Shift+3 or Cmd+Shift+4
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) {
        this.notifyListeners();
      }

      // Windows: Print Screen
      if (e.key === 'PrintScreen') {
        this.notifyListeners();
      }

      // Windows: Windows+Shift+S (Snipping Tool)
      if (e.metaKey && e.shiftKey && e.key === 's') {
        this.notifyListeners();
      }
    });

    // Method 3: Detect visibility change (screenshot tools often hide browser)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Browser hidden - possible screenshot tool
        setTimeout(() => {
          if (!document.hidden) {
            // Returned quickly - suspicious
            this.notifyListeners();
          }
        }, 100);
      }
    });
  }

  /**
   * Register screenshot detection callback
   */
  onScreenshot(callback: () => void): void {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }
}

/**
 * Clipboard monitoring
 * Detects when user copies message content
 */
export class ClipboardMonitor {
  private listeners: Array<(text: string) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupMonitoring();
    }
  }

  /**
   * Setup clipboard monitoring
   */
  private setupMonitoring(): void {
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const copiedText = selection.toString();
        this.notifyListeners(copiedText);
      }
    });

    document.addEventListener('cut', (e) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const cutText = selection.toString();
        this.notifyListeners(cutText);
      }
    });
  }

  /**
   * Register clipboard event callback
   */
  onCopy(callback: (text: string) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(text: string): void {
    this.listeners.forEach(cb => cb(text));
  }
}

/**
 * Screen recording detection
 * Detects if screen is being recorded (best effort)
 */
export class ScreenRecordingDetector {
  private listeners: Array<() => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupDetection();
    }
  }

  /**
   * Setup screen recording detection
   */
  private setupDetection(): void {
    // Method 1: Check for screen capture API usage
    if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
      // Monitor for screen capture starts
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;

      (navigator.mediaDevices as any).getDisplayMedia = async function(...args: any[]) {
        this.notifyListeners();
        return originalGetDisplayMedia.apply(navigator.mediaDevices, args);
      }.bind(this);
    }

    // Method 2: Monitor for performance degradation (recording uses CPU)
    this.checkInterval = setInterval(() => {
      if ('performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;

        // Unusual memory patterns might indicate recording
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          // High memory usage - possible recording
          this.notifyListeners();
        }
      }
    }, 5000);
  }

  /**
   * Register recording detection callback
   */
  onRecording(callback: () => void): void {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

/**
 * Browser fingerprinting resistance
 * Adds noise to fingerprinting vectors
 */
export class FingerprintResistance {
  /**
   * Add noise to canvas fingerprinting
   */
  static obfuscateCanvas(): void {
    if (typeof window === 'undefined') return;

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    CanvasRenderingContext2D.prototype.getImageData = function(...args: any[]) {
      const imageData = originalGetImageData.apply(this, args as any);

      // Add subtle noise to prevent fingerprinting
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Add random noise to alpha channel only (less visible)
        if (Math.random() < 0.001) {
          imageData.data[i + 3] = Math.floor(Math.random() * 5);
        }
      }

      return imageData;
    };
  }

  /**
   * Add noise to WebGL fingerprinting
   */
  static obfuscateWebGL(): void {
    if (typeof window === 'undefined') return;

    const getParameter = WebGLRenderingContext.prototype.getParameter;

    WebGLRenderingContext.prototype.getParameter = function(parameter: number) {
      const result = getParameter.call(this, parameter);

      // Add noise to specific parameters used for fingerprinting
      if (
        parameter === this.ALIASED_LINE_WIDTH_RANGE ||
        parameter === this.ALIASED_POINT_SIZE_RANGE
      ) {
        // Return slightly modified values
        if (Array.isArray(result)) {
          return result.map(v => v + Math.random() * 0.001);
        }
      }

      return result;
    };
  }

  /**
   * Spoof user agent
   */
  static spoofUserAgent(): string {
    const platforms = [
      'Win32',
      'MacIntel',
      'Linux x86_64',
    ];

    const browsers = [
      'Chrome/120.0.0.0',
      'Firefox/121.0',
      'Safari/17.2',
    ];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];

    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}`;
  }
}

/**
 * Secure memory clearing
 * Overwrites message data in memory before deletion
 */
export class SecureMemory {
  /**
   * Securely clear string from memory (best effort in JavaScript)
   */
  static clearString(str: string): void {
    // In JavaScript, we can't directly overwrite strings in memory
    // But we can clear references and hope GC picks it up
    str = '';

    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Securely clear object from memory
   */
  static clearObject(obj: any): void {
    if (typeof obj !== 'object') return;

    // Recursively clear all properties
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = '';
        } else if (typeof obj[key] === 'object') {
          this.clearObject(obj[key]);
        } else {
          obj[key] = null;
        }
      }
    }
  }

  /**
   * Securely clear array
   */
  static clearArray(arr: any[]): void {
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'string') {
        arr[i] = '';
      } else if (typeof arr[i] === 'object') {
        this.clearObject(arr[i]);
      } else {
        arr[i] = null;
      }
    }
    arr.length = 0;
  }
}

/**
 * Anti-debugging measures
 * Detect if developer tools are open
 */
export class AntiDebugging {
  private listeners: Array<() => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupDetection();
    }
  }

  /**
   * Setup debugging detection
   */
  private setupDetection(): void {
    // Method 1: Console timing check
    let devtoolsOpen = false;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          this.notifyListeners();
        }
      } else {
        devtoolsOpen = false;
      }
    };

    // Method 2: Debugger statement detection
    setInterval(() => {
      const before = Date.now();
      debugger; // Will pause if devtools open
      const after = Date.now();

      if (after - before > 100) {
        // Debugger was triggered
        this.notifyListeners();
      }
    }, 1000);

    // Check window size periodically
    this.checkInterval = setInterval(detectDevTools, 500);
    window.addEventListener('resize', detectDevTools);
  }

  /**
   * Register debugging detection callback
   */
  onDebugDetected(callback: () => void): void {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

/**
 * Initialize all client-side security measures
 */
export function initializeClientSecurity(callbacks: {
  onScreenshot?: () => void;
  onCopy?: (text: string) => void;
  onRecording?: () => void;
  onDebugDetected?: () => void;
}) {
  // Screenshot detection
  if (callbacks.onScreenshot) {
    const screenshotDetector = new ScreenshotDetector();
    screenshotDetector.onScreenshot(callbacks.onScreenshot);
  }

  // Clipboard monitoring
  if (callbacks.onCopy) {
    const clipboardMonitor = new ClipboardMonitor();
    clipboardMonitor.onCopy(callbacks.onCopy);
  }

  // Screen recording detection
  if (callbacks.onRecording) {
    const recordingDetector = new ScreenRecordingDetector();
    recordingDetector.onRecording(callbacks.onRecording);
  }

  // Anti-debugging
  if (callbacks.onDebugDetected) {
    const antiDebug = new AntiDebugging();
    antiDebug.onDebugDetected(callbacks.onDebugDetected);
  }

  // Fingerprinting resistance
  FingerprintResistance.obfuscateCanvas();
  FingerprintResistance.obfuscateWebGL();
}
