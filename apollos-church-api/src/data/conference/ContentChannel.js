import ContentfulDataSource from './ContentfulDataSource';

export { contentChannelSchema as schema } from '@apollosproject/data-schema';

export class dataModel extends ContentfulDataSource {}

export const resolver = {
  ContentChannel: {
    __resolveType: ({ sys }) => sys.type,
  },
};
