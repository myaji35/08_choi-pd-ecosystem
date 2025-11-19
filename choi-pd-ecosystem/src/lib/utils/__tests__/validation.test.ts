import {
  validateFileSize,
  validateAltText,
  calculateAspectRatio,
  isRecommendedAspectRatio,
  validateHeroImageServer,
} from '../validation';
import { HERO_IMAGE_CONSTANTS } from '@/lib/constants';

describe('validateFileSize', () => {
  it('should pass for valid file size', () => {
    const file = { size: 1024 * 1024 } as File; // 1MB
    const result = validateFileSize(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail for file size exceeding limit', () => {
    const file = { size: 3 * 1024 * 1024 } as File; // 3MB
    const result = validateFileSize(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should pass for file size at exactly the limit', () => {
    const file = { size: HERO_IMAGE_CONSTANTS.MAX_FILE_SIZE } as File;
    const result = validateFileSize(file);
    expect(result.valid).toBe(true);
  });
});

describe('validateAltText', () => {
  it('should pass for valid alt text', () => {
    const result = validateAltText('Valid alt text for hero image');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail for alt text that is too short', () => {
    const result = validateAltText('Short');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail for alt text that is too long', () => {
    const longText = 'a'.repeat(201);
    const result = validateAltText(longText);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should trim whitespace before validation', () => {
    const result = validateAltText('  Valid alt text  ');
    expect(result.valid).toBe(true);
  });

  it('should fail if trimmed text is too short', () => {
    const result = validateAltText('   abc   ');
    expect(result.valid).toBe(false);
  });
});

describe('calculateAspectRatio', () => {
  it('should calculate 16:9 aspect ratio correctly', () => {
    const ratio = calculateAspectRatio(1920, 1080);
    expect(ratio).toBeCloseTo(16 / 9, 2);
  });

  it('should calculate 4:3 aspect ratio correctly', () => {
    const ratio = calculateAspectRatio(1024, 768);
    expect(ratio).toBeCloseTo(4 / 3, 2);
  });

  it('should handle square aspect ratio', () => {
    const ratio = calculateAspectRatio(1000, 1000);
    expect(ratio).toBe(1);
  });
});

describe('isRecommendedAspectRatio', () => {
  it('should return true for exact 16:9 ratio', () => {
    const result = isRecommendedAspectRatio(1920, 1080);
    expect(result).toBe(true);
  });

  it('should return true for ratio within tolerance', () => {
    const result = isRecommendedAspectRatio(1900, 1080);
    expect(result).toBe(true);
  });

  it('should return false for ratio outside tolerance', () => {
    const result = isRecommendedAspectRatio(1024, 768); // 4:3
    expect(result).toBe(false);
  });

  it('should return true for scaled 16:9 dimensions', () => {
    const result = isRecommendedAspectRatio(3840, 2160); // 4K 16:9
    expect(result).toBe(true);
  });
});

describe('validateHeroImageServer', () => {
  it('should pass for valid file', () => {
    const file = {
      type: 'image/jpeg',
      size: 1024 * 1024,
      name: 'hero-image.jpg',
    };
    const altText = 'Valid hero image alt text';
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail for invalid file type', () => {
    const file = {
      type: 'image/gif',
      size: 1024 * 1024,
      name: 'hero-image.gif',
    };
    const altText = 'Valid hero image alt text';
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail for file size exceeding limit', () => {
    const file = {
      type: 'image/jpeg',
      size: 3 * 1024 * 1024,
      name: 'hero-image.jpg',
    };
    const altText = 'Valid hero image alt text';
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid alt text', () => {
    const file = {
      type: 'image/jpeg',
      size: 1024 * 1024,
      name: 'hero-image.jpg',
    };
    const altText = 'Short';
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail for invalid file extension even with valid MIME type', () => {
    const file = {
      type: 'image/jpeg',
      size: 1024 * 1024,
      name: 'hero-image.txt',
    };
    const altText = 'Valid hero image alt text';
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(false);
  });

  it('should pass for all supported file types', () => {
    const supportedTypes = [
      { type: 'image/jpeg', name: 'test.jpg' },
      { type: 'image/jpg', name: 'test.jpg' },
      { type: 'image/png', name: 'test.png' },
      { type: 'image/webp', name: 'test.webp' },
    ];

    supportedTypes.forEach(({ type, name }) => {
      const file = { type, size: 1024 * 1024, name };
      const result = validateHeroImageServer(file, 'Valid hero image alt text');
      expect(result.valid).toBe(true);
    });
  });

  it('should accumulate multiple errors', () => {
    const file = {
      type: 'image/gif', // Invalid type
      size: 3 * 1024 * 1024, // Too large
      name: 'hero-image.gif',
    };
    const altText = 'Bad'; // Too short
    const result = validateHeroImageServer(file, altText);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
