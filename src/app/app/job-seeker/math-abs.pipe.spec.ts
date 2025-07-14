import { MathAbsPipe } from './math-abs.pipe';

describe('MathAbsPipe', () => {
  const pipe = new MathAbsPipe();

  it('should return absolute value of positive number', () => {
    expect(pipe.transform(5)).toBe(5);
  });

  it('should return absolute value of negative number', () => {
    expect(pipe.transform(-3)).toBe(3);
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe(0);
  });

  it('should handle null/undefined', () => {
    expect(pipe.transform(null)).toBe(0);
    expect(pipe.transform(undefined)).toBe(0);
  });

  it('should handle string numbers', () => {
    expect(pipe.transform('-10')).toBe(10);
    expect(pipe.transform('15.5')).toBe(15.5);
  });
});