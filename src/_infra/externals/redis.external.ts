import Redis from "ioredis";
import { IRedisExternal } from "../../_common/ports/externals/redis-external.interface";
import { IConfigUtil } from "../../_common/utils/config.util";

export const RedisExternal = (configUtil: IConfigUtil): IRedisExternal => {
  const redisClient: Redis = new Redis({
    host: configUtil.parsed().REDIS_HOST,
    port: configUtil.parsed().REDIS_PORT,
  });

  const get = async (key: string): Promise<string | null> => {
    return redisClient.get(key);
  };

  const getMany = async (keys: string[]): Promise<(string | null)[]> => {
    return redisClient.mget(keys);
  };

  const set = async (
    key: string,
    data: string,
    ttl?: number,
  ): Promise<void> => {
    if (!ttl) {
      redisClient.set(key, data);
    } else {
      redisClient.set(key, data, "EX", ttl);
    }
  };

  const setIfNotExist = async (
    key: string,
    data: string,
    ttl?: number,
  ): Promise<boolean> => {
    if (!ttl) {
      const res = await redisClient.setnx(key, data);
      if (res === 1) {
        return true;
      } else {
        return false;
      }
    } else {
      const res = await redisClient.set(key, data, "EX", ttl, "NX");
      if (res === "OK") {
        return true;
      } else {
        return false;
      }
    }
  };

  const del = async (key: string): Promise<number> => {
    return await redisClient.del(key);
  };

  const delIfMatched = async (key: string, value: string): Promise<boolean> => {
    // 값을 찾아서, 일치하면 삭제하는 원자적 연산
    const result = await redisClient.eval(
      `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
      `,
      1,
      key,
      value,
    );
    return result === 1;
  };

  const getMembersFromSet = async (key: string): Promise<string[]> => {
    return await redisClient.smembers(key);
  };

  const addToSet = async (key: string, data: string): Promise<number> => {
    return await redisClient.sadd(key, data);
  };

  const removeMemberFromSet = async (
    key: string,
    value: string,
  ): Promise<number> => {
    return await redisClient.srem(key, value);
  };

  const popFromSet = async (key: string, count: number): Promise<string[]> => {
    return await redisClient.spop(key, count);
  };

  const increase = async (key: string): Promise<number> => {
    return await redisClient.incr(key);
  };

  const decrease = async (key: string): Promise<number> => {
    return await redisClient.decr(key);
  };

  return {
    get,
    getMany,
    set,
    setIfNotExist,
    del,
    delIfMatched,
    getMembersFromSet,
    addToSet,
    removeMemberFromSet,
    popFromSet,
    increase,
    decrease,
  };
};
