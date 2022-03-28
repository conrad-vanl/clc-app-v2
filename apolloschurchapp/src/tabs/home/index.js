/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApolloClient } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import {
  styled,
  BackgroundView,
  NavigationService,
  H4,
} from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';

import { ONBOARDING_VERSION } from '../../ui/Onboarding';
import { UnreadNotificationsButton } from '../unread-notifications-button';
import LocalFeaturesFeedConnected from './localFeaturesFeedConnected';

const LogoTitle = styled(({ theme }) => ({
  height: theme.sizing.baseUnit * 2,
  margin: theme.sizing.baseUnit / 2,
  alignSelf: 'center',
  resizeMode: 'contain',
}))(Image);

const Home = () => {
  const navigation = useNavigation();
  const client = useApolloClient();

  useEffect(() => {
    checkOnboardingStatusAndNavigate({
      client,
      navigation: NavigationService,
      latestOnboardingVersion: ONBOARDING_VERSION,
      navigateHome: false,
    });
  }, []);

  return (
    <RockAuthedWebBrowser>
      {(openUrl) => (
        <BackgroundView>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <LocalFeaturesFeedConnected
              openUrl={openUrl}
              navigation={navigation}
              onPressActionItem={(item) => {
                navigation.navigate('LocalContentSingle', {
                  itemId: item.sys.id,
                });
              }}
              ListHeaderComponent={
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <LogoTitle
                    source={require('./wordmark.png')}
                    style={{ width: 32, flex: 1, left: 16 }}
                  />
                  <UnreadNotificationsButton size={24} />
                  <View style={{ width: 8 }} />
                </View>
              }
            />
          </SafeAreaView>
        </BackgroundView>
      )}
    </RockAuthedWebBrowser>
  );
};

export default Home;
