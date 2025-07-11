
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

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced tone' },
  { id: 'echo', name: 'Echo', description: 'Warm, friendly voice' },
  { id: 'fable', name: 'Fable', description: 'Expressive, storytelling voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright, energetic voice' }
];

export const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handlePreviewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    
    try {
      // In a real implementation, this would call OpenAI TTS API
      // For now, we'll just show a toast
      toast.info(`Playing preview of ${OPENAI_VOICES.find(v => v.id === voiceId)?.name} voice...`);
      
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
          <Volume2 className="h-5 w-5 text-blue-600" />
          AI Voice Selection
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
              {OPENAI_VOICES.map((voice) => (
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
            {OPENAI_VOICES.map((voice) => (
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

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Voice Preview Sample:</p>
            <p className="italic">"Hello, my name is your AI assistant. I'm here to help with your service needs today."</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
