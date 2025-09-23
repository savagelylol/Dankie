import { convertToAppleEmojis } from '@/lib/emoji-utils';

interface AppleEmojiTextProps {
  children: string;
  className?: string;
}

/**
 * Component that renders text with Apple-style emojis
 */
export function AppleEmojiText({ children, className }: AppleEmojiTextProps) {
  const convertedHtml = convertToAppleEmojis(children);
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: convertedHtml }}
    />
  );
}