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
    oneSignalHistory: NotificationHistory
  }
`;

export const resolver = {
  ...OneSignalOriginal.resolver,
  Query: {
    ...OneSignalOriginal.resolver.Query,
    oneSignalHistory: async (_query, _args, { dataSources }) => {
      const data = await dataSources.OneSignal.getHistory();
      return {
        total: data.total_count,
        items: data.notifications
          .filter((n) => !n.include_player_ids) // not specifically targeted
          .map((n) => formatNotification(n)),
      };
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
