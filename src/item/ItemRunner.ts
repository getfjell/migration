import * as Runner from "@/Runner";
import { abbrevQuery, AllItemTypeArrays, Item } from "@fjell/core";
import * as Library from "@fjell/lib";
import * as ItemEnvironment from "./ItemEnvironment";
import * as ItemMigration from "./ItemMigration";
import LibLogger from "@/logger";

const logger = LibLogger.get('item','ItemRunner');

export interface Engine<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
> extends Runner.Engine {
    context: Context<V, S, L1, L2, L3, L4, L5>;
    run: () => Promise<void>;
}

export interface Context<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
> extends Runner.Context {
  lib: Library.Operations<V, S, L1, L2, L3, L4, L5>;
}

export const createEngine = <
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
>(
    migrationDefinition: ItemMigration.Definition<V, S, L1, L2, L3, L4, L5>,
    environmentContext: ItemEnvironment.Context,
  ) => {

  const engine: Runner.Engine = Runner.createEngine(migrationDefinition, environmentContext);

  const { kta, query, location, batchSize } = migrationDefinition;

  const context: Context<V, S, L1, L2, L3, L4, L5> = createContext(environmentContext, kta);

  const initialize = async (): Promise<void> => {
    const lib = context.lib;

    let offset = 0;
    const limit = batchSize || 100;
    
    const currentQuery = {
      ...query,
      limit,
      offset,
    };

    let count = 0;
    while (true) {
      logger.info(`Querying for ${kta} items using query ${abbrevQuery(query)} ` +
        `and location ${location?.toString()} with offset ${offset} and limit ${limit}`);
      const items = await lib.all(currentQuery, location);
      if (items.length === 0) {
        break;
      }
      for (const item of items) {
        logger.default(
          `Creating migration context for item ${item.key.pk} for migration ${migrationDefinition.uri.toString()}`);
        const migrationContext = ItemMigration.createContext(lib, item.key, context);
        engine.addMigrationContext(migrationContext);
        count++;
      }
      offset += limit;
      currentQuery.offset = offset;
    }

    logger.default(`Finished querying for ${kta} items using query ${abbrevQuery(query)} ` +
      `and location ${location?.toString()} with offset ${offset} and limit ${limit}`);
    logger.info(`Created context for ${count} items`);
  }

  const run = async () => {
    await engine.run();
  }

  return {
    ...engine,
    context,
    run,
    initialize,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = <
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
>(
    environmentContext: ItemEnvironment.Context,
    kta: AllItemTypeArrays<S, L1, L2, L3, L4, L5>
  ): Context<V, S, L1, L2, L3, L4, L5> => {
  const context = Runner.createContext(environmentContext);
  const libRegistry = environmentContext.libRegistry;
  const libInstance = libRegistry.get(kta as unknown as string[]) as Library.Instance<V, S, L1, L2, L3, L4, L5>;
  const libOperations = libInstance.operations;
  return {
    ...context,
    implementation: 'default',
    type: 'runner',
    lib: libOperations,
  }
}

