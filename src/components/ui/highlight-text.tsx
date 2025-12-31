import React from "react";

interface HighlightTextProps {
  text: string;
  highlight?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Component that highlights matching text within a string.
 * Used to show search matches in list views.
 */
export const HighlightText = ({
  text,
  highlight,
  className = "",
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
}: HighlightTextProps) => {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const searchTerm = highlight.trim().toLowerCase();
  const textLower = text.toLowerCase();
  const startIndex = textLower.indexOf(searchTerm);

  if (startIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  const beforeMatch = text.slice(0, startIndex);
  const match = text.slice(startIndex, startIndex + searchTerm.length);
  const afterMatch = text.slice(startIndex + searchTerm.length);

  return (
    <span className={className}>
      {beforeMatch}
      <mark className={highlightClassName}>{match}</mark>
      {afterMatch && (
        <HighlightText
          text={afterMatch}
          highlight={highlight}
          highlightClassName={highlightClassName}
        />
      )}
    </span>
  );
};
