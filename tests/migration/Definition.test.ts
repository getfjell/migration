import * as Environment from '@/Environment';
import * as Migration from '@/Migration';
import * as Runner from '@/Runner';

describe('Migration.Definition', () => {
  
  let environmentContext: Environment.Context;
  let runnerContext: Runner.Context;

  beforeAll(() => {
    environmentContext = Environment.createContext();
    runnerContext = Runner.createContext(environmentContext);
  })

  describe('createDefinition default', () => {
    it('should create a valid migration object', async () => {
      const uri = Migration.createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      const description = 'Test migration';

      const migration = Migration.createDefinition(uri, description);

      expect(migration.uri).toBe(uri);
      expect(migration.description).toBe(description);
      expect(migration.migrate).toBeDefined();

      const context = Migration.createContext(runnerContext);
      await migration.migrate(context);

      expect(context.getStatus()).toBe('finished');
    });
  });

  describe('createDefinition override migrate', () => {
    it('should create a valid migration object', async () => {
      const uri = Migration.createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      const description = 'Test migration';

      const definition: Migration.Definition = {
        ...Migration.createDefinition(uri, description),
        migrate: async (context: Migration.Context) => {
          context.complete();
        },
      };

      expect(definition.uri).toBe(uri);
      expect(definition.description).toBe(description);
      expect(definition.migrate).toBeDefined();
      
      const context = Migration.createContext(runnerContext);

      const runner = Runner.createEngine(definition, environmentContext);
      runner.addMigrationContext(context);

      await runner.run();

      expect(context.getStatus()).toBe('finished');
    });
  });

  describe('createDefinition override migrate and transform input to output', () => {
    it('should create a valid migration object', async () => {
      const uri = Migration.createURI('test', 'example.com', {
        year: 2024,
        month: 3,
        day: 15,
        sequence: 1,
        name: 'test-migration'
      });
      const description = 'Test migration';

      const inputString = 'Hello, world!';
      const outputString = 'Boo!';

      type TestContext = Migration.Context & {
          input: string;
          output?: string;
        }

      const createTestContext = (input: string): TestContext => {
        return {
          ...Migration.createContext(runnerContext),
          input,
        }
      }

      const createDefinition = (): Migration.Definition => {
        const definition = Migration.createDefinition(uri, description);

        const migrate = async (pContext: TestContext | Migration.Context) => {
          // Why do I have to case here?
          const context = pContext as TestContext;
          context.output = outputString;
          context.complete();
        };

        return {
          ...definition,
          migrate,
        } as Migration.Definition;
      };

      const definition = createDefinition();

      expect(definition.uri).toBe(uri);
      expect(definition.description).toBe(description);
      expect(definition.migrate).toBeDefined();
      
      const context = createTestContext(inputString);

      const runner = Runner.createEngine(definition, environmentContext);
      runner.addMigrationContext(context);
      await runner.run();

      expect(context.getStatus()).toBe('finished');
      expect(context.output).toBe(outputString);
    });
  });
});
