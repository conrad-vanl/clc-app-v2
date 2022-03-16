import React from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { withTheme } from '@apollosproject/ui-kit';

import Discover from './Discover';

const { Navigator, Screen } = createNativeStackNavigator();

const DiscoverNavigator = (props) => (
  <Navigator initialRouteName="Tracks" {...props}>
    <Screen component={Discover} name="Tracks" />
  </Navigator>
);
const EnhancedDiscover = withTheme(({ theme, ...props }) => ({
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
}))(DiscoverNavigator);

export default EnhancedDiscover;
