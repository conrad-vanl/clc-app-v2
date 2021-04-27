/* eslint-disable no-console */
import { DataSource } from 'apollo-datasource';
import Redis from 'ioredis';
import url from 'url'


// https://devcenter.heroku.com/articles/securing-heroku-redis#using-node-js
const redis_uri = url.parse(process.env.REDIS_URL ? process.env.REDIS_URL : "redis://127.0.0.1:6379/0")

const options = redis_uri.protocol.includes('rediss') ? {
  port: Number(redis_uri.port),
  host: redis_uri.hostname || undefined,
  password: redis_uri.auth && redis_uri.auth.split(':')[1] || undefined,
  db: 0,
  tls: {
    rejectUnauthorized: false,
    requestCert: true,
  }
} : {
  port: Number(redis_uri.port),
  host: redis_uri.hostname || undefined,
  password: redis_uri.auth && redis_uri.auth.split(':')[1] || undefined,
  db: 0,
}

let REDIS;

const parseKey = (key) => {
  if (Array.isArray(key)) {
    return key.join(':');
  }
  return key;
};

export default class Cache extends DataSource {
  constructor(...args) {
    super(...args);
    // Memoize the REDIS instance so the connection can be resued.
    if (process.env.REDIS_URL && !REDIS) {
      REDIS = new Redis({
        ...options,
        keyPrefix: `apollos-cache-${process.env.NODE_ENV}`,
      });
    }
    this.redis = REDIS;
  }

  // 24 hours in seconds.
  DEFAULT_TIMEOUT = 86400;

  safely = async (func) => {
    if (!this.redis) return null;
    try {
      // Redundent assignment because it makes sure the error is captured.
      const result = await func();
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  async set({ key, data, expiresIn = this.DEFAULT_TIMEOUT }) {
    return this.safely(() =>
      this.redis.set(parseKey(key), JSON.stringify(data), 'EX', expiresIn)
    );
  }

  async get({ key }) {
    return this.safely(async () => {
      const data = await this.redis.get(parseKey(key));
      return JSON.parse(data);
    });
  }

  async increment({ key }) {
    return this.safely(() => this.redis.incr({ key: parseKey(key) }));
  }

  async decrement({ key }) {
    return this.safely(() => this.redis.decr({ key: parseKey(key) }));
  }
}
