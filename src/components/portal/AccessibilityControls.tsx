import { useState, useEffect } from 'react';
import { Minus, Plus, Type, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

type FontSize = 'small' | 'medium' | 'large';

const FONT_SIZE_KEY = 'portal-font-size';
const HIGH_CONTRAST_KEY = 'portal-high-contrast';

const FONT_SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

const FONT_SIZE_SCALE = {
  small: 0.875,
  medium: 1,
  large: 1.125,
};

export function AccessibilityControls() {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [highContrast, setHighContrastState] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
    if (storedFontSize && ['small', 'medium', 'large'].includes(storedFontSize)) {
      setFontSizeState(storedFontSize);
    }

    const storedContrast = localStorage.getItem(HIGH_CONTRAST_KEY);
    if (storedContrast === 'true') {
      setHighContrastState(true);
    }
  }, []);

  // Apply font size to document
  useEffect(() => {
    const scale = FONT_SIZE_SCALE[fontSize];
    document.documentElement.style.fontSize = `${scale * 100}%`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem(HIGH_CONTRAST_KEY, String(enabled));
  };

  const decreaseFontSize = () => {
    if (fontSize === 'large') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('small');
  };

  const increaseFontSize = () => {
    if (fontSize === 'small') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('large');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          title="Accessibility options"
          aria-label="Accessibility options"
        >
          <Type className="h-4 w-4" />
          <span className="sr-only">Accessibility options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Size Controls */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Text Size</span>
            <span className="text-xs text-muted-foreground capitalize">{fontSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={decreaseFontSize}
              disabled={fontSize === 'small'}
              aria-label="Decrease text size"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{
                  width: fontSize === 'small' ? '33%' : fontSize === 'medium' ? '66%' : '100%',
                }}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={increaseFontSize}
              disabled={fontSize === 'large'}
              aria-label="Increase text size"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* High Contrast Toggle */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">High Contrast</span>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Quick Presets */}
        <DropdownMenuItem
          onClick={() => { setFontSize('medium'); setHighContrast(false); }}
          className="cursor-pointer"
        >
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
