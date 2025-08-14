import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// NaturalHD voices available in Telnyx
const NATURALHD_VOICES = [
  // Female voices
  { id: 'Astra', name: 'Astra', gender: 'female', description: 'Clear and professional' },
  { id: 'Luna', name: 'Luna', gender: 'female', description: 'Warm and friendly' },
  { id: 'Stella', name: 'Stella', gender: 'female', description: 'Energetic and bright' },
  { id: 'Athena', name: 'Athena', gender: 'female', description: 'Intelligent and confident' },
  { id: 'Hera', name: 'Hera', gender: 'female', description: 'Authoritative and clear' },
  // Male voices
  { id: 'Orpheus', name: 'Orpheus', gender: 'male', description: 'Smooth and melodic' },
  { id: 'Perseus', name: 'Perseus', gender: 'male', description: 'Strong and confident' },
  { id: 'Evander', name: 'Evander', gender: 'male', description: 'Professional and warm' },
  { id: 'Arcas', name: 'Arcas', gender: 'male', description: 'Deep and trustworthy' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'male', description: 'Light and friendly' }
];

interface NaturalHDVoiceConfigProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  voiceSettings?: {
    speed?: number;
    pitch?: number;
  };
  onSettingsChange?: (settings: any) => void;
}

export const NaturalHDVoiceConfig = ({ 
  selectedVoice, 
  onVoiceChange,
  voiceSettings = {},
  onSettingsChange 
}: NaturalHDVoiceConfigProps) => {

  return (
    <div className="space-y-6">
      <div>
        <Label>Voice Model</Label>
        <div className="text-sm text-muted-foreground mt-1">
          Provider: Telnyx | Model: NaturalHD
        </div>
      </div>

      <div>
        <Label htmlFor="voice-select">Select Voice</Label>
        <Select value={selectedVoice} onValueChange={onVoiceChange}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Choose a voice" />
          </SelectTrigger>
          <SelectContent>
            <div className="font-semibold text-xs uppercase text-muted-foreground px-2 py-1">
              Female Voices
            </div>
            {NATURALHD_VOICES.filter(v => v.gender === 'female').map(voice => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center gap-2">
                  <span>{voice.name}</span>
                  <span className="text-xs text-muted-foreground">{voice.description}</span>
                </div>
              </SelectItem>
            ))}
            <div className="font-semibold text-xs uppercase text-muted-foreground px-2 py-1 mt-2">
              Male Voices
            </div>
            {NATURALHD_VOICES.filter(v => v.gender === 'male').map(voice => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center gap-2">
                  <span>{voice.name}</span>
                  <span className="text-xs text-muted-foreground">{voice.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Speed: {((voiceSettings.speed || 1) * 100).toFixed(0)}%</Label>
          <Slider
            min={50}
            max={150}
            step={10}
            value={[(voiceSettings.speed || 1) * 100]}
            onValueChange={([value]) => 
              onSettingsChange?.({...voiceSettings, speed: value / 100})
            }
            className="mt-2"
          />
        </div>

        <div>
          <Label>Pitch Adjustment</Label>
          <Slider
            min={-10}
            max={10}
            step={1}
            value={[voiceSettings.pitch || 0]}
            onValueChange={([value]) => 
              onSettingsChange?.({...voiceSettings, pitch: value})
            }
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};
