import * as Migration from '@/Migration';
import * as Environment from '@/Environment';
import * as Runner from '@/Runner';

describe('Runner.Engine', () => {

  let uri: Migration.URI;
  let description: string;
  let definition: Migration.Definition;
  let environmentContext: Environment.Context;
  let runnerContext: Runner.Context;

  beforeAll(() => {
    uri = Migration.createURI('test', 'example.com', {
      year: 2024,
      month: 3,
      day: 15,
      sequence: 1,
      name: 'test-migration'
    });
    description = 'Test migration';
    definition = Migration.createDefinition(uri, description);
    environmentContext = Environment.createContext();
    runnerContext = Runner.createContext(environmentContext);
  })

  describe('createRunner', () => {
    it('should create a runner with migration and contexts', () => {
      const contexts = [
        Migration.createContext(runnerContext),
        Migration.createContext(runnerContext)
      ];

      const runner = Runner.createEngine(definition, environmentContext);
      runner.addMigrationContext(contexts[0]);
      runner.addMigrationContext(contexts[1]);

      expect(runner.context).toStrictEqual(runnerContext);
      expect(runner.initialize).toBeDefined();
      expect(runner.run).toBeDefined();
    });

    it('should run migration for all contexts', async () => {
      const uri = Migration.createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      const description = 'Test migration';

      const migrateMock = jest.fn().mockImplementation(async (context: Migration.Context) => {
        context.complete();
        return context;
      });

      const definition: Migration.Definition = {
        ...Migration.createDefinition(uri, description),
        migrate: migrateMock
      };

      const contexts = [
        Migration.createContext(runnerContext),
        Migration.createContext(runnerContext)
      ];

      const runner = Runner.createEngine(definition, environmentContext);
      runner.addMigrationContext(contexts[0]);
      runner.addMigrationContext(contexts[1]);
      await runner.run();

      expect(migrateMock).toHaveBeenCalledTimes(2);
      expect(migrateMock).toHaveBeenCalledWith(contexts[0]);
      expect(migrateMock).toHaveBeenCalledWith(contexts[1]);
      
      contexts.forEach(context => {
        expect(context.getStatus()).toBe('finished');
      });
    });

    it('should handle migration failures', async () => {
      const uri = Migration.createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      const description = 'Test migration';
      const errorMessage = 'Migration failed';

      const definition: Migration.Definition = {
        ...Migration.createDefinition(uri, description),
        migrate: async () => {
          throw new Error(errorMessage);
        }
      };

      const contexts = [Migration.createContext(runnerContext)];
      const runner = Runner.createEngine(definition, environmentContext);
      runner.addMigrationContext(contexts[0]);

      await expect(runner.run()).rejects.toThrow(errorMessage);
    });
  });
});
