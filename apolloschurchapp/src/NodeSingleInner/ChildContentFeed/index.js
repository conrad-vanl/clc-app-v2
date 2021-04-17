import React, { Component } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import { PaddedView, H4 } from '@apollosproject/ui-kit';
import ScheduleItem from '../../ui/ScheduleItem';

import getChildContent from './getChildContent';

const HorizontalContentFeed = ({ contentId }) => {
  const navigation = useNavigation();
  const handleOnPressItem = (item) => {
    navigation.push('ContentSingle', {
      itemId: item.id,
    });
  };

  const renderItem = (item) => (
    <ScheduleItem
      {...item}
      startTime={null}
      endTime={null}
      key={item.id}
      onPress={() => handleOnPressItem(item)}
    />
  );

  if (!contentId) return null;

  const { data, loading, error } = useQuery(getChildContent, {
    fetchPolicy: 'cache-and-network',
    variables: {
      itemId: contentId,
      showLabel: !contentId.includes('Breakouts'),
    },
  });

  if (error) return null;

  const childContent = get(
    data,
    'node.childContentItemsConnection.edges',
    []
  ).map((edge) => edge.node);

  let content = childContent;
  if (loading && !content.length && contentId.includes('Breakout')) {
    content = [
      { isLoading: true },
      { isLoading: true },
      { isLoading: true },
    ];
  }

  return (content && content.length) || (loading && contentId.includes('Breakout')) ? (
    <React.Fragment>
      <PaddedView vertical={false}>
        <H4 padded>
          Sessions
        </H4>
      </PaddedView>
      {content.map(renderItem)}
    </React.Fragment>
  ) : null;
};


export default HorizontalContentFeed;
