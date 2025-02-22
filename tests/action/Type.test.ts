import * as Action from '@/Action';

describe('Type', () => {
  describe('createType', () => {
    it('should create a Type with default values when no arguments provided', () => {
      // Act
      const type = Action.createType();

      // Assert
      expect(type.name).toBe('default');
      expect(type.description).toBe('default');
      expect(type.implementation).toBe('default');
    });

    it('should create a Type with provided values', () => {
      // Arrange
      const name = 'test-type';
      const description = 'test description';
      const implementation = 'test-implementation';

      // Act
      const type = Action.createType(name, description, implementation);

      // Assert
      expect(type.name).toBe(name);
      expect(type.description).toBe(description);
      expect(type.implementation).toBe(implementation);
    });

    it('should create a Type with partial provided values', () => {
      // Arrange
      const name = 'test-type';

      // Act
      const type = Action.createType(name);

      // Assert
      expect(type.name).toBe(name);
      expect(type.description).toBe('default');
      expect(type.implementation).toBe('default');
    });
  });
});
