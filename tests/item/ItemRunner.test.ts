import * as ItemEnvironment from '@/item/ItemEnvironment';
import * as ItemMigration from '@/item/ItemMigration';
import * as ItemRunner from '@/item/ItemRunner';
import { Item } from '@fjell/core';
import * as Library from '@fjell/lib';

jest.mock('@/item/ItemMigration');
jest.mock('@/item/ItemEnvironment');
jest.mock('@/Migration');

describe('ItemRunner', () => {
  let context1: ItemMigration.Context<Item<'test-type'>, 'test-type'>;
  let context2: ItemMigration.Context<Item<'test-type'>, 'test-type'>;
  let contexts: ItemMigration.Context<Item<'test-type'>, 'test-type'>[];
  let migrationDefinition: ItemMigration.Definition<Item<'test-type'>, 'test-type'>;
  let libRegistry: Library.Registry;
  let environmentContext: ItemEnvironment.Context;
  let mockLibOperations: Library.Operations<Item<'test-type'>, 'test-type'>;
  let mockLibDefinition: Library.Definition<Item<'test-type'>, 'test-type'>;
  let mockLibInstance: Library.Instance<Item<'test-type'>, 'test-type'>;

  beforeEach(() => {
    mockLibOperations = {} as Library.Operations<Item<'test-type'>, 'test-type'>;
    mockLibDefinition = {
    } as Library.Definition<Item<'test-type'>, 'test-type'>;
    mockLibInstance = {
      operations: mockLibOperations,
      definition: mockLibDefinition,
    } as Library.Instance<Item<'test-type'>, 'test-type'>;
    libRegistry = {
      get: jest.fn().mockReturnValue(mockLibInstance),
    } as unknown as Library.Registry;

    context1 = {
      complete: jest.fn(),
    } as unknown as ItemMigration.Context<Item<'test-type'>, 'test-type'>;
    context2 = {
      complete: jest.fn(),
    } as unknown as ItemMigration.Context<Item<'test-type'>, 'test-type'>;
  
    contexts = [context1, context2];
  
    migrationDefinition = {
      kta: ['test-type'],
      migrate: jest.fn().mockImplementation(
        async (context: ItemMigration.Context<Item<'test-type'>, 'test-type'>) => {
          context.complete();
          return;
        }),
    } as unknown as ItemMigration.Definition<Item<'test-type'>, 'test-type'>;
  
    (ItemEnvironment.createContext as jest.Mock).mockReturnValue({
      libRegistry,
    } as unknown as ItemEnvironment.Context);

    environmentContext = ItemEnvironment.createContext(libRegistry);

  });

  describe('createEngine', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create engine with correct properties', () => {
      // Act
      const engine = ItemRunner.createEngine(migrationDefinition, environmentContext);

      // Assert
      expect(engine.context.lib).toBe(mockLibOperations);
      expect(engine.run).toBeDefined();
    });

    it('should get lib using migration kt', () => {
      ItemRunner.createEngine(migrationDefinition, environmentContext);
      expect(libRegistry.get).toHaveBeenCalledWith(['test-type']);
    });

    it('should run migration on all contexts', async () => {
      // Arrange

      const environmentContext = ItemEnvironment.createContext(libRegistry);
      const engine = ItemRunner.createEngine(migrationDefinition, environmentContext);
      engine.addMigrationContext(contexts[0]);
      engine.addMigrationContext(contexts[1]);

      // Act
      await engine.run();

      // Assert
      contexts.forEach(context => {
        expect(context.complete).toHaveBeenCalled();
      });
    });
  });
});
