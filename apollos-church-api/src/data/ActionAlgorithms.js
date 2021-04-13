import { ActionAlgorithm as core } from '@apollosproject/data-connector-rock';
import { get } from 'lodash';

class ActionAlgorithm extends core.dataSource {
  ACTION_ALGORITHMS = Object.entries({
    USER_FEED: this.userFeedAlgorithm,
    TRACKS: this.tracksAlgorithm,
    REGISTRATIONS: this.registrationsAlgorithm,
  }).reduce((accum, [key, value]) => {
    // convenciance code to make sure all methods are bound to the Features dataSource
    // eslint-disable-next-line
    accum[key] = value.bind(this);
    return accum;
  }, {});

  async tracksAlgorithm({ limit = 20 } = {}) {
    const { Conference, ContentItem } = this.context.dataSources;

    const conference = await Conference.getFromCode();

    const items = conference.fields.tracks;

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.fields.title,
      subtitle: null,
      relatedNode: { ...item, __type: 'ConferenceTrack' },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async registrationsAlgorithm() {
    const { Person, UserLike, Event, ContentItem } = this.context.dataSources;
    const personId = await Person.getCurrentPersonId();
    const registrations = await UserLike.model.findAll({
      where: {
        nodeType: "Event",
        personId,
      },
    });

    const items = await Event.getFromIds(registrations.map(item => item.nodeId)).get();

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.fields.title,
      subtitle: null,
      relatedNode: { ...item, __type: 'Event' },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async userFeedAlgorithm({ limit = 20 } = {}) {
    const { Conference, ContentItem } = this.context.dataSources;

    const conference = await Conference.getFromCode();

    const items = conference.fields.announcements;

    return items.map((item, i) => ({
      id: `${item.id}${i}`,
      title: item.fields.title,
      subtitle: null,
      relatedNode: { ...item, __type: 'Announcement' },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }
}

export { ActionAlgorithm as dataSource };
