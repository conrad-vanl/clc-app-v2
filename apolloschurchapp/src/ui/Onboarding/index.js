import React from 'react';
import { View, Platform } from 'react-native';
import { Query } from '@apollo/client/react/components';
import PropTypes from 'prop-types';
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import {
  styled,
  BackgroundView,
  NavigationService,
} from '@apollosproject/ui-kit';
import {
  AskNotificationsConnected,
  OnboardingSwiper,
  onboardingComplete,
  WITH_USER_ID,
} from '@apollosproject/ui-onboarding';

const FullscreenBackgroundView = styled({
  position: 'absolute',
  width: '100%',
  height: '100%',
})(BackgroundView);

const ImageContainer = styled({
  height: '40%',
})(View);

// Represents the current version of onboarding.
// Some slides will be "older", they shouldn't be shown to existing users.
// Some slides will be the same version as teh current onboarding version.
// Those slides will be shown to any user with an older version than the version of those slides.
export const ONBOARDING_VERSION = 2;

function Onboarding({ navigation, route }) {
  const userVersion = route?.params?.userVersion || 0;
  return (
    <Query query={WITH_USER_ID} fetchPolicy="network-only">
      {({ data }) => {
        if (Platform.OS === 'android') {
          // we can skip onboaridng on android since notification permissions on implied
          onboardingComplete({
            userId: data?.currentUser?.id,
            version: ONBOARDING_VERSION,
          });
          navigation.dispatch(
            NavigationService.resetAction({
              navigatorName: 'Tabs',
              routeName: 'Home',
            })
          );
        }
        return (
          <>
            <FullscreenBackgroundView />
            <OnboardingSwiper
              navigation={navigation}
              userVersion={userVersion}
              onComplete={() => {
                onboardingComplete({
                  userId: data?.currentUser?.id,
                  version: ONBOARDING_VERSION,
                });
                navigation.dispatch(
                  NavigationService.resetAction({
                    navigatorName: 'Tabs',
                    routeName: 'Home',
                  })
                );
              }}
            >
              {({ swipeForward }) => [
                <AskNotificationsConnected
                  key={'AskNotifications'}
                  BackgroundComponent={<ImageContainer />}
                  slideTitle={"Don't miss a thing"}
                  description={
                    'Stay up to date on announcements, schedule reminders, and things you won’t want to miss.'
                  }
                  onPressPrimary={swipeForward}
                  onRequestPushPermissions={(update) => {
                    checkNotifications().then((checkRes) => {
                      if (checkRes.status === RESULTS.DENIED) {
                        requestNotifications(['alert', 'badge', 'sound']).then(
                          () => {
                            update();
                          }
                        );
                      } else {
                        openSettings();
                      }
                    });
                  }}
                />,
              ]}
            </OnboardingSwiper>
          </>
        );
      }}
    </Query>
  );
}

Onboarding.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userVersion: PropTypes.number,
    }),
  }),
};

export default Onboarding;
