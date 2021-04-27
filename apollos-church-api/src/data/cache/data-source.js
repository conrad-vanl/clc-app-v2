/* eslint-disable no-console */
import { DataSource } from 'apollo-datasource';
import {Client} from 'memjs';

let CLIENT;

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
    if (!CLIENT) {
      CLIENT = Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
        username: process.env.MEMCACHEDCLOUD_USERNAME,
        password: process.env.MEMCACHEDCLOUD_PASSWORD
      });
    }
    this.client = CLIENT;
  }

  // 24 hours in seconds.
  DEFAULT_TIMEOUT = 86400;

  safely = async (func) => {
    if (!this.client) return null;
    try {
      // Redundent assignment because it makes sure the error is captured.
      const result = await func();
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  async set({ key, data, expires = this.DEFAULT_TIMEOUT }) {
    return this.safely(() => {
      if (data === undefined || data === null) {
        return this.client.delete(parseKey(key))
      }
      return this.client.set(parseKey(key), JSON.stringify(data), { expires })
    });
  }

  async get({ key }) {
    return this.safely(async () => {
      const data = await this.client.get(parseKey(key));
      if (!data.value) {
        return null
      }
      return JSON.parse(data.value.toString());
    });
  }
}
