import { DateViPipe } from './date-vi.pipe';

describe('DateViPipe', () => {
  const pipe = new DateViPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date string to DD/MM/YYYY', () => {
    const dateStr = '2026-10-15T00:00:00Z';
    const result = pipe.transform(dateStr);
    expect(result).toMatch(/\d{2}\/\d{2}\/2026/);
  });

  it('should return - for invalid or null input', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform('invalid-date')).toBe('-');
  });
});
