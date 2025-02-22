import * as Action from '@/Action';

describe('Operation', () => {
  describe('createOperation', () => {
    it('should create an Operation with default values when no arguments provided', () => {
      // Act
      const operation = Action.createOperation();

      // Assert
      expect(operation.getStatus()).toBe('ready');
      expect(operation.implementation).toBe('default');
      expect(operation.type).toEqual({
        name: 'default',
        description: 'default',
        implementation: 'default'
      });
      expect(operation.events.create.at).toBeDefined();
      expect(operation.events.start.at).toBeNull();
      expect(operation.events.complete?.at).toBeNull();
      expect(operation.events.failed?.at).toBeNull();
    });

    it('should create an Operation with provided values', () => {
      // Arrange
      const implementation = 'test-implementation';
      const type = Action.createType('test-type', 'test description', 'test-implementation');

      // Act
      const operation = Action.createOperation(implementation, type);

      // Assert
      expect(operation.implementation).toBe(implementation);
      expect(operation.type).toBe(type);
    });

    describe('lifecycle methods', () => {
      let operation: Action.Operation;

      beforeEach(() => {
        operation = Action.createOperation();
      });

      it('should update status and events when started', () => {
        // Act
        operation.start();

        // Assert
        expect(operation.getStatus()).toBe('running');
        expect(operation.events.start.at).toBeDefined();
      });

      it('should update status and events when completed', () => {
        // Act
        operation.complete();

        // Assert
        expect(operation.getStatus()).toBe('finished');
        expect(operation.events.complete?.at).toBeDefined();
      });

      it('should update status and events when failed', () => {
        // Act
        operation.fail();

        // Assert
        expect(operation.getStatus()).toBe('failed');
        expect(operation.events.failed?.at).toBeDefined();
      });

      it('should maintain correct status through full lifecycle', () => {
        // Act & Assert
        expect(operation.getStatus()).toBe('ready');
        
        operation.start();
        expect(operation.getStatus()).toBe('running');
        
        operation.complete();
        expect(operation.getStatus()).toBe('finished');
      });

      it('should maintain correct status when operation fails', () => {
        // Act & Assert
        expect(operation.getStatus()).toBe('ready');
        
        operation.start();
        expect(operation.getStatus()).toBe('running');
        
        operation.fail();
        expect(operation.getStatus()).toBe('failed');
      });
    });
  });
});
