import { Fragment } from 'react';

/**
 * Tutor responses come back as plain text with light markdown (headings, bold,
 * bullet lists) since the Gemini system prompt asks for structured explanations.
 * No markdown dependency is in package.json, so this renders just the subset we need.
 */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l));

        if (isList) {
          return (
            <ul key={i} className="list-none space-y-2">
              {lines.map((line, j) => (
                <li key={j} className="flex gap-2.5 font-sans text-[15px] leading-relaxed text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                  <span>{renderInline(line.replace(/^[-*•]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        const headingMatch = block.match(/^#{1,3}\s+(.*)/);
        if (headingMatch) {
          return (
            <h3 key={i} className="font-display text-xl text-ink">
              {renderInline(headingMatch[1])}
            </h3>
          );
        }

        return (
          <p key={i} className="font-sans text-[15px] leading-relaxed text-ink-soft">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Fragment key={i}>
          <strong className="font-semibold text-ink">{part.slice(2, -2)}</strong>
        </Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
