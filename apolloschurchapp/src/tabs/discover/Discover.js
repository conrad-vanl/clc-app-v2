import React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import gql from 'graphql-tag';
import { Query } from '@apollo/client/react/components';
import { useNavigation } from '@react-navigation/native';

import { BackgroundView } from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

import LocalFeaturesFeedConnected from './localFeaturesFeedConnected';

const Discover = () => {
  const navigation = useNavigation();

  return (
    <RockAuthedWebBrowser>
      {(openUrl) => (
        <BackgroundView>
          <LocalFeaturesFeedConnected
            openUrl={openUrl}
            navigation={navigation}
            onPressActionItem={(item) => {
              navigation.navigate('LocalContentSingle', {
                itemId: item.sys.id,
              });
            }}
          />
        </BackgroundView>
      )}
    </RockAuthedWebBrowser>
  );
};

export default Discover;
