
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

const TELNYX_VOICES = [
  { id: 'Heart', name: 'Heart', description: 'Natural warm female voice - KokoroTTS' },
  { id: 'Soul', name: 'Soul', description: 'Professional male voice - KokoroTTS' },
  { id: 'Spirit', name: 'Spirit', description: 'Balanced neutral voice - KokoroTTS' },
  { id: 'telnyx', name: 'Telnyx Default', description: 'Standard Telnyx voice' }
];

export const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handlePreviewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    
    try {
      // In a real implementation, this would call Telnyx AI Assistant API
      // For now, we'll just show a toast
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-purple-600" />
          Telnyx AI Voice Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="voice-select">Choose AI Voice</Label>
          <Select value={selectedVoice} onValueChange={onVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {TELNYX_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Voice Previews</Label>
          <div className="grid grid-cols-1 gap-2">
            {TELNYX_VOICES.map((voice) => (
              <div key={voice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-muted-foreground">{voice.description}</div>
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

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Telnyx AI Assistant Sample:</p>
            <p className="italic">"Hello, this is your AI assistant powered by Telnyx. I'm here to help with your service needs today."</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
