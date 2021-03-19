/* eslint-disable react/jsx-handler-names */

import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import SplashScreen from 'react-native-splash-screen';
import 'react-native-gesture-handler'; // required for react-navigation
import { enableScreens } from 'react-native-screens';

import {
  BackgroundView,
  withTheme,
  NavigationService,
} from '@apollosproject/ui-kit';

import Providers from './Providers';
import ContentSingle from './content-single';
import NodeSingle from './node-single';
import Tabs from './tabs';
import LandingScreen from './ui/LandingScreen';
import Search from './ui/Search';

enableScreens(); // improves performance for react-navigation

const AppStatusBar = withTheme(({ theme }) => ({
  barStyle: theme.barStyle,
  backgroundColor: theme.colors.background.paper,
}))(StatusBar);

const { Navigator, Screen } = createNativeStackNavigator();
const ThemedNavigator = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    headerTintColor: theme.colors.action.secondary,
    headerTitleStyle: {
      color: theme.colors.text.primary,
    },
    headerStyle: {
      backgroundColor: theme.colors.background.paper,
      ...Platform.select(theme.shadows.default),
    },
    headerShown: false,
    stackPresentation: 'modal',
  },
}))(Navigator);

const App = (props) => (
  <Providers>
    <BackgroundView>
      <AppStatusBar />
      <NavigationContainer
        ref={NavigationService.setTopLevelNavigator}
        onReady={(...args) => {
          NavigationService.setIsReady(...args);
          SplashScreen.hide();
        }}
      >
        <ThemedNavigator initialRouteName="Tabs" {...props}>
          <Screen name="Tabs" component={Tabs} options={{ title: 'Home' }} />
          <Screen
            name="ContentSingle"
            component={ContentSingle}
            options={{ title: 'Content' }}
          />
          <Screen
            name="NodeSingle"
            component={NodeSingle}
            options={{ title: 'Node' }}
          />
          <Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Screen component={Search} name="Search" />
        </ThemedNavigator>
      </NavigationContainer>
    </BackgroundView>
  </Providers>
);

export default App;
