import {
  createLocalResolvers,
  createSchema,
  withSync,
  withBackup,
  InMemoryDataSource,
} from 'contentful-local-schema';
import AsyncStorage from '@react-native-community/async-storage';
import contentfulSchema from '../../contentful-schema.json';
import { createClient } from './contentful/client';

const options = {
  contentTypes: contentfulSchema.contentTypes,
};
const localSchema = createSchema(options);

const dataSource = new InMemoryDataSource();

const spaceId = 'vsbnbtnlrnnr';
const contentfulClient = createClient({
  accessToken: 'k8mCSPw_UbsnK3XgC4JYpPVihDyRNLv5ZRZbfgcM6pg',
  space: spaceId,
});

const enhancedDataSource = withSync(
  withBackup(dataSource, AsyncStorage, `contentful/${spaceId}`),
  contentfulClient
);

const localResolvers = createLocalResolvers(enhancedDataSource, options);console.log('created resolvers');

// Import the current state from AsyncStorage
const restoreComplete = enhancedDataSource.restore();

// After restore is complete, sync
const syncComplete = restoreComplete.then(
  () => {
    return enhancedDataSource.sync();
  },
  (ex) => {
    // eslint-disable-next-line no-console
    console.error('Restore failed, executing full sync', ex);
    return enhancedDataSource.sync();
  }
).catch((ex) => {
  console.error('Error in sync', ex, ex.stack)
});

// syncComplete promise includes restoreComplete
const ensureContentfulLoaded = syncComplete;

export { localSchema, localResolvers, ensureContentfulLoaded };
