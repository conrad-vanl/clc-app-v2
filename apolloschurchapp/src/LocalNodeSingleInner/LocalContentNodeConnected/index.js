import React from 'react';
import marked from 'marked';
import { View } from 'react-native';
import gql from 'graphql-tag';
import { Query } from '@apollo/client/react/components';
import HTMLView from '@apollosproject/ui-htmlview';
import {
  ErrorCard,
  PaddedView,
  H2,
  GradientOverlayImage,
  named,
} from '@apollosproject/ui-kit';
import { safeHandleUrl } from '@apollosproject/ui-connected'
import { present } from '../../util';

// import safeOpenUrl from '../safeOpenUrl';

const GET_CONTENT_ITEM_CONTENT = gql`
  query getLocalContentNode($nodeId: ID!) {
    local @client {
      entry(id: $nodeId) {
        sys { id }
        title
        ... on Local_Event {
          description
          art { url }
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
  if (!nodeId) return <HTMLView isLoading />;

  return (
    <Query
      query={GET_CONTENT_ITEM_CONTENT}
      variables={{ nodeId }}
      fetchPolicy={'cache-and-network'}
    >
      {({ data: { local: { entry } = {} } = {}, loading, error }) => {
        if (!entry && error) return <ErrorCard error={error} />;
        const coverImageSources = [entry?.art?.url].filter(present);
        const { title, description } = entry || {};
        const htmlContent = present(description) && marked(description);

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
      }}
    </Query>
  );
};

LocalContentNodeConnected.defaultProps = {
  HtmlComponent: HTMLView,
  ImageWrapperComponent: View,
  onPressAnchor: safeHandleUrl,
};

export default named('ui-connected.LocalContentNodeConnected')(LocalContentNodeConnected);
