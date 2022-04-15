import {
  createLocalResolvers,
  createSchema,
  withSync,
  withBackup,
  InMemoryDataSource,
} from 'contentful-local-schema';
import ApollosConfig from '@apollosproject/config';
import AsyncStorage from '@react-native-community/async-storage';
import { printSchema } from 'graphql';
import { debounce, throttle } from 'lodash';

// import contentfulSchema from '../../contentful-schema.gql';
import contentfulSchemaJson from '../../contentful-schema.json';
import { createClient } from './contentful/client';

const dataSource = new InMemoryDataSource();

const spaceId = ApollosConfig.CONTENTFUL_SPACE || 'vsbnbtnlrnnr';
const environmentId = ApollosConfig.CONTENTFUL_ENVIRONMENT || 'master';
const contentfulClient = createClient({
  accessToken:
    ApollosConfig.CONTENTFUL_REST_KEY ||
    'k8mCSPw_UbsnK3XgC4JYpPVihDyRNLv5ZRZbfgcM6pg',
  space: spaceId,
  environmentId,
});

const enhancedDataSource = withSync(
  withBackup(
    dataSource,
    AsyncStorage,
    `contentful/${spaceId}/${environmentId}`
  ),
  contentfulClient
);

const options = {
  contentTypes: contentfulSchemaJson.contentTypes,
  namespace: 'Local',
  queryNamespace: 'local',
};
const localSchema = printSchema(createSchema(options));

const localResolvers = createLocalResolvers(enhancedDataSource, options);

export const resyncContentful = debounce(
  () => {
    const syncPromise = enhancedDataSource.sync();
    // In the background, after the sync finishes, backup to AsyncStorage.
    // If this fails, we don't really care because at least the sync succeeded.
    syncPromise.then(() => enhancedDataSource.backup()).catch((ex) => {
      console.error('Post-sync backup failed', ex);
    });

    return syncPromise;
  },
  1500,
  { leading: true }
);

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
