export type Context = {
    implementation: string,
    type: string,
}

export const createContext = () => {
  return {
    implementation: 'default',
    type: 'environment',
  }
}