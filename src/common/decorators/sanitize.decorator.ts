import { Transform, TransformFnParams } from 'class-transformer';

/**
 * Trims leading and trailing whitespace from string input.
 * Supports string arrays as well.
 */
export function Trim() {
  return Transform(({ value }: TransformFnParams): unknown => {
    const val = value as unknown;
    if (typeof val === 'string') {
      return val.trim();
    }
    if (Array.isArray(val)) {
      return val.map((v: unknown) => (typeof v === 'string' ? v.trim() : v));
    }
    return val;
  });
}

/**
 * Strips HTML tags and script elements from string input to prevent XSS.
 * Supports string arrays as well.
 */
export function SanitizeHtml() {
  return Transform(({ value }: TransformFnParams): unknown => {
    const val = value as unknown;
    const sanitize = (v: unknown): unknown => {
      if (typeof v !== 'string') {
        return v;
      }
      // Remove <script>...</script> tags and content
      let clean = v.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '',
      );
      // Remove all other HTML tags
      clean = clean.replace(/<[^>]*>/g, '');
      return clean;
    };

    if (typeof val === 'string') {
      return sanitize(val);
    }
    if (Array.isArray(val)) {
      return val.map((v: unknown) => sanitize(v));
    }
    return val;
  });
}
