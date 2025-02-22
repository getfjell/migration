import { describe, expect, test } from '@jest/globals';
import * as ItemAction from '@/item/ItemAction';
import { cPK, PriKey } from '@fjell/core';

describe('ItemAction', () => {
  describe('Types', () => {
    test('create type has correct properties', () => {
      expect(ItemAction.Types.create).toEqual({
        name: 'create',
        description: 'Create an Item',
        implementation: 'item'
      });
    });

    test('update type has correct properties', () => {
      expect(ItemAction.Types.update).toEqual({
        name: 'update',
        description: 'Update an Item',
        implementation: 'item'
      });
    });

    test('remove type has correct properties', () => {
      expect(ItemAction.Types.remove).toEqual({
        name: 'remove',
        description: 'Remove an Item',
        implementation: 'item'
      });
    });
  });

  describe('createOperation', () => {
    test('creates operation with primary key', () => {
      const key: PriKey<'test'> = cPK('1', 'test');
      const operation = ItemAction.createOperation(key, ItemAction.Types.create);

      expect(operation.implementation).toBe('item');
      expect(operation.type).toBe(ItemAction.Types.create);
      expect(operation.key).toBe(key);
      expect(operation.getStatus()).toBe('ready');
      expect(operation.events.create.at).toBeInstanceOf(Date);
      expect(operation.events.start.at).toBeNull();
      expect(operation.events.complete?.at).toBeNull();
      expect(operation.events.failed?.at).toBeNull();
    });

    test('operation lifecycle works correctly', () => {
      const key: PriKey<'test'> = cPK('1', 'test');
      const operation = ItemAction.createOperation(key, ItemAction.Types.create);

      operation.start();
      expect(operation.getStatus()).toBe('running');
      expect(operation.events.start.at).toBeInstanceOf(Date);

      operation.complete();
      expect(operation.getStatus()).toBe('finished');
      expect(operation.events.complete?.at).toBeInstanceOf(Date);
    });

    test('operation can fail', () => {
      const key: PriKey<'test'> = cPK('1', 'test');
      const operation = ItemAction.createOperation(key, ItemAction.Types.create);

      operation.start();
      operation.fail();
      expect(operation.getStatus()).toBe('failed');
      expect(operation.events.failed?.at).toBeInstanceOf(Date);
    });
  });
});
