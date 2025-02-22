import * as Migration from '@/Migration';
import { AllItemTypeArrays, IQFactory, Item, ItemQuery, LocKeyArray } from "@fjell/core";
import * as Library from '@fjell/lib';
import * as ItemRunner from './ItemRunner';
/**
 * The Definition of a migration for ItemMigration contains the properties required
 * to query for items to run the migration against.  It also contains the migration
 * logic in the migrate function.
 */
// TODO: I anticipate more complexity here in the future.
export interface Definition<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
> extends Migration.Definition {
  kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>;
  query: ItemQuery;
  location?: LocKeyArray<L1, L2, L3, L4, L5> | [];
  migrate: (context: Context<V, S, L1, L2, L3, L4, L5> | Migration.Context) => Promise<void>;
  batchSize?: number;
}

/**
 * The context for an item migration contains a required input of a single item.  This is the item that will be
 * acted upon for the migration.  It also contains an optional output of a single item.  This is the item that
 * will be returned after the migration is complete.
 */
// TODO: I anticipate more complexity here in the future.
export interface Context<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
> extends Migration.Context {
    ik: V['key'];
    output?: V | null;
    lib: Library.Operations<V, S, L1, L2, L3, L4, L5>;
}

export const createDefinition = <
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
>(
    uri: Migration.URI,
    description: string,
    kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>,
    {
      query = IQFactory.all().toQuery(),
      location = [],
      batchSize = 100,
    }:
    {
      query: ItemQuery,
      location?: LocKeyArray<L1, L2, L3, L4, L5> | [],
      batchSize?: number,
    }
  // eslint-disable-next-line max-params
  ): Definition<V, S, L1, L2, L3, L4, L5> => {

  const migration = Migration.createDefinition(uri, description);

  const migrate = async (context: Context<V, S, L1, L2, L3, L4, L5> | Migration.Context): Promise<void> => {
    context.complete();
  }

  return {
    ...migration,
    migrate,
    kta,
    query,
    location,
    batchSize,
  } as Definition<V, S, L1, L2, L3, L4, L5>;
}

export const createContext = <
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
>(
    lib: Library.Operations<V, S, L1, L2, L3, L4, L5>,
    ik: V['key'],
    runnerContext: ItemRunner.Context<V, S, L1, L2, L3, L4, L5>,
  ): Context<V, S, L1, L2, L3, L4, L5> => {
  return {
    ...Migration.createContext(runnerContext),
    lib,
    ik,
  };
}
