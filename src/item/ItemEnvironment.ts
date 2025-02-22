import * as Environment from '@/Environment';
import * as Library from '@fjell/lib';

// TODO: I think Environment is a higher level than the Runner
// TODO: This should probably be defined higher in the abstraction, but I'm just implementing here because
// the initial versions just had an empty type in ../Runner.ts
export interface Context extends Environment.Context {
    libRegistry: Library.Registry;
  }

export const createContext = (libRegistry: Library.Registry): Context => {
  const context = Environment.createContext();
  return {
    ...context,
    implementation: "item",
    libRegistry,
  }
}