import { createCache } from 'cache-manager';

interface CacheableOptions {
  ttl: number | { h?: number, m?: number, s?: number }; // Time to live in milliseconds
  keyPrefix?: Array<number | [number, string]>; // Array is in case objects with key.
  namespace?: string; // Optional namespace for the cache key
}

const cache = createCache({
  ttl: 10000,
  refreshThreshold: 3000,
})

export function fetchCache(keys: string[]): any {
  return cache.get(keys.join(':'));
}

export function setCache(keys: string[], value: any, ttl?: number) {
  return cache.set(keys.join(':'), value, ttl);
}

export function delCache(keys: string[]) {
  return cache.del(keys.join(':'));
}


export function Cacheable(options: CacheableOptions) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const cacheNamespace = options.namespace ? options.namespace : propertyName;

    descriptor.value = async function (...args: any[]) {
      // Maybe add service name?
      const key = !options.keyPrefix ? cacheNamespace : cacheNamespace + ':' + options.keyPrefix.map(p =>
        Array.isArray(p) ? args[p[0]][p[1]] : args[p]
      ).join(':');
      return await cache.wrap(key, async () => {
        return await originalMethod.apply(this, args);
      }, ttlToMs(options.ttl));
    };

    return descriptor;
  };
}

interface DeCacheOptions {
  keyPrefix?: Array<number | [number, string]>; // Array is in case objects with key.
  namespace?: string; // Optional namespace for the cache key
}

export function DeCaches(options: DeCacheOptions) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const cacheNamespace = options.namespace ? options.namespace : propertyName;
    descriptor.value = async function (...args: any[]) {
      const key = !options.keyPrefix ? cacheNamespace : cacheNamespace + ':' + options.keyPrefix.map(p =>
        Array.isArray(p) ? args[p[0]][p[1]] : args[p]
      ).join(':');
      await delCache([key]);
      return await originalMethod.apply(this, args);
    };
    return descriptor;
  };
}


function ttlToMs(ttl: CacheableOptions['ttl']): number {
  if (typeof ttl === 'number') {
    return ttl;
  }
  let ms = 0;
  if (ttl?.m) ms += ttl.m * 60 * 1000;
  if (ttl?.h) ms += ttl.h * 60 * 60 * 1000;
  if (ttl?.s) ms += ttl.s * 1000;
  return ms;
}