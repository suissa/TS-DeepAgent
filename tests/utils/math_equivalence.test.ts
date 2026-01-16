import { stripString, isEquiv } from '../../src/utils/math_equivalence';

describe('MathEquivalence', () => {
  describe('stripString', () => {
    it('should remove linebreaks', () => {
      expect(stripString('hello\nworld')).toBe('helloworld');
    });

    it('should remove inverse spaces', () => {
      expect(stripString('hello\\!world')).toBe('helloworld');
    });

    it('should replace double backslash with single', () => {
      expect(stripString('hello\\\\world')).toBe('hello\\world');
    });

    it('should replace tfrac and dfrac with frac', () => {
      expect(stripString('tfrac')).toBe('frac');
      expect(stripString('dfrac')).toBe('frac');
    });

    it('should remove left and right markers', () => {
      expect(stripString('\\left')).toBe('');
      expect(stripString('\\right')).toBe('');
    });

    it('should remove degrees', () => {
      expect(stripString('90^{\\circ}')).toBe('90');
      expect(stripString('90^\\circ')).toBe('90');
    });

    it('should remove dollar signs', () => {
      expect(stripString('\\$100')).toBe('100');
    });

    it('should remove percentage', () => {
      expect(stripString('50\\%')).toBe('50');
      expect(stripString('50\\%')).toBe('50');
    });

    it('should fix 0.5 to frac', () => {
      expect(stripString('0.5')).toBe('\\frac{1}{2}');
    });

    it('should remove spaces', () => {
      expect(stripString('hello world')).toBe('helloworld');
    });

    it('should handle empty string', () => {
      expect(stripString('')).toBe('');
    });

    it('should handle dot prefix and convert to fraction', () => {
      expect(stripString('.5')).toBe('\\frac{1}{2}');
    });

    it('should fix simple fractions', () => {
      expect(stripString('1/2')).toBe('\\frac{1}{2}');
    });

    it('should handle fixFracs for \\frac1b style', () => {
      expect(stripString('\\frac1b')).toContain('frac');
    });

    it('should handle sqrt with numbers', () => {
      expect(stripString('sqrt3')).toContain('sqrt');
    });
  });

  describe('isEquiv', () => {
    it('should return true for identical strings', () => {
      expect(isEquiv('hello', 'hello')).toBe(true);
    });

    it('should return true for equivalent math expressions', () => {
      expect(isEquiv('0.5', '\\frac{1}{2}')).toBe(true);
    });

    it('should return true for both None', () => {
      expect(isEquiv(null, null)).toBe(true);
    });

    it('should return false for one None', () => {
      expect(isEquiv('hello', null)).toBe(false);
      expect(isEquiv(null, 'hello')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isEquiv('Hello', 'hello')).toBe(false);
    });

    it('should handle verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      expect(isEquiv('0.5', '\\frac{1}{2}', true)).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
