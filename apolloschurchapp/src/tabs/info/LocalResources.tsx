import React from 'react';
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
import { present } from 'contentful-local-schema/dist/util';
import { navigateInApp } from '../../util/navigation';

const getResources = gql`
  query getLocalResources {
    local @client {
      conference(id: "7pE6FgpSVhbx3u105MMZFz") {
        resources {
          items {
            __typename
            ... on Local_Link {
              sys { id }
              title
              url
              useInAppBrowser
            }
            ... on Local_Announcement {
              sys { id }
              title
            }
          }
        }
      }
    }
  }
`;

interface Local_Link {
  __typename: 'Local_Link'
  sys: { id: string }
  title: string
  url: string
  useInAppBrowser: boolean
}

interface Local_Announcement {
  __typename: 'Local_Announcement'
  sys: { id: string }
  title: string
}
type ResourceItem = Local_Link | Local_Announcement

interface GetLocalResourcesData {
  local: {
    conference: {
      resources: {
        items: ResourceItem[]
      }
    }
  }
}


const Resources = () => {
  const { data } = useQuery<GetLocalResourcesData>(getResources, { fetchPolicy: 'no-cache' });
  const navigation = useNavigation();

  const onPressHandler = ({ resource }: { resource: ResourceItem }) => async () => {
    if('url' in resource && present(resource?.url)) {
      if (/^http(s)?\:\/\//.test(resource.url)) {
        if (resource.useInAppBrowser && await InAppBrowser.isAvailable()) {
          InAppBrowser.open(resource.url);
        } else {
          Linking.openURL(resource.url);
        }
      } else {
        navigateInApp(resource.url, navigation)
      }
    } else if (present(resource?.sys?.id)) {
      navigation.push('LocalContentSingle', {
        itemId: resource.sys.id,
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
          {(data?.local?.conference?.resources?.items || []).map((resource) => (
            <React.Fragment key={resource.sys.id}>
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
