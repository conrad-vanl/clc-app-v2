import React from 'react';
import marked from 'marked';
import { View } from 'react-native';
import gql from 'graphql-tag';
import HTMLView from '@apollosproject/ui-htmlview';
import {
  ErrorCard,
  PaddedView,
  H2,
  GradientOverlayImage,
  named,
} from '@apollosproject/ui-kit';
import { safeHandleUrl } from '@apollosproject/ui-connected';
import { present } from '../../util';
import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';

// import safeOpenUrl from '../safeOpenUrl';

const GET_CONTENT_ITEM_CONTENT = gql`
  query getLocalContentNode($nodeId: ID!) {
    local @client {
      entry(id: $nodeId) {
        __typename
        sys {
          id
        }
        ... on Local_Event {
          title
          description
          art {
            url
          }
        }
        ... on Local_Announcement {
          title
          description
          art {
            url
          }
        }
        ... on Local_Speaker {
          title: name
          art: photo {
            url
          }
          description: biography
        }
        ... on Local_Location {
          title
        }
      }
    }
  }
`;

const LocalContentNodeConnected = ({
  HtmlComponent,
  nodeId,
  onPressAnchor,
  ImageWrapperComponent,
}) => {
  const { data, loading, error } = useQueryAutoRefresh(
    GET_CONTENT_ITEM_CONTENT,
    {
      fetchPolicy: 'no-cache',
      variables: { nodeId: nodeId || '' },
    }
  );
  const { local: { entry } = {} } = data || {};

  if (!nodeId) return <HTMLView isLoading />;
  if (!entry && error) return <ErrorCard error={error} />;

  const coverImageSources = [entry?.art?.url].filter(present);
  const { title, description } = entry || {};
  const htmlContent = (present(description) && marked(description)) || '';

  return (
    <>
      {coverImageSources.length || loading ? (
        <ImageWrapperComponent>
          <GradientOverlayImage
            isLoading={!coverImageSources.length && loading}
            source={coverImageSources}
          />
        </ImageWrapperComponent>
      ) : null}

      {/* fixes text/navigation spacing by adding vertical padding if we dont have an image */}
      <PaddedView vertical={!coverImageSources.length}>
        <H2 padded isLoading={!title && loading}>
          {title}
        </H2>
        <HtmlComponent
          isLoading={!htmlContent && loading}
          onPressAnchor={onPressAnchor}
        >
          {htmlContent}
        </HtmlComponent>
      </PaddedView>
    </>
  );
};

LocalContentNodeConnected.defaultProps = {
  HtmlComponent: HTMLView,
  ImageWrapperComponent: View,
  onPressAnchor: safeHandleUrl,
};

export default named('ui-connected.LocalContentNodeConnected')(
  LocalContentNodeConnected
);
