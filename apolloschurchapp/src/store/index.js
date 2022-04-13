import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import { schema as mediaPlayerSchema } from '@apollosproject/ui-media-player';
import { updatePushId } from '@apollosproject/ui-notifications';
import CACHE_LOADED from '../client/getCacheLoaded'; // eslint-disable-line
import { present } from '../util';

// TODO: this will require more organization...ie...not keeping everything in one file.
// But this is simple while our needs our small.

export const schema = `
  type Query {
    devicePushId: String
    cacheLoaded: Boolean
    notificationsEnabled: Boolean
  }

  type Mutation {
    cacheMarkLoaded: Boolean
    updateDevicePushId(pushId: String!): String
    updatePushPermissions(enabled: Boolean!): Boolean

    markNotificationsRead(ids: [String]!): Boolean

    markConsequenceChosen(id: String!): Boolean
    markConsequenceUnlocked: Boolean
  }

  extend type Notification {
    read: Boolean
  }

  extend type Local_ConsequenceCollection {
    chosen: String!
  }
${mediaPlayerSchema || ''}
`;

export const defaults = {
  __typename: 'Query',
  cacheLoaded: false,
};

const GET_LOGGED_IN = gql`
  query {
    isLoggedIn @client
  }
`;

export const GET_ALL_DATA = gql`
  query {
    isLoggedIn @client
    cacheLoaded @client
    notificationsEnabled @client
  }
`;

export const resolvers = {
  Mutation: {
    cacheMarkLoaded: async (root, args, { cache, client }) => {
      cache.writeQuery({
        query: CACHE_LOADED,
        data: {
          cacheLoaded: true,
        },
      });
      const { data: { isLoggedIn } = {} } = await client.query({
        query: GET_LOGGED_IN,
      });

      const { pushId } = cache.readQuery({
        query: gql`
          query {
            pushId @client
          }
        `,
      });

      if (isLoggedIn && pushId) {
        updatePushId({ pushId, client });
      }
      return null;
    },
    markNotificationsRead: async (root, args) => {
      const ids = (args.ids || []).filter(present);

      await AsyncStorage.multiSet(
        ids.map((id) => [`Notification/${id}/read`, 'true'])
      );

      return true;
    },
    markConsequenceChosen: async (root, args) => {
      if (args.id) {
        await _markConsequenceChosen(args.id);
        return true;
      }
    },
    markConsequenceUnlocked: async () => {
      await _markConsequenceUnlocked();
      return true;
    },
  },
  Notification: {
    read: async ({ id }) =>
      (await AsyncStorage.getItem(`Notification/${id}/read`)) == 'true',
  },
  Local_ConsequenceCollection: {
    chosen: async () => getChosenConsequenceId(),
  },
};

let chosenConsequenceId = null;

async function _markConsequenceChosen(id) {
  await AsyncStorage.setItem(`Local_ConsequenceCollection/chosen`, id);
  chosenConsequenceId = id;

  return true;
}

async function _markConsequenceUnlocked() {
  await AsyncStorage.removeItem(`Local_ConsequenceCollection/chosen`);
  chosenConsequenceId = null;

  return true;
}

async function getChosenConsequenceId() {
  if (chosenConsequenceId) {
    return chosenConsequenceId;
  }

  const id = await AsyncStorage.getItem(`Local_ConsequenceCollection/chosen`);
  chosenConsequenceId = id;
  return id;
}
