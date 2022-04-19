import React from 'react';
import { SectionList } from 'react-native';
import { get, groupBy } from 'lodash';
import moment from 'moment';
import { useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import { PaddedView, H4, styled } from '@apollosproject/ui-kit';
import { useTrack } from '@apollosproject/ui-analytics';
import ScheduleItem from '../../ui/ScheduleItem';

import getChildContent, {
  GetChildContentLocalData,
  GetChildContentLocalEvent,
} from './getChildContent';
import marked from 'marked';
import { renderPlain } from '../../markdown';

const SectionHeader = styled(({ theme }: any) => ({
  backgroundColor: theme.colors.background.paper,
  color: theme.colors.text.secondary,
  paddingHorizontal: theme.sizing.baseUnit,
  paddingVertical: theme.sizing.baseUnit / 2,
}))(H4);

const HorizontalContentFeed = ({ contentId }: { contentId: string }) => {
  const track = useTrack();
  const navigation = useNavigation();
  const handleOnPressItem = (item: GetChildContentLocalEvent) => {

    if (track) {
      track({
        eventName: 'Click',
        properties: {
          title: item.title,
          itemId: item.sys.id,
          on: contentId
        }
      })
    }

    navigation.push('LocalContentSingle', {
      itemId: item.sys.id,
    });
  };

  if (!contentId) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, loading, error } = useQuery<GetChildContentLocalData>(
    getChildContent,
    {
      fetchPolicy: 'no-cache',
      variables: {
        itemId: contentId,
      },
    }
  );

  if (error) return null;

  const typename = data?.local?.entry?.__typename || ''
  const childContent: GetChildContentLocalEvent[] = get(
    data,
    'local.entry.events.items',
    []
  );

  let content = childContent;
  if (loading && !content.length && typename.includes('Breakout')) {
    content = [{ isLoading: true }, { isLoading: true }, { isLoading: true }] as any;
  } else {
    content = content.sort(byStartTime)    
  }
  const grouped = groupBy(content, (e) => e.startTime && moment(e.startTime).startOf('day').toISOString() || '')
  const sections = Object.keys(grouped).sort().map((key) => {
    return {
      title: key ? moment(key).format('dddd') : '',
      data: grouped[key]
    }
  })

  return (content && content.length) ||
    (loading && typename.includes('Breakout')) ? (
    <React.Fragment>
      <PaddedView vertical={false}>
        <H4 padded>Sessions</H4>
      </PaddedView>
      <SectionList
        refreshing={loading}
        sections={sections}
        renderItem={({item}) => (
          <ScheduleItem
            id={null}
            isLoading={item.isLoading}
            title={item.title}
            summary={item.description && marked(item.description, {renderer: renderPlain()} )}
            label={typename.includes('Breakout') ? undefined : item.eventType}
            startTime={item.startTime}
            endTime={item.endTime}
            key={item.sys.id}
            showTime={!typename.includes('Breakout')}
            onPress={() => handleOnPressItem(item)}
          />
        )}
        renderSectionHeader={({section}: { section: { title: string } }) => {
          return <SectionHeader>
            {section.title}
          </SectionHeader>
        }}
        />
    </React.Fragment>
  ) : null;
};

export default HorizontalContentFeed;

function byStartTime(a: { startTime?: string }, b: { startTime?: string }) {
  if (!a.startTime || !b.startTime) { return 0 }

  return Date.parse(a.startTime) - Date.parse(b.startTime)
}