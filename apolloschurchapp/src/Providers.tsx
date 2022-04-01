import React from 'react';
import ApollosConfig from '@apollosproject/config';
import { Providers, NavigationService } from '@apollosproject/ui-kit';
import { AuthProvider } from '@apollosproject/ui-auth';
import { AnalyticsProvider } from '@apollosproject/ui-analytics';
import { LiveProvider } from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import RNAmplitude from 'react-native-amplitude-analytics';
import { NotificationsProvider } from './Providers/notificationsProvider';
import NotificationListener from './Providers/notificationListener';

import ClientProvider, { client } from './client';
import customTheme, { customIcons } from './theme';
import { present } from './util';

const amplitude =
  present(ApollosConfig.AMPLITUDE_API_KEY) &&
  new RNAmplitude(ApollosConfig.AMPLITUDE_API_KEY);

const AppProviders: React.FunctionComponent<any> = (props) => {
  const { children, ...remaining } = props;

  return (
    <ClientProvider {...remaining}>
      <NotificationsProvider
        oneSignalKey={ApollosConfig.ONE_SIGNAL_KEY}
        navigate={NavigationService.navigate}
      >
        <AuthProvider
          navigateToAuth={() => NavigationService.navigate('Auth')}
          navigate={NavigationService.navigate}
          closeAuth={() =>
            checkOnboardingStatusAndNavigate({
              client,
              navigation: NavigationService,
            })
          }
        >
          <AnalyticsProvider
            // Not using server-side analytics (segment, GA, rock), using Amplitude instead
            useServerAnalytics={false}
            trackFunctions={[
              process.env.NODE_ENV === 'development' &&
                (({ eventName, properties }) => {
                  console.debug('analytics:', eventName, properties);
                }),
              amplitude &&
                (({ eventName, properties }) =>
                  amplitude.logEvent(eventName, properties)),
            ].filter(present)}
          >
            <LiveProvider>
              <Providers
                themeInput={customTheme}
                iconInput={customIcons}
                {...remaining}
              >
                <NotificationListener>{children}</NotificationListener>
              </Providers>
            </LiveProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </NotificationsProvider>
    </ClientProvider>
  );
};

export default AppProviders;
