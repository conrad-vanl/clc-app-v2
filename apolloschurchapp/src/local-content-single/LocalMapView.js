import React from 'react';
import PropTypes from 'prop-types';
import { FlexedView, styled, H4, ConnectedImage } from '@apollosproject/ui-kit';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { get } from 'lodash';
import { gql, useQuery } from '@apollo/client';
import { rewriteContentfulUrl } from '../util';

const styles = StyleSheet.create({
  contentContainerStyle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const SizedImage = styled({
  resizeMode: 'contain',
  width: '100%',
  height: '100%',
  aspectRatio: 1,
  backgroundColor: 'white',
})(ConnectedImage);

const ImageZoomView = styled({
  width: '100%',
  flex: 1,
})(ScrollView);

const query = gql`
  query getMapViewLocal($itemId: ID!) {
    local @client {
      location(id: $itemId) {
        title
        map {
          url
        }
      }
    }
  }
`;

const LocalMapView = ({ nodeId }) => {
  const { loading, data } = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    variables: { itemId: nodeId },
  });
  const location = data?.local?.location;

  return (
    <>
      <ImageZoomView
        horizontal
        directionalLockEnabled={false}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={3}
        contentContainerStyle={styles.contentContainerStyle}
        bouncesZoom
      >
        <SizedImage
          source={location?.map?.url && rewriteContentfulUrl(location.map.url)}
        />
      </ImageZoomView>
    </>
  );
};

LocalMapView.propTypes = {
  content: PropTypes.shape({
    map: PropTypes.shape({
      sources: PropTypes.arrayOf(PropTypes.shape({ uri: PropTypes.string })),
    }),
  }),
};

export default LocalMapView;
