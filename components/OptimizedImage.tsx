'use client';

import Image, { ImageProps } from 'next/image';
import { FEATURE_OPTIMIZED_IMAGES } from '@/lib/feature-flags';

/**
 * Optimized Image Component
 * 
 * Wraps next/image with optimized defaults:
 * - quality={85} (default, can be overridden)
 * - loading="lazy" unless priority is set
 * - Optional blur placeholder (safe for server/client contexts)
 * 
 * When FEATURE_OPTIMIZED_IMAGES is disabled, falls back to standard Image component.
 */
interface OptimizedImageProps extends Omit<ImageProps, 'quality' | 'loading'> {
  quality?: number;
  priority?: boolean;
  enableBlur?: boolean;
}

// Default blur placeholder (1x1 transparent pixel as base64)
const DEFAULT_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

export default function OptimizedImage({
  quality = 85,
  priority = false,
  enableBlur = true,
  placeholder,
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  // If feature is disabled, use standard Image with passed props
  if (!FEATURE_OPTIMIZED_IMAGES) {
    return <Image {...props} alt={props.alt || ''} />;
  }

  // Determine loading strategy
  const loading = priority ? 'eager' : 'lazy';

  // Handle blur placeholder safely
  let finalPlaceholder: 'blur' | 'empty' | undefined = 
    placeholder === 'blur' || placeholder === 'empty' ? placeholder : undefined;
  let finalBlurDataURL: string | undefined = blurDataURL;

  if (enableBlur && !priority) {
    // Only enable blur placeholder if not priority and enableBlur is true
    if (typeof window === 'undefined') {
      // Server-side: safe to use blur placeholder
      finalPlaceholder = 'blur';
      finalBlurDataURL = blurDataURL || DEFAULT_BLUR_DATA_URL;
    } else {
      // Client-side: check if blurDataURL is provided, otherwise use default
      finalPlaceholder = blurDataURL || DEFAULT_BLUR_DATA_URL ? 'blur' : 'empty';
      finalBlurDataURL = blurDataURL || DEFAULT_BLUR_DATA_URL;
    }
  } else {
    // No blur placeholder for priority images or when disabled
    finalPlaceholder = 'empty';
    finalBlurDataURL = undefined;
  }

  return (
    <Image
      {...props}
      alt={props.alt || ''}
      quality={quality}
      loading={loading}
      placeholder={finalPlaceholder}
      blurDataURL={finalBlurDataURL}
      priority={priority}
    />
  );
}

