import * as ItemMigration from '@/item/ItemMigration';
import * as Migration from '@/Migration';
import { Item, ItemQuery } from '@fjell/core';
import * as Library from '@fjell/lib';

describe('ItemMigration', () => {
  describe('createDefinition', () => {
    let uri: Migration.URI;
    let description: string;

    beforeEach(() => {
      uri = Migration.createURI('fjell', 'fjellproject',
        { year: 2025, month: 1, day: 1, sequence: 1, name: 'test-migration' });
      description = 'Test migration';
    });

    it('should create a migration definition with default migrate function', async () => {
      // Act
      const definition = ItemMigration.createDefinition(uri, description, ['test-type'], {
        query: {} as ItemQuery,
      });

      // Assert
      expect(definition.uri).toBe(uri);
      expect(definition.description).toBe(description);
      expect(definition.migrate).toBeDefined();
    });

    it('default migrate function should set status to finished', async () => {
      // Arrange
      const definition = ItemMigration.createDefinition<Item<'test-type'>, 'test-type'>(uri, 'test', ['test-type'], {
        query: {} as ItemQuery,
      });

      const mockLib = {
        name: 'test-lib',
        migrate: jest.fn().mockResolvedValue({ status: 'finished' }),
      } as unknown as Library.Operations<Item<'test-type'>, 'test-type'>;

      const context = {
        input: {} as Item<'test-type'>,
        lib: mockLib,
        complete: jest.fn(),
      } as unknown as ItemMigration.Context<Item<'test-type'>, 'test-type'>;

      await definition.migrate(context);

      expect(context.complete).toHaveBeenCalled();
    });
  });
});
