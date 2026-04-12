/**
 * Cloudinary URL transformation helpers for video optimization.
 *
 * Cloudinary video URLs follow the pattern:
 * https://res.cloudinary.com/{cloud}/video/upload/{version}/{public_id}.{ext}
 *
 * We insert transformation segments after "upload/" to generate
 * optimized variants and poster thumbnails.
 */

const UPLOAD_SEGMENT = '/upload/';

function insertTransformation(url: string, transformation: string): string {
  const idx = url.indexOf(UPLOAD_SEGMENT);
  if (idx === -1) return url;
  const insertAt = idx + UPLOAD_SEGMENT.length;
  return url.slice(0, insertAt) + transformation + '/' + url.slice(insertAt);
}

/**
 * Generate a poster image from a Cloudinary video URL.
 * Extracts the first frame (so_0), crops to vertical 9:16, and serves as auto-format image.
 */
export function getCloudinaryPoster(videoUrl: string): string {
  return insertTransformation(videoUrl, 'so_0,w_720,h_1280,c_fill,f_jpg,q_auto')
    .replace(/\.\w+$/, '.jpg');
}

/**
 * Generate a lower-quality poster for preloading (smaller size).
 */
export function getCloudinaryPosterBlur(videoUrl: string): string {
  return insertTransformation(videoUrl, 'so_0,w_80,h_142,c_fill,f_jpg,q_30,e_blur:400')
    .replace(/\.\w+$/, '.jpg');
}

/**
 * Add auto-format and auto-quality transformations for adaptive delivery.
 * Cloudinary will serve WebM to supported browsers, MP4 otherwise.
 */
export function getOptimizedVideoUrl(videoUrl: string): string {
  return insertTransformation(videoUrl, 'f_auto,q_auto');
}
