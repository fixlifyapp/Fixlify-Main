export class WebRTCAudioBridge {
  private audioContext: AudioContext | null = null;
  private devices: MediaDeviceInfo[] = [];
  private stream: MediaStream | null = null;
  private muted: boolean = false;
  private volume: number = 1;

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput');
      return this.devices;
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  async setAudioDevice(deviceId: string): Promise<void> {
    try {
      console.log('Setting audio device:', deviceId);
    } catch (error) {
      console.error('Error setting audio device:', error);
    }
  }

  async startAudio(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async initializeCall(callId: string, metadata: any): Promise<void> {
    try {
      console.log('Initializing call:', callId, metadata);
    } catch (error) {
      console.error('Error initializing call:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      await this.stopAudio();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export class AudioDeviceManager {
  private bridge: WebRTCAudioBridge;
  private static instance: AudioDeviceManager;

  constructor() {
    this.bridge = new WebRTCAudioBridge();
  }

  static getInstance(): AudioDeviceManager {
    if (!AudioDeviceManager.instance) {
      AudioDeviceManager.instance = new AudioDeviceManager();
    }
    return AudioDeviceManager.instance;
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    return this.bridge.getAudioDevices();
  }

  async setDevice(deviceId: string): Promise<void> {
    return this.bridge.setAudioDevice(deviceId);
  }

  switchAudioDevice(deviceId: string): void {
    this.setDevice(deviceId);
  }

  testMicrophone(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export const audioBridge = new WebRTCAudioBridge();