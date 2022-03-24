import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApolloClient } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import {
  styled,
  BackgroundView,
  NavigationService,
} from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';

import { ONBOARDING_VERSION } from '../../ui/Onboarding';
import LocalFeaturesFeedConnected from './localFeaturesFeedConnected';
import {UnreadNotificationsButton} from '../unread-notifications-button'

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
                <>
                  <LogoTitle source={require('./wordmark.png')} />
                  <UnreadNotificationsButton />
                </>
              }
            />
          </SafeAreaView>
        </BackgroundView>
      )}
    </RockAuthedWebBrowser>
  );
};

export default Home;
