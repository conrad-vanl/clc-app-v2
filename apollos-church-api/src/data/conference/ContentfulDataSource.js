import { RESTDataSource } from 'apollo-datasource-rest';
import resolveResponse from 'contentful-resolve-response';

class ContentfulDataSource extends RESTDataSource {
  baseURL = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE}`;

  willSendRequest = (request) => {
    request.params.set('access_token', process.env.CONTENTFUL_REST_KEY);
    request.params.set('include', 9); // TODO: Set dynamically based on query
  };

  parseBody = async (request) => {
    const json = await request.json();
    return resolveResponse(json, {
      removeUnresolved: true,
      itemEntryPoints: ['fields'],
    });
  };

  getFromId = async (id) => {
    const result = await this.get(`entries`, {
      'sys.id': id,
    });
    if (result.length === 0)
      throw new Error(`Entry with contentful ID ${id} could not be found.`);
    return result[0];
  };

  getFromIds = (ids) => {
    const get = async () => {
      const items = await Promise.all(ids.map(async (id) => {
        let item = null;
        try {
          item = await this.getFromId(id);
        } catch(e) {}
        return item;
      }));
      return items.filter((item) => !!item);
    };
    return {
      get,
    };
  }
}

export default ContentfulDataSource;
