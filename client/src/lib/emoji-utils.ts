// @ts-ignore - emoji-js doesn't have TypeScript definitions
import EmojiConvertor from 'emoji-js';

// Initialize the emoji converter with Apple emoji settings
const emoji = new EmojiConvertor();

// Configure for Apple emoji style
emoji.img_set = 'apple';
emoji.img_sets.apple.path = 'https://github.com/iamcal/emoji-data/raw/master/img-apple-64/';
emoji.img_sets.apple.sheet = 'https://github.com/iamcal/emoji-data/raw/master/sheet_apple_64.png';
emoji.use_sheet = true; // Use sprite sheet for better performance
emoji.avoid_ms_emoji = true;
emoji.wrap_native = true;
emoji.include_title = true;
emoji.include_text = true;

// Set CSS class for styling
emoji.img_suffix = '.png';

/**
 * Converts Unicode emojis in text to Apple-style emoji images
 * @param text - The text containing emojis to convert
 * @returns HTML string with emojis replaced by Apple-style images
 */
export function convertToAppleEmojis(text: string): string {
  if (!text) return text;
  
  // Replace unified Unicode emojis
  const converted = emoji.replace_unified(text);
  
  // Also handle colon-style emojis like :smile:
  return emoji.replace_colons(converted);
}

/**
 * Custom hook to get emoji converter settings
 */
export function getEmojiConverter() {
  return emoji;
}