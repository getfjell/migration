import * as Action from "./Action";
import * as Runner from "./Runner";

export interface URI {
    readonly scheme: string;
    readonly authority: string;
    readonly path: {
        readonly year: number;
        readonly month: number;
        readonly day: number;
        readonly sequence: number;
        readonly name: string;
    }
    readonly toString: () => string;
}

export interface Definition {
  readonly uri: URI;
  readonly description: string;
  // Returning void should be emphasized here, the migration acts upon the context and returns nothing.
  migrate: (context: Context) => Promise<void>;
}

export type Status = 'ready' |'running' | 'finished' | 'failed';

export interface Context {
  readonly implementation: string;
  readonly type: string;
  readonly operations: Action.Operation[];
  readonly events: {
    create: { at: Date },
    start?: { at: Date | null},
    complete?: { at: Date | null },
    failed?: { at: Date | null },
  }
  start: () => void;
  complete: () => void;
  fail: () => void;
  addOperation: (operation: Action.Operation) => void;
  getStatus: () => Status;
}

export const parseURI = (uri: string): URI => {
  const uriRegex = /^([a-zA-Z]+):\/\/([^\/]+)\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d+)\/([^\/]+)$/;
       
  if (!uriRegex.test(uri)) {
    throw new Error(
      `Invalid migration URI format: ${uri}. Expected format: scheme://authority/year/month/day/sequence/name`);
  }
      
  const parts = uri.match(uriRegex);
      
  // istanbul ignore next
  if (!parts) {
    throw new Error(`Failed to parse migration URI: ${uri}`);
  }
      
  const [, scheme, authority, year, month, day, sequence, name] = parts;
      
  return createURI(
    scheme,
    authority,
    {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      sequence: parseInt(sequence),
      name
    }
  );
};
      
export const createURI = (
  scheme: string,
  authority: string,
  path :
          { year: number, month: number, day: number, sequence: number, name: string }
): URI => {
  return {
    scheme,
    authority,
    path,
    toString: () => `${scheme}://${authority}/${path.year}/${path.month}/${path.day}/${path.sequence}/${path.name}`
  };
};
      
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createDefinition = (uri: URI, description: string, props: Record<string, any> = {}): Definition => {
       
  const migrate = async (context: Context): Promise<void> => {

    // Default implementation simply add a default operation, starts it and completes it.
    const defaultOperation = Action.createOperation();
    context.addOperation(defaultOperation);
    defaultOperation.start();
    defaultOperation.complete();

    // The default implementation also completed the migration.
    context.complete();
  };
      
  return {
    uri,
    description,
    migrate,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createContext = (runnerContext: Runner.Context): Context => {

  let status: Status = 'ready';

  const operations: Action.Operation[] = [];

  const events: Context['events'] = {
    create: { at: new Date() },
    start: { at: null },
    complete: { at: null },
    failed: { at: null },
  };

  const start = () => {
    events.start = { at: new Date() };
    status = 'running';
  };

  const complete = () => {
    events.complete = { at: new Date() };
    status = 'finished';
  };

  const fail = () => {
    events.failed = { at: new Date() };
    status = 'failed';
  };

  const addOperation = (operation: Action.Operation) => {
    operations.push(operation);
  };

  const getStatus = () => {
    return status;
  };

  return {
    implementation: 'default',
    type: 'migration',
    operations,
    events,
    start,
    complete,
    fail,
    addOperation,
    getStatus,
  }
}