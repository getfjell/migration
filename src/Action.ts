
export type Status = 'ready' |'running' | 'finished' | 'failed';

export interface Operation {
    readonly implementation: string;
    readonly type: Type;
    readonly events: {
        create: { at: Date },
        start: { at: Date | null},
        complete?: { at: Date | null },
        failed?: { at: Date | null },
    };

    start: () => void;
    complete: () => void;
    fail: () => void;
    getStatus: () => Status;
  }

export interface Type {
    readonly name: string;
    readonly description: string;
    readonly implementation: string;
}

export const createOperation = (
  implementation: string = 'default',
  type: Type = { name: 'default', description: 'default', implementation: 'default' },
): Operation => {

  let status: Status = 'ready';

  const events: Operation['events'] = {
    create: { at: new Date() },
    start: { at: null },
    complete: { at: null },
    failed: { at: null },
  } ;

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

  const getStatus = () => {
    return status;
  };

  return {
    implementation,
    type,
    events,
    start,
    complete,
    fail,
    getStatus,
  };
}

export const createType = (
  name: string = 'default',
  description: string = 'default',
  implementation: string = 'default',
): Type => {
  return {
    name,
    description,
    implementation,
  };
}
  
