export interface IUnitOfWork {
  execute<T>(fn: () => Promise<T>): Promise<T>;
}
