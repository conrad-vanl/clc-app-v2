import React, { PureComponent } from 'react';
import { gql, useQuery } from '@apollo/client';
import { get } from 'lodash';
import { Linking } from 'react-native';
import {
  PaddedView,
  H5,
  UIText,
  TableView,
  Touchable,
  Cell,
  CellText,
  Divider,
} from '@apollosproject/ui-kit';
import { useNavigation } from '@react-navigation/native';

import { Caret } from '../../ui/ScheduleItem';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const getMaps = gql`
  query {
    conference {
      resources {
        __typename
        ... on Link {
          id
          title
          url
          useInAppBrowser
        }
        ... on Announcement {
          id
          title
        }
      }
    }
  }
`;

const Resources = () => {
  const { data: { conference } = {} } = useQuery(getMaps, { fetchPolicy: 'cache-and-network' });
  const navigation = useNavigation();

  const onPressHandler = ({ resource }) => async () => {
    if (resource.__typename === 'Link') {
      if (resource.useInAppBrowser && await InAppBrowser.isAvailable()) {
        InAppBrowser.open(resource.url);
      } else {
        Linking.openURL(resource.url);
      }
    } else {
      navigation.push('ContentSingle', {
        itemId: resource.id,
      });
    }
  };

  return (
    <>
      <PaddedView />
      <PaddedView vertical={false}>
        <H5 padded>Resources</H5>
      </PaddedView>
      <TableView>
          {(get(conference, 'resources') || []).map((resource) => (
            <React.Fragment key={resource.id}>
              <Touchable
                onPress={onPressHandler({ resource })}
              >
                <Cell>
                  <CellText>
                    <UIText>{resource.title}</UIText>
                  </CellText>
                  <Caret />
                </Cell>
              </Touchable>

              <Divider />
            </React.Fragment>
          ))}
        </TableView>
    </>
  );
};

export default Resources;
