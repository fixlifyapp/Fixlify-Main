import { WebRTCAudioBridge } from './WebRTCAudioBridge';

export class MobileCallOptimizer {
  private audioContext: AudioContext | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private isIOS: boolean;
  private isAndroid: boolean;

  constructor() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
  }

  async optimizeForMobile() {
    await this.requestWakeLock();
    await this.optimizeAudioSettings();
    this.preventScreenSleep();
    this.optimizeNetworkHandling();
  }

  private async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen wake lock acquired');
      } catch (err) {
        console.warn('Could not acquire wake lock:', err);
      }
    }
  }

  private async optimizeAudioSettings() {
    try {
      // Request audio context with mobile-optimized settings
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 16000, // Lower sample rate for mobile
      });

      // iOS specific optimizations
      if (this.isIOS) {
        // Enable audio for iOS
        await this.enableIOSAudio();
      }

      // Android specific optimizations
      if (this.isAndroid) {
        await this.optimizeAndroidAudio();
      }
    } catch (error) {
      console.error('Audio optimization failed:', error);
    }
  }

  private async enableIOSAudio() {
    // iOS requires user interaction to enable audio
    // This should be called after a user gesture
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Set audio session category for VoIP
    if ('setCategory' in navigator.mediaSession) {
      try {
        (navigator.mediaSession as any).setCategory('playAndRecord');
      } catch (error) {
        console.warn('Could not set audio category:', error);
      }
    }
  }

  private async optimizeAndroidAudio() {
    // Android-specific audio optimizations
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        googAudioMirroring: false
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Store stream for later use
      return stream;
    } catch (error) {
      console.error('Android audio optimization failed:', error);
    }
  }

  private preventScreenSleep() {
    // Prevent screen from sleeping during calls
    const preventSleep = () => {
      const video = document.createElement('video');
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Create empty video track to keep screen awake
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx?.fillRect(0, 0, 1, 1);
      
      const stream = canvas.captureStream(1);
      video.srcObject = stream;
      
      return () => {
        document.body.removeChild(video);
      };
    };

    return preventSleep();
  }

  private optimizeNetworkHandling() {
    // Monitor network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      connection.addEventListener('change', () => {
        console.log('Network changed:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
        
        // Adjust call quality based on network
        this.adjustCallQuality(connection);
      });
    }

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('App went to background - maintaining call');
      } else {
        console.log('App came to foreground - checking call status');
      }
    });
  }

  private adjustCallQuality(connection: any) {
    const bridge = WebRTCAudioBridge.getInstance();
    
    if (connection.effectiveType === '2g' || connection.downlink < 0.5) {
      // Very poor connection - use lowest quality
      bridge.setAudioQuality('low');
    } else if (connection.effectiveType === '3g' || connection.downlink < 1.5) {
      // Moderate connection - use medium quality
      bridge.setAudioQuality('medium');
    } else {
      // Good connection - use high quality
      bridge.setAudioQuality('high');
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  cleanup() {
    this.releaseWakeLock();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Handle device orientation changes
  handleOrientationChange() {
    if (this.isIOS || this.isAndroid) {
      // Re-optimize audio after orientation change
      setTimeout(() => {
        this.optimizeAudioSettings();
      }, 500);
    }
  }

  // Enable background processing for calls
  enableBackgroundProcessing() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          // Register for background sync
          return (registration as any).sync.register('call-management');
        }
      });
    }
  }
}
