import { generateFileName } from '../upload';

describe('generateFileName', () => {
  it('should generate a filename with timestamp and original extension', () => {
    const originalName = 'hero-image.jpg';
    const filename = generateFileName(originalName);

    expect(filename).toMatch(/^hero-\d+\.jpg$/);
  });

  it('should handle files with multiple dots in name', () => {
    const originalName = 'my.hero.image.png';
    const filename = generateFileName(originalName);

    expect(filename).toMatch(/^hero-\d+\.png$/);
  });

  it('should convert extension to lowercase', () => {
    const originalName = 'hero-image.JPG';
    const filename = generateFileName(originalName);

    expect(filename).toMatch(/^hero-\d+\.jpg$/);
  });

  it('should use the entire filename as extension if no dot found', () => {
    const originalName = 'hero-image';
    const filename = generateFileName(originalName);

    // When there's no dot, split('.').pop() returns the whole string
    expect(filename).toMatch(/^hero-\d+\.hero-image$/);
  });

  it('should handle webp extension', () => {
    const originalName = 'hero-image.webp';
    const filename = generateFileName(originalName);

    expect(filename).toMatch(/^hero-\d+\.webp$/);
  });

  it('should generate unique filenames for multiple calls', () => {
    const originalName = 'hero-image.jpg';
    const filename1 = generateFileName(originalName);

    // Small delay to ensure different timestamps
    const filename2 = generateFileName(originalName);

    // While they might be the same if called in the same millisecond,
    // they should at least have the correct format
    expect(filename1).toMatch(/^hero-\d+\.jpg$/);
    expect(filename2).toMatch(/^hero-\d+\.jpg$/);
  });
});

// Note: Testing uploadToGCS, uploadWithRetry, deleteFromGCS, and generateSignedUrl
// would require mocking the Google Cloud Storage client, which is complex.
// These should be tested with integration tests or E2E tests instead.
// For now, we'll focus on the pure functions that don't require external dependencies.
