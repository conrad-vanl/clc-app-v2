import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { withTheme } from '@apollosproject/ui-kit';

import Feed from './Feed';

const { Navigator, Screen } = createNativeStackNavigator();

const FeedNavigator = (props) => (
  <Navigator initialRouteName="Feed" {...props}>
    <Screen
      component={Feed}
      name="My CLC"
    />
  </Navigator>
);
const EnhancedFeed = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    // headerTintColor: theme.colors.action.secondary,
    // headerTitleStyle: {
    //   color: theme.colors.text.primary,
    // },
    // headerStyle: {
    //   backgroundColor: theme.colors.background.screen,
    //   ...Platform.select(theme.shadows.default),
    // },
    headerLargeTitle: true,
  },
}))(FeedNavigator);

export default EnhancedFeed;
