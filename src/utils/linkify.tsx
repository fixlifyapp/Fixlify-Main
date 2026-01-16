import React from 'react';

// Regular expression to match URLs
const URL_REGEX = /(https?:\/\/[^\s<>"\[\]{}|\\^`]+)/gi;

/**
 * Converts URLs in text to clickable links
 * @param text - The text containing URLs
 * @param className - Optional className for the links
 * @returns React elements with clickable links
 */
export function linkifyText(
  text: string,
  className?: string
): React.ReactNode {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex lastIndex since we're using global flag
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={className || 'underline hover:no-underline break-all'}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

/**
 * Component wrapper for linkifying text
 */
interface LinkifiedTextProps {
  children: string;
  linkClassName?: string;
}

export function LinkifiedText({ children, linkClassName }: LinkifiedTextProps) {
  return <>{linkifyText(children, linkClassName)}</>;
}
