import { camelCase, upperFirst } from 'lodash';
import natural from 'natural';
import sanitizeHtmlNode from 'sanitize-html';
import marked from 'marked';
import withCloudinary from '@apollosproject/data-connector-cloudinary/lib/cloudinary';
import { contentItemSchema as schema } from '@apollosproject/data-schema';
import ContentfulDataSource from './ContentfulDataSource';

export class dataSource extends ContentfulDataSource {
  getByType = (type) =>
    this.get(`entries`, {
      content_type: type,
    });

  getActiveLiveStreamContent = () => [];

  createSummary = ({ fields: { description: content, summary } }) => {
    if (summary) return summary;
    if (!content || typeof content !== 'string') return '';
    // Protect against 0 length sentences (tokenizer will throw an error)
    if (content.split(' ').length === 1) return '';

    const raw = sanitizeHtmlNode(marked(content), {
      allowedTags: [],
      allowedAttributes: [],
    });

    const tokenizer = new natural.SentenceTokenizer();
    const firstSentence = tokenizer.tokenize(raw)[0];
    return firstSentence;
  };

  createHyphenatedString = ({ text }) => {
    const hypher = new Hypher(english);
    const words = text.split(' ');
    const hyphenateEndOfWord = (word, segment) =>
      word.length > 7 ? `${word}\u00AD${segment}` : word + segment;

    const hyphenateLongWords = (word, hyphenateFunction) =>
      word.length > 7 ? hyphenateFunction(word) : word;

    return words
      .map((w) =>
        hyphenateLongWords(w, () =>
          hypher.hyphenate(w).reduce(hyphenateEndOfWord)
        )
      )
      .join(' ');
  };

  getCoverImage = ({ fields }) => fields.art;

  byUserFeed = async (a, b, { dataSources }) =>
    // const conference = await dataSources.Conference.get();
    // console.log({ conference });
    null;
}

export { schema };

export const resolver = {
  ContentItem: {
    __resolveType: ({ sys }) => {
      const contentfulType = sys.contentType.sys.id;
      return upperFirst(camelCase(contentfulType));
    },
  },
  ImageMedia: {
    name: ({ fields }) => fields.name,
    key: ({ fields }) => fields.name,
    sources: ({ fields }) => {
      const { file } = fields;
      if (!file.url) return [];
      return [
        {
          uri: file.url,
        },
      ];
    },
  },
  ContentItemsConnection: {
    edges: (items) =>
      items.map((node) => ({
        node,
        cursor: null,
      })),
  },
};
