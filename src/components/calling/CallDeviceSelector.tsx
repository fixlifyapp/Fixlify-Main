import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Settings, Mic, Volume2, TestTube } from 'lucide-react';
import { AudioDeviceManager } from '@/utils/WebRTCAudioBridge';
import { toast } from 'sonner';

interface CallDeviceSelectorProps {
  open: boolean;
  onClose: () => void;
}

export const CallDeviceSelector = ({
  open,
  onClose
}: CallDeviceSelectorProps) => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('default');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('default');
  const [microphoneVolume, setMicrophoneVolume] = useState([100]);
  const [speakerVolume, setSpeakerVolume] = useState([100]);
  const [isTesting, setIsTesting] = useState(false);
  const [audioDeviceManager] = useState(() => AudioDeviceManager.getInstance());

  useEffect(() => {
    if (open) {
      loadAudioDevices();
    }
  }, [open]);

  const loadAudioDevices = async () => {
    try {
      const devices = await audioDeviceManager.getAudioDevices();
      setMicrophones(devices.microphones);
      setSpeakers(devices.speakers);
    } catch (error) {
      console.error('Error loading audio devices:', error);
      toast.error('Failed to load audio devices');
    }
  };

  const handleMicrophoneChange = async (deviceId: string) => {
    try {
      setSelectedMicrophone(deviceId);
      await audioDeviceManager.switchAudioDevice(deviceId, 'input');
      toast.success('Microphone changed successfully');
    } catch (error) {
      console.error('Error switching microphone:', error);
      toast.error('Failed to switch microphone');
    }
  };

  const handleSpeakerChange = async (deviceId: string) => {
    try {
      setSelectedSpeaker(deviceId);
      await audioDeviceManager.switchAudioDevice(deviceId, 'output');
      toast.success('Speaker changed successfully');
    } catch (error) {
      console.error('Error switching speaker:', error);
      toast.error('Failed to switch speaker');
    }
  };

  const testMicrophone = async () => {
    setIsTesting(true);
    try {
      const level = await audioDeviceManager.testMicrophone();
      if (level > 10) {
        toast.success('Microphone is working properly');
      } else {
        toast.warning('Microphone level is very low');
      }
    } catch (error) {
      console.error('Error testing microphone:', error);
      toast.error('Failed to test microphone');
    } finally {
      setIsTesting(false);
    }
  };

  const testSpeaker = () => {
    // Play a test tone
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = speakerVolume[0] / 100 * 0.1; // Convert to volume
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 1000);
    
    toast.success('Test tone played');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Audio Device Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Microphone Settings */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                <h3 className="font-medium">Microphone</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Device</Label>
                <Select value={selectedMicrophone} onValueChange={handleMicrophoneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Microphone</SelectItem>
                    {microphones.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Volume: {microphoneVolume[0]}%</Label>
                <Slider
                  value={microphoneVolume}
                  onValueChange={setMicrophoneVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={testMicrophone}
                disabled={isTesting}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Microphone'}
              </Button>
            </div>
          </Card>

          {/* Speaker Settings */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <h3 className="font-medium">Speaker</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Device</Label>
                <Select value={selectedSpeaker} onValueChange={handleSpeakerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Speaker</SelectItem>
                    {speakers.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Volume: {speakerVolume[0]}%</Label>
                <Slider
                  value={speakerVolume}
                  onValueChange={setSpeakerVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={testSpeaker}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Speaker
              </Button>
            </div>
          </Card>

          {/* Connection Quality */}
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium">Connection Quality</h3>
              <div className="flex items-center justify-between text-sm">
                <span>Network Status:</span>
                <span className="text-green-600 font-medium">Excellent</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Audio Quality:</span>
                <span className="text-green-600 font-medium">HD Audio</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Latency:</span>
                <span className="text-yellow-600 font-medium">45ms</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};