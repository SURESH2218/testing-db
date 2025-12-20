/**
 * Basic input sanitization utilities
 * Prevents XSS and other injection attacks
 */

/**
 * Sanitize string input - remove dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (!input) return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove HTML tags
    .slice(0, 10000); // Prevent extremely long inputs
};

/**
 * Sanitize markdown content
 * Allows markdown but prevents script injection
 */
export const sanitizeMarkdown = (markdown: string): string => {
  if (!markdown) return markdown;

  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .slice(0, 50000); // Max 50KB markdown
};

/**
 * Validate S3 URL specifically
 */
export const isValidS3Url = (url: string, bucketName: string, region: string): boolean => {
  const expectedPattern = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  return url.startsWith(expectedPattern);
};
