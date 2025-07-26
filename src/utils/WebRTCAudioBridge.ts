export class WebRTCAudioBridge {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private callControlId: string | null = null;

  constructor(
    private onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    private onRemoteStream: (stream: MediaStream) => void
  ) {
    this.setupRemoteAudio();
  }

  private setupRemoteAudio() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    this.remoteAudio.playsInline = true;
    document.body.appendChild(this.remoteAudio);
  }

  async initializeCall(callControlId: string): Promise<void> {
    this.callControlId = callControlId;
    
    // Create peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Set up connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event);
      const [remoteStream] = event.streams;
      if (this.remoteAudio && remoteStream) {
        this.remoteAudio.srcObject = remoteStream;
        this.onRemoteStream(remoteStream);
      }
    };

    // Get local media stream
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      console.log('Local media stream initialized');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access microphone');
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  setMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  setVolume(volume: number): void {
    if (this.remoteAudio) {
      this.remoteAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  disconnect(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Remove remote audio element
    if (this.remoteAudio) {
      this.remoteAudio.remove();
      this.remoteAudio = null;
    }

    this.callControlId = null;
  }
}

export class AudioDeviceManager {
  private static instance: AudioDeviceManager;
  
  static getInstance(): AudioDeviceManager {
    if (!AudioDeviceManager.instance) {
      AudioDeviceManager.instance = new AudioDeviceManager();
    }
    return AudioDeviceManager.instance;
  }

  async getAudioDevices(): Promise<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return { microphones: [], speakers: [] };
    }
  }

  async switchAudioDevice(deviceId: string, type: 'input' | 'output'): Promise<void> {
    if (type === 'input') {
      // Switching microphone requires recreating the stream
      // This would be handled by the WebRTCAudioBridge
      console.log('Switching to microphone:', deviceId);
    } else {
      // Switch speaker/output device
      const audioElements = document.querySelectorAll('audio');
      for (const audio of audioElements) {
        if ('setSinkId' in audio) {
          try {
            await (audio as any).setSinkId(deviceId);
          } catch (error) {
            console.error('Error switching audio output device:', error);
          }
        }
      }
    }
  }

  async testMicrophone(): Promise<number> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      return new Promise((resolve) => {
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          resolve(average);
        };
        
        setTimeout(checkLevel, 1000);
      });
    } catch (error) {
      console.error('Error testing microphone:', error);
      return 0;
    }
  }
}