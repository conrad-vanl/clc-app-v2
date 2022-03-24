import * as OneSignalOriginal from '@apollosproject/data-connector-onesignal';
import gql from 'graphql-tag';
import ApollosConfig from '@apollosproject/config';

const { ONE_SIGNAL } = ApollosConfig;

export const schema = gql`
  ${OneSignalOriginal.schema}

  type Notification {
    id: ID!
    headings: String
    contents: String
    completed_at: Int!
    url: String
  }

  type NotificationHistory {
    total: Int!
    items: [Notification]
  }

  extend type Query {
    oneSignalHistory(pushId: String): NotificationHistory
  }
`;

export const resolver = {
  ...OneSignalOriginal.resolver,
  Query: {
    ...OneSignalOriginal.resolver.Query,
    oneSignalHistory: async (_query, args, { dataSources }) => {
      console.log('pushId', args.pushId);
      const cacheKey = `oneSignalHistory`;
      const cached = await dataSources.Cache.get({ key: cacheKey });
      if (cached !== undefined && cached !== null) {
        return cached;
      }

      const data = await dataSources.OneSignal.getHistory();
      const result = {
        total: data.total_count,
        items: data.notifications
          .filter((n) => !n.include_player_ids) // not specifically targeted
          .map((n) => formatNotification(n)),
      };

      await dataSources.Cache.set({
        key: cacheKey,
        data: result,
        expiresIn: 60,
      });
      return result;
    },
  },
};

export class dataSource extends OneSignalOriginal.dataSource {
  async getHistory() {
    return this.get(`notifications`, {
      app_id: ONE_SIGNAL.APP_ID,
    });
  }
}

function formatNotification(n) {
  return {
    id: n.id,
    headings: n.headings?.en,
    contents: n.contents?.en,
    completed_at: n.completed_at,
    url: n.url,
  };
}
