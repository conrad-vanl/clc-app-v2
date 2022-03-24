import {
  createLocalResolvers,
  createSchema,
  withSync,
  withBackup,
  InMemoryDataSource,
} from 'contentful-local-schema';
import AsyncStorage from '@react-native-community/async-storage';
import { printSchema } from 'graphql';

// import contentfulSchema from '../../contentful-schema.gql';
import contentfulSchemaJson from '../../contentful-schema.json';
import { createClient } from './contentful/client';

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

const options = {
  contentTypes: contentfulSchemaJson.contentTypes,
  namespace: 'Local',
  queryNamespace: 'local',
};
const localSchema = printSchema(createSchema(options));

const localResolvers = createLocalResolvers(enhancedDataSource, options);

export function resyncContentful(): Promise<void> {
  const syncPromise = enhancedDataSource.sync();
  // In the background, after the sync finishes, backup to AsyncStorage.
  // If this fails, we don't really care because at least the sync succeeded.
  syncPromise.then(() => enhancedDataSource.backup()).catch((ex) => {
    console.error('Post-sync backup failed', ex);
  });

  return syncPromise;
}

// Import the current state from AsyncStorage
const restoreComplete = enhancedDataSource.restore();

// After restore is complete, sync
const syncComplete = restoreComplete
  .then(
    () => resyncContentful(),
    (ex) => {
      // eslint-disable-next-line no-console
      console.error('Restore failed, executing full sync', ex);
      return resyncContentful();
    }
  )
  .catch((ex) => {
    console.error('sync failed', ex);
    throw ex;
  });

// syncComplete promise includes restoreComplete
const ensureContentfulLoaded = syncComplete;

export { localSchema, localResolvers, ensureContentfulLoaded };
