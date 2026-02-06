export interface IRedisExternal {
  get(key: string): Promise<string | null>;
  getMany(keys: string[]): Promise<(string | null)[]>;
  set(key: string, data: string, ttl?: number): Promise<void>;
  setIfNotExist(key: string, data: string, ttl?: number): Promise<boolean>;
  del(key: string): Promise<number>;
  delIfMatched(key: string, value: string): Promise<boolean>;

  getMembersFromSet(key: string): Promise<string[]>;
  addToSet(key: string, data: string): Promise<number>;
  removeMemberFromSet(key: string, value: string): Promise<number>;
  popFromSet(key: string, count: number): Promise<string[]>;

  increase(key: string): Promise<number>;
  decrease(key: string): Promise<number>;
}
