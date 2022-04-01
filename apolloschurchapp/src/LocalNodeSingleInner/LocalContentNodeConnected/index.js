import React, { useRef, useEffect } from 'react';
import marked from 'marked';
import { Linking, Platform, View } from 'react-native';
import gql from 'graphql-tag';
import HTMLView from '@apollosproject/ui-htmlview';
import {
  ErrorCard,
  PaddedView,
  H2,
  H5,
  GradientOverlayImage,
  Button,
  named,
  styled,
} from '@apollosproject/ui-kit';
import { safeHandleUrl } from '@apollosproject/ui-connected';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import InAppBrowser from 'react-native-inappbrowser-reborn';

import { present, parseName } from '../../util';
import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';

// import safeOpenUrl from '../safeOpenUrl';

const SummaryText = styled(({ theme }) => ({
  fontSize: 18,
  fontWeight: '400',
  marginTop: -20,
  marginBottom: 10,
}))(H5);

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
          summary
          description: biography
          email
        }
        ... on Local_Location {
          title
        }
        ... on Local_Track {
          title
          description
          art {
            url
          }
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
  const { title, summary, description } = entry || {};
  const htmlContent = (present(description) && marked(description)) || '';

  const cta = getCta(entry);

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
        {present(summary) && <SummaryText>{summary}</SummaryText>}
        <HtmlComponent
          isLoading={!htmlContent && loading}
          onPressAnchor={onPressAnchor}
        >
          {htmlContent}
        </HtmlComponent>
      </PaddedView>
      {cta && <CallToAction {...cta} />}
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

function getCta(entry) {
  switch (entry?.__typename) {
    case 'Local_Speaker': {
      if (!entry.email) {
        return undefined;
      }
      const name = parseName(entry?.title);
      return {
        url: `https://my.watermark.org/WatermarkForms/848?Email=${entry.email}&StaffFirstName=${name.first}&StaffLastName=${name.last}`,
        text: 'Schedule a Conversation',
      };
    }
    default:
      return undefined;
  }
}

const ModalBackgroundView = styled(({ theme }) => ({
  borderTopLeftRadius: theme.sizing.baseUnit,
  borderTopRightRadius: theme.sizing.baseUnit,
  backgroundColor: theme.colors.background.paper,
  ...Platform.select({ ios: theme.shadows.default.ios }),
}))(View);

const Container = styled(({ theme }) => ({
  paddingHorizontal: theme.sizing.baseUnit,
  flex: 1,
}))(SafeAreaView);

function CallToAction({ url, text }) {
  const safeArea = useSafeAreaInsets();
  const bottomSheetModalRef = useRef();
  useEffect(
    () => {
      bottomSheetModalRef.current?.present();
    },
    [bottomSheetModalRef]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={[90 + safeArea.bottom]}
      animateOnMount
      dismissOnPanDown={false}
      backgroundComponent={(bgProps) => <ModalBackgroundView {...bgProps} />} // eslint-disable-line react/jsx-props-no-spreading
    >
      <Container edges={['bottom', 'left', 'right']}>
        <Button onPress={onPressCta}>
          <H5>{text}</H5>
        </Button>
      </Container>
    </BottomSheetModal>
  );

  async function onPressCta() {
    if (await InAppBrowser.isAvailable()) {
      InAppBrowser.open(url);
    } else {
      Linking.openURL(url);
    }
  }
}
