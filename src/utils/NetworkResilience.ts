import { WebRTCAudioBridge } from './WebRTCAudioBridge';
import { supabase } from '@/integrations/supabase/client';

export class NetworkResilience {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isReconnecting = false;
  private callControlId: string | null = null;
  private onConnectionLost?: () => void;
  private onConnectionRestored?: () => void;
  private qualityMonitorInterval?: NodeJS.Timeout;

  constructor(options?: {
    onConnectionLost?: () => void;
    onConnectionRestored?: () => void;
  }) {
    this.onConnectionLost = options?.onConnectionLost;
    this.onConnectionRestored = options?.onConnectionRestored;
    this.setupNetworkMonitoring();
  }

  setActiveCall(callControlId: string) {
    this.callControlId = callControlId;
    this.startQualityMonitoring();
  }

  clearActiveCall() {
    this.callControlId = null;
    this.stopQualityMonitoring();
  }

  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.handleConnectionRestored();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.handleConnectionLost();
    });

    // Monitor WebRTC connection state
    const bridge = WebRTCAudioBridge.getInstance();
    bridge.onConnectionStateChange((state) => {
      console.log('WebRTC connection state:', state);
      
      if (state === 'disconnected' || state === 'failed') {
        this.handleConnectionLost();
      } else if (state === 'connected') {
        this.handleConnectionRestored();
      }
    });

    // Monitor Supabase realtime connection
    supabase.realtime.onConnectionStateChange((state) => {
      console.log('Supabase realtime state:', state);
      
      if (state === 'CLOSED' || state === 'CHANNEL_ERROR') {
        this.handleConnectionLost();
      } else if (state === 'OPEN') {
        this.handleConnectionRestored();
      }
    });
  }

  private async handleConnectionLost() {
    if (this.isReconnecting) return;
    
    console.log('Connection lost - starting recovery');
    this.onConnectionLost?.();
    
    if (this.callControlId) {
      await this.attemptCallRecovery();
    }
  }

  private async handleConnectionRestored() {
    console.log('Connection restored');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.isReconnecting = false;
    this.onConnectionRestored?.();
  }

  private async attemptCallRecovery() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting call recovery (attempt ${this.reconnectAttempts})`);

    try {
      // Check if call is still active on Telnyx
      const callStatus = await this.checkCallStatus(this.callControlId!);
      
      if (callStatus.active) {
        // Re-establish WebRTC connection
        const bridge = WebRTCAudioBridge.getInstance();
        await bridge.reconnect(this.callControlId!);
        
        console.log('Call recovery successful');
        this.handleConnectionRestored();
      } else {
        console.log('Call is no longer active on server');
        this.callControlId = null;
      }
    } catch (error) {
      console.error('Call recovery failed:', error);
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
      
      setTimeout(() => {
        this.isReconnecting = false;
        this.attemptCallRecovery();
      }, this.reconnectDelay);
    }
  }

  private async checkCallStatus(callControlId: string): Promise<{ active: boolean }> {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-call-status', {
        body: { callControlId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking call status:', error);
      return { active: false };
    }
  }

  private startQualityMonitoring() {
    this.qualityMonitorInterval = setInterval(() => {
      this.monitorCallQuality();
    }, 5000); // Check every 5 seconds
  }

  private stopQualityMonitoring() {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = undefined;
    }
  }

  private async monitorCallQuality() {
    try {
      const bridge = WebRTCAudioBridge.getInstance();
      const stats = await bridge.getConnectionStats();
      
      // Monitor key metrics
      const { packetsLost, jitter, roundTripTime, audioLevel } = stats;
      
      // Check for poor quality indicators
      const isQualityPoor = 
        packetsLost > 5 || // More than 5% packet loss
        jitter > 100 || // High jitter
        roundTripTime > 500 || // High latency
        audioLevel < 0.1; // Very low audio
      
      if (isQualityPoor) {
        console.warn('Poor call quality detected:', stats);
        await this.optimizeForPoorQuality();
      }
      
      // Store quality metrics
      await this.logQualityMetrics(stats);
    } catch (error) {
      console.error('Quality monitoring failed:', error);
    }
  }

  private async optimizeForPoorQuality() {
    const bridge = WebRTCAudioBridge.getInstance();
    
    // Reduce audio quality to improve connectivity
    await bridge.setAudioQuality('low');
    
    // Enable aggressive packet retransmission
    await bridge.enableAdaptiveMode(true);
    
    console.log('Optimized for poor quality connection');
  }

  private async logQualityMetrics(stats: any) {
    if (!this.callControlId) return;
    
    try {
      await supabase
        .from('call_quality_logs')
        .insert({
          call_control_id: this.callControlId,
          timestamp: new Date().toISOString(),
          packets_lost: stats.packetsLost,
          jitter: stats.jitter,
          round_trip_time: stats.roundTripTime,
          audio_level: stats.audioLevel,
          connection_state: stats.connectionState
        });
    } catch (error) {
      console.error('Failed to log quality metrics:', error);
    }
  }

  // Manual recovery trigger
  async forceReconnect() {
    if (!this.callControlId) return;
    
    console.log('Forcing call reconnection');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    await this.attemptCallRecovery();
  }

  // Get current network quality
  getNetworkQuality(): 'good' | 'fair' | 'poor' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === '4g' && connection.downlink > 2) {
        return 'good';
      } else if (connection.effectiveType === '3g' || connection.downlink > 0.5) {
        return 'fair';
      }
    }
    
    return 'poor';
  }

  cleanup() {
    this.stopQualityMonitoring();
    this.callControlId = null;
    this.isReconnecting = false;
  }
}