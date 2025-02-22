import { createURI, parseURI } from '@/Migration';

describe('Migration.URI Unit Tests', () => {
  describe('parseURI', () => {
    it('should parse a valid migration URI', () => {
      const uri = 'test://example.com/2024/3/15/1/test-migration';
      const result = parseURI(uri);
      
      expect(result.scheme).toBe('test');
      expect(result.authority).toBe('example.com');
      expect(result.path).toEqual({
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
    });

    it('should throw error for invalid URI format', () => {
      const invalidUris = [
        'invalid',
        'test:/example.com/2024/3/15/1/test',
        'test://example.com/202/3/15/1/test',
        'test://example.com/2024/3/15/-1/test',
      ];

      invalidUris.forEach(uri => {
        console.log(uri);
        expect(() => parseURI(uri)).toThrow();
      });
    });
  });

  describe('createURI', () => {
    it('should create a valid migration URI object', () => {
      const result = createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });

      expect(result.scheme).toBe('test');
      expect(result.authority).toBe('example.com');
      expect(result.path).toEqual({
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      expect(result.toString()).toBe('test://example.com/2024/3/15/1/test-migration');
    });
  });
});
