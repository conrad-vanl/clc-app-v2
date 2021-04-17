import { ActionAlgorithm as core } from '@apollosproject/data-connector-rock';
import { get } from 'lodash';
import moment from 'moment';

class ActionAlgorithm extends core.dataSource {
  ACTION_ALGORITHMS = Object.entries({
    USER_FEED: this.userFeedAlgorithm,
    TRACKS: this.tracksAlgorithm,
    REGISTRATIONS: this.registrationsAlgorithm,
    UPNEXT: this.upNextAlgorithm,
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

  async upNextAlgorithm() {
    const { Person, UserLike, Event, ContentItem, Conference } = this.context.dataSources;
    const currentTime = moment();
    const { fields } = await Conference.getFromCode();

    const personId = await Person.getCurrentPersonId();
    const likes = await UserLike.model.findAll({
      where: {
        nodeType: 'Event',
        personId,
      },
    });
    const likedIds = likes?.map((like) => like.nodeId);

    // find the current day:
    let { days = [] } = fields;
    days = days.sort((a, b) => moment(a.fields.date) - moment(b.fields.date));

    let upNext = null;
    let startTimeToBeBefore = null;
    days.find(({ fields: { scheduleItem = [] } = {} }) =>
      scheduleItem.find((item) => {
        // look for an event that's less then halfway over or after currentTime
        const startTime = moment(item.fields.startTime);
        const endTime = moment(item.fields.endTime);
        if (startTime > currentTime) {
          if (upNext && moment(upNext.startTime) < startTime) return true;
          if (!startTimeToBeBefore || startTime < startTimeToBeBefore)
            upNext = item;
        }

        const halfwayOverTime = startTime + (endTime - startTime) / 2;
        if (halfwayOverTime > currentTime) {
          upNext = item;
          startTimeToBeBefore = halfwayOverTime;
        }

        if (upNext && likedIds.includes(upNext.sys.id)) {
          return true;
        }

        return false;
      })
    );

    if (likedIds) {
      const childNodes = upNext.fields.breakouts || [];
      if (childNodes.length) {
        childNodes.find((node) => {
          if (likedIds.includes(node.sys.id)) {
            upNext = node;
            return true;
          }
          return false;
        });
      }
    }

    const startTime = await Event.getStartTime(upNext);
    let subtitle = null;
    if (startTime) {
      subtitle = moment(startTime).format('ddd h:mma');
    }

    return [{
      id: `${upNext.id}0`,
      title: upNext.fields.title,
      subtitle,
      relatedNode: { ...upNext, __type: 'Event' },
      image: ContentItem.getCoverImage(upNext),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(upNext),
    }];
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

    let items = await Event.getFromIds(registrations.map(item => item.nodeId)).get();
    items = await Promise.all(items.map(async (item) => ({
      ...item,
      startTime: await Event.getStartTime(item),
    })));
    items = items.sort((a, b) => moment(a.startTime) - moment(b.startTime));

    return items.map(async (item, i) => {
      let subtitle = null;
      if (item.startTime) {
        subtitle = moment(item.startTime).format('ddd h:mma');
      }
      return {
        id: `${item.id}${i}`,
        title: item.fields.title,
        subtitle,
        relatedNode: { ...item, __type: 'Event' },
        image: ContentItem.getCoverImage(item),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(item),
      };
    });
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
