// WebRTC Audio Bridge utility
export class WebRTCAudioBridge {
  private audioContext: AudioContext | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isMuted = false;
  private volume = 1;

  async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  async initializeCall(callId: string, options?: any): Promise<void> {
    await this.initializeAudio();
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  setRemoteStream(stream: MediaStream): void {
    this.remoteStream = stream;
  }

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.localStream = await navigator.mediaDevices.getUserMedia({ 
      audio: { deviceId: { exact: deviceId } } 
    });
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  disconnect(): void {
    this.cleanup();
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export class AudioDeviceManager {
  static async getDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
  }

  static async switchDevice(deviceId: string): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({ 
      audio: { deviceId: { exact: deviceId } } 
    });
  }
}

export const webRTCAudioBridge = new WebRTCAudioBridge();