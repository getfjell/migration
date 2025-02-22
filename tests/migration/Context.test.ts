import { Environment } from '@/index';
import { Runner } from '@/index';
import * as Migration from '@/Migration';

describe('Context', () => {

  let runnerContext: Runner.Context;

  beforeAll(() => {
    runnerContext = Runner.createContext(Environment.createContext());
  })

  describe('createContext', () => {
    it('should create a context with initial state', () => {
      const context = Migration.createContext(runnerContext);

      expect(context.getStatus()).toBe('ready');
    });

    it('should add results when pushing', () => {
      const createContext = jest.mocked(Migration.createContext);
      const context1 = createContext(runnerContext);
      const context2 = createContext(runnerContext);

      context1.complete();
      context2.complete();

      expect(context1.getStatus()).toBe('finished');
      expect(context2.getStatus()).toBe('finished');
    });
  });
});
