import * as Action from '@/Action';
import { createType } from '@/Action';
import { ComKey, PriKey} from '@fjell/core';

export interface CreateType extends Action.Type {
  name: 'create';
  description: 'Create an Item';
  implementation: 'item';
}

export interface UpdateType extends Action.Type {
  name: 'update';
  description: 'Update an Item';
  implementation: 'item';
}

export interface RemoveType extends Action.Type {
  name: 'remove';
  description: 'Remove an Item';
  implementation: 'item';
}

export type Type = CreateType | UpdateType | RemoveType;

export const Types = {
  create: createType('create', 'Create an Item', 'item'),
  update: createType('update', 'Update an Item', 'item'),
  remove: createType('remove', 'Remove an Item', 'item'),
} as {
  create: CreateType;
  update: UpdateType;
  remove: RemoveType;
};
  
export interface Operation<
S extends string,
L1 extends string = never,
L2 extends string = never,
L3 extends string = never,
L4 extends string = never,
L5 extends string = never
> extends Action.Operation {
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>;
    type: Type;
}

export const createOperation = <
S extends string,
L1 extends string = never,
L2 extends string = never,
L3 extends string = never,
L4 extends string = never,
L5 extends string = never
>(key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>, type: Type): Operation<S, L1, L2, L3, L4, L5> => {

  const operation = Action.createOperation('item', type);

  return {
    ...operation,
    key,
  } as Operation<S, L1, L2, L3, L4, L5>;
}