import * as OneSignalOriginal from '@apollosproject/data-connector-onesignal';
import gql from 'graphql-tag';
import ApollosConfig from '@apollosproject/config';
import { present, tryParseDate } from '../util';

const { ONE_SIGNAL } = ApollosConfig;

export const schema = gql`
  ${OneSignalOriginal.schema}

  type Notification {
    id: ID!
    headings: String
    contents: String
    completed_at: String!
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
      const cacheKey = `oneSignalHistory`;
      const cached = await dataSources.Cache.get({ key: cacheKey });
      if (cached !== undefined && cached !== null) {
        return cached;
      }

      const data = await dataSources.OneSignal.getHistory();
      const result = {
        total: data.notifications.length,
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

const HIDE_NOTIFICATIONS_BEFORE =
  present(process.env.HIDE_NOTIFICATIONS_BEFORE) &&
  tryParseDate(process.env.HIDE_NOTIFICATIONS_BEFORE);

export class dataSource extends OneSignalOriginal.dataSource {
  async getHistory() {
    const data = await this.get(`notifications`, {
      app_id: ONE_SIGNAL.APP_ID,
    });

    if (HIDE_NOTIFICATIONS_BEFORE) {
      data.notifications = data.notifications.filter(
        (n) => (n.send_after || 0) * 1000 > HIDE_NOTIFICATIONS_BEFORE
      );
    }
    return data;
  }
}

function formatNotification(n) {
  return {
    id: n.id,
    headings: n.headings?.en,
    contents: n.contents?.en,
    completed_at: n.completed_at
      ? new Date(n.completed_at * 1000).toISOString()
      : '',
    url: n.url,
  };
}
