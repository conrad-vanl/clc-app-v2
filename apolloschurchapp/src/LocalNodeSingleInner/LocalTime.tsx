import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { Text, View } from 'react-native';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import moment from 'moment';
import { get } from 'lodash';

import { Icon, Cell, CellText, Divider, styled } from '@apollosproject/ui-kit';

const OpaqueIcon = styled({ opacity: 0.8 })(Icon);

const LightText = styled({ opacity: 0.5 })(Text);

const query = gql`
  query getTimeLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        ... on Local_Event {
          startTime
          endTime
        }
        ... on Local_Breakouts {
          startTime
          endTime
        }
      }
    }
  }
`;

interface Props {
  contentId: string
  condensed?: boolean
}

const LocalTime = ({ contentId, condensed }: Props) => {
  const { loading, data } = useQuery(query, {
    fetchPolicy: 'no-cache',
    variables: { itemId: contentId },
  });

  if (!get(data, 'local.entry.startTime') && get(data, 'local.entry') !== null) return null;

  return (
    <>
      <Cell>
        {!get(data, 'local.entry.startTime') && loading ? (
          <View />
        ) : (
          <OpaqueIcon name="time" size={14} />
        )}
        <CellText isLoading={!get(data, 'local.entry.startTime') && loading}>
          {formatInTimeZone(
            get(data, 'local.entry.startTime'),
              '-0500',
              condensed ? 'eeee h:mmaaa' : 'eeee h:mmaaa'
          )}
          {' - '}
          {formatInTimeZone(
              get(data, 'local.entry.endTime'),
              '-0500',
              'h:mmaaa')}{' '}
          {!condensed ? (
            <LightText>
              {moment(get(data, 'local.entry.startTime')).fromNow()}
            </LightText>
          ) : null}
        </CellText>
      </Cell>
      <Divider />
    </>
  );
};

export default LocalTime;
