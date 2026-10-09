import { CurrencyVndPipe } from './currency-vnd.pipe';

describe('CurrencyVndPipe', () => {
  const pipe = new CurrencyVndPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format numbers to VND currency representation', () => {
    // vi-VN format uses non-breaking space or standard dot
    const result = pipe.transform(150000);
    expect(result).toContain('150');
    expect(result).toContain('₫');
  });

  it('should return 0 ₫ for null or undefined or empty', () => {
    expect(pipe.transform(null)).toBe('0 ₫');
    expect(pipe.transform(undefined)).toBe('0 ₫');
    expect(pipe.transform('')).toBe('0 ₫');
  });
});
