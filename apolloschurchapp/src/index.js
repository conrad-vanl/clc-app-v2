/* eslint-disable react/jsx-handler-names */

import hoistNonReactStatic from 'hoist-non-react-statics';
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import SplashScreen from 'react-native-splash-screen';
import 'react-native-gesture-handler'; // required for react-navigation
import { enableScreens } from 'react-native-screens';

import {
  BackgroundView,
  withTheme,
  NavigationService,
} from '@apollosproject/ui-kit';
import Passes from '@apollosproject/ui-passes';
import { MapViewConnected as Location } from '@apollosproject/ui-mapview';
import { ProtectedRoute } from '@apollosproject/ui-auth';

import Providers from './Providers';
import ContentSingle from './content-single';
import LocalContentSingle from './local-content-single';
import NodeSingle from './node-single';
import Event from './event';
import Tabs from './tabs';
import LandingScreen from './ui/LandingScreen';
import Onboarding from './ui/Onboarding';
import Search from './ui/Search';
import Auth from './auth';
import StaffDirectory from './staff-directory';

enableScreens(); // improves performance for react-navigation

const AppStatusBar = withTheme(({ theme }) => ({
  barStyle: theme.barStyle,
  backgroundColor: theme.colors.background.paper,
}))(StatusBar);

const ProtectedRouteWithSplashScreen = (props) => {
  const handleOnRouteChange = () => SplashScreen.hide();

  return <ProtectedRoute {...props} onRouteChange={handleOnRouteChange} />;
};

// Hack to avoid needing to pass emailRequired through the navigator.navigate
const EnhancedAuth = (props) => <Auth {...props} emailRequired />;
// 😑
hoistNonReactStatic(EnhancedAuth, Auth);

const { Navigator, Screen } = createNativeStackNavigator();
const ThemedNavigator = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    // headerTintColor: theme.colors.action.secondary,
    // headerTitleStyle: {
    //   color: theme.colors.text.primary,
    // },
    // headerStyle: {
    //   backgroundColor: theme.colors.background.paper,
    //   ...Platform.select(theme.shadows.default),
    // },
    headerShown: false,
    stackPresentation: 'fullScreenModal',
  },
}))(Navigator);

const ThemedNavigationContainer = withTheme(({ theme, ...props }) => ({
  theme: {
    ...(theme.type === 'dark' ? DarkTheme : DefaultTheme),
    dark: theme.type === 'dark',
    colors: {
      ...(theme.type === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.secondary,
      background: theme.colors.background.screen,
      card: theme.colors.background.paper,
      text: theme.colors.text.primary,
    },
  },
  ...props,
}))(({ containerRef, ...otherProps }) => <NavigationContainer ref={containerRef} {...otherProps} />); 

/*
dark (boolean): Whether this is a dark theme or a light theme
colors (object): Various colors used by react navigation components:
primary (string): The primary color of the app used to tint various elements. Usually you'll want to use your brand color for this.
background (string): The color of various backgrounds, such as background color for the screens.
card (string): The background color of card-like elements, such as headers, tab bars etc.
text (string): The text color of various elements.
border (string): The color of borders, e.g. header border, tab bar border etc.
notification (string): The color of Tab Navigator badge.
*/

const App = (props) => (
  <Providers>
    <BackgroundView>
      <AppStatusBar />
      <ThemedNavigationContainer
        containerRef={NavigationService.setTopLevelNavigator}
        onReady={NavigationService.setIsReady}
      >
        <ThemedNavigator initialRouteName="ProtectedRoute" {...props}>
          <Screen
            name="ProtectedRoute"
            component={ProtectedRouteWithSplashScreen}
          />
          <Screen name="Tabs" component={Tabs} options={{ title: 'Home' }} />
          <Screen
            name="ContentSingle"
            component={ContentSingle}
            options={{ title: 'Content' }}
          />
          <Screen
            name="LocalContentSingle"
            component={LocalContentSingle}
            options={{ title: 'Content' }}
          />
          <Screen
            name="NodeSingle"
            component={NodeSingle}
            options={{ title: 'Node' }}
          />
          <Screen name="Event" component={Event} options={{ title: 'Event' }} />
          <Screen
            name="Auth"
            component={EnhancedAuth}
            options={{
              title: 'Login',
              gestureEnabled: false,
              stackPresentation: 'push',
            }}
          />
          <Screen
            name="Location"
            component={Location}
            options={{ headerShown: true }}
          />
          <Screen
            name="Passes"
            component={Passes}
            options={{ title: 'Check-In Pass' }}
          />
          <Screen
            name="StaffDirectory"
            component={StaffDirectory}
            options={{ title: 'Staff Directory' }}
          />
          <Screen
            name="Onboarding"
            component={Onboarding}
            options={{
              title: 'Onboarding',
              gestureEnabled: false,
              stackPresentation: 'push',
            }}
          />
          <Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Screen component={Search} name="Search" />
        </ThemedNavigator>
      </ThemedNavigationContainer>
    </BackgroundView>
  </Providers>
);

export default App;
