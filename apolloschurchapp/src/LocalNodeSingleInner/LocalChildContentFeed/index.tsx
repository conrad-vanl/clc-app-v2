import React from 'react';
import { get } from 'lodash';
import { useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import { PaddedView, H4 } from '@apollosproject/ui-kit';
import ScheduleItem from '../../ui/ScheduleItem';

import getChildContent, {
  GetChildContentLocalData,
  GetChildContentLocalEvent,
} from './getChildContent';

const HorizontalContentFeed = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation();
  const handleOnPressItem = (item: { sys: { id: string } }) => {
    navigation.push('LocalContentSingle', {
      itemId: item.sys.id,
    });
  };

  const renderItem = (item: GetChildContentLocalEvent) => (
    <ScheduleItem
      id={null}
      isLoading={item.isLoading}
      title={item.title}
      summary={item.description}
      startTime={null}
      endTime={null}
      key={item.sys.id}
      onPress={() => handleOnPressItem(item)}
    />
  );

  if (!contentId) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, loading, error } = useQuery<GetChildContentLocalData>(
    getChildContent,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        itemId: contentId,
      },
    }
  );

  if (error) return null;

  console.log('data', data)
  const childContent: GetChildContentLocalEvent[] = get(
    data,
    'local.entry.breakouts.items',
    []
  );

  let content = childContent;
  if (loading && !content.length && contentId.includes('Breakout')) {
    content = [{ isLoading: true }, { isLoading: true }, { isLoading: true }] as any;
  }

  return (content && content.length) ||
    (loading && contentId.includes('Breakout')) ? (
    <React.Fragment>
      <PaddedView vertical={false}>
        <H4 padded>Sessions</H4>
      </PaddedView>
      {content.map(renderItem)}
    </React.Fragment>
  ) : null;
};

export default HorizontalContentFeed;
