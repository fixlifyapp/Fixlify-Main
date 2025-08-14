import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Volume2, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TelnyxVoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  voiceSettings?: {
    speed?: number;
    pitch?: number;
    language?: string;
  };
  onSettingsChange?: (settings: any) => void;
}

// Telnyx AI Assistant Voice Models
const TELNYX_VOICES = [
  { 
    id: 'Heart', 
    name: 'Heart', 
    provider: 'KokoroTTS',
    gender: 'female',
    description: 'Natural and warm female voice',
    languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE']
  },
  { 
    id: 'Soul', 
    name: 'Soul', 
    provider: 'KokoroTTS',
    gender: 'male',
    description: 'Professional male voice',
    languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE']
  },
  { 
    id: 'Spirit', 
    name: 'Spirit', 
    provider: 'KokoroTTS',
    gender: 'neutral',
    description: 'Neutral and clear voice',
    languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE']
  },
  {
    id: 'telnyx',
    name: 'Telnyx Default',
    provider: 'telnyx',
    gender: 'neutral',
    description: 'Standard Telnyx voice',
    languages: ['en-US']
  }
];

const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
];

export const TelnyxVoiceSelector = ({ 
  selectedVoice, 
  onVoiceChange, 
  voiceSettings = {},
  onSettingsChange 
}: TelnyxVoiceSelectorProps) => {
  const [previewingVoice, setPreviewingVoice] = React.useState<string | null>(null);

  const handlePreviewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    
    try {
      // This would call Telnyx API to generate sample audio
      toast.info(`Playing preview of ${TELNYX_VOICES.find(v => v.id === voiceId)?.name} voice...`);
      
      // Simulate audio playback duration
      setTimeout(() => {
        setPreviewingVoice(null);
      }, 3000);
    } catch (error) {
      console.error('Error previewing voice:', error);
      toast.error('Failed to preview voice');
      setPreviewingVoice(null);
    }
  };

  const selectedVoiceData = TELNYX_VOICES.find(v => v.id === selectedVoice);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-purple-600" />
          Telnyx AI Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Using Telnyx's native AI Voice Assistant with KokoroTTS for natural-sounding conversations.
            This is a complete voice AI solution integrated with your phone system.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="voice-select">AI Voice Model</Label>
            <Select value={selectedVoice} onValueChange={onVoiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {TELNYX_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {voice.provider} • {voice.gender} • {voice.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select 
              value={voiceSettings.language || 'en-US'} 
              onValueChange={(value) => onSettingsChange?.({...voiceSettings, language: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LANGUAGES.filter(lang => 
                  selectedVoiceData?.languages.includes(lang.code)
                ).map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="speed">
              Speaking Speed: {((voiceSettings.speed || 1) * 100).toFixed(0)}%
            </Label>
            <Slider
              id="speed"
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
            <Label htmlFor="pitch">
              Voice Pitch: {voiceSettings.pitch || 'normal'}
            </Label>
            <Slider
              id="pitch"
              min={-2}
              max={2}
              step={0.5}
              value={[voiceSettings.pitch === 'low' ? -1 : voiceSettings.pitch === 'high' ? 1 : 0]}
              onValueChange={([value]) => {
                const pitch = value < -0.5 ? 'low' : value > 0.5 ? 'high' : 'normal';
                onSettingsChange?.({...voiceSettings, pitch});
              }}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Voice Previews</Label>
          <div className="grid grid-cols-1 gap-2">
            {TELNYX_VOICES.map((voice) => (
              <div key={voice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {voice.provider} • {voice.description}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreviewVoice(voice.id)}
                  disabled={previewingVoice === voice.id}
                  className="gap-2"
                >
                  <Play className="h-3 w-3" />
                  {previewingVoice === voice.id ? 'Playing...' : 'Preview'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg space-y-2">
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-2">AI Assistant Capabilities:</p>
            <ul className="space-y-1 ml-4">
              <li>• Natural conversation handling</li>
              <li>• Appointment booking</li>
              <li>• Service inquiries</li>
              <li>• Call transfer to human agents</li>
              <li>• Multi-language support</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sample Greeting:</p>
            <p className="italic">"Thank you for calling. I'm your AI assistant powered by Telnyx. How may I help you today?"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
