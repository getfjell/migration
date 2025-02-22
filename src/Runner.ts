import * as Migration from "./Migration";
import * as Environment from "./Environment";
import LibLogger from '@/logger';

const logger = LibLogger.get('Runner');

/**
 * A runner is a wrapper around a migration and a list of contexts.
 * It is used to run the migration and return the results.  It's important to understand that there is a runner
 * that likely corresponds to each migration, and it is the runner that is responsible for the exeuction of
 * the migration.
 *
 * The runner has a context, and that context contains the status of the runner and any information on overall
 * progress.
 */
export interface Engine {
    context: Context;

    // This is intentional, initialize prepare the engine for being run, and a positive outcome is void.
    // The end-state here is that enging is full of contexts, and the result is void.
    initialize: () => Promise<void>;

    // This is intentional, run is the actual execution of the migration, and a positive outcome is void.
    // The Engine is acting upon contexts, and the result is void.
    run: () => Promise<void>;

    addMigrationContext: (context: Migration.Context) => void;
}

// TODO: Is Context a higher level?
export interface Context {
  implementation: string,
  type: string,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (environmentContext: Environment.Context): Context => {
  return {
    implementation: 'default',
    type: 'runner',
  }
}

export const createEngine =
  (migrationDefinition: Migration.Definition, environmentContext: Environment.Context): Engine => {

    const migrationContexts: Migration.Context[] = [];

    const runnerContext = createContext(environmentContext);

    const run = async (): Promise<void> => {
      logger.info(`Running migration %s`, migrationDefinition.uri);

      let count = 0;
      for (const context of migrationContexts) {
        await migrationDefinition.migrate(context);
        count++;
        if(count % 100 === 0) {
          logger.info(`Running migration %s, Processed %d items`, migrationDefinition.uri, count);
        }
      }
      logger.info(`Finished running migration %s, Processed %d items`, migrationDefinition.uri, count);
    }

    const initialize = async (): Promise<void> => {
      // Do nothing in the abstract runner
    }

    const addMigrationContext = (context: Migration.Context) => {
      migrationContexts.push(context);
    }

    return {
      context: runnerContext,
      run,
      initialize,
      addMigrationContext,
    }
  }