import React from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { withTheme } from '@apollosproject/ui-kit';

import tabBarIcon from '../tabBarIcon';

import Schedule from './Schedule';


const { Screen, Navigator } = createNativeStackNavigator();


export const ScheduleNavigator = (props) => (
  <Navigator {...props}>
    <Screen
      component={Schedule}
      name="Schedule"
    />
  </Navigator>
);

const EnhancedScheduleNavigator = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    headerTintColor: theme.colors.action.secondary,
    headerTitleStyle: {
      color: theme.colors.text.primary,
    },
    headerStyle: {
      backgroundColor: theme.colors.background.screen,
    },
    cardStyle: {
      backgroundColor: theme.colors.background.screen,
    },
    headerLargeTitle: true,
  },
}))(ScheduleNavigator);

export default EnhancedScheduleNavigator;
