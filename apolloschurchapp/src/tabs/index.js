import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { withTheme } from '@apollosproject/ui-kit';
import { useTrack } from '@apollosproject/ui-analytics';

import Info from './info';
import Home from './home';
import Discover from './discover';
import Schedule from './schedule';
import MySchedule from './my-schedule';
import tabBarIcon from './tabBarIcon';

const { Navigator, Screen } = createBottomTabNavigator();

const TabNavigator = (props) => {
  const track = useTrack();

  return (
    <Navigator {...props} lazy>
      <Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: tabBarIcon('home'),
        }}
        listeners={{
          focus: () => {
            track({
              eventName: 'View Content',
              properties: {
                title: 'Home',
                id: 'home',
                type: 'tab',
              },
            });
          },
        }}
      />
      <Screen
        name="Schedule"
        component={Schedule}
        options={{ tabBarIcon: tabBarIcon('calendar') }}
        listeners={{
          focus: () => {
            track({
              eventName: 'View Content',
              properties: {
                title: 'Schedule',
                id: 'schedule',
                type: 'tab',
              },
            });
          },
        }}
      />
      <Screen
        name="My-CLC"
        component={MySchedule}
        options={{
          tabBarIcon: tabBarIcon('circle-outline-check-mark'),
          title: 'My CLC',
        }}
        listeners={{
          focus: () => {
            track({
              eventName: 'View Content',
              properties: {
                title: 'My CLC',
                id: 'my-clc',
                type: 'tab',
              },
            });
          },
        }}
      />
      <Screen
        name="Tracks"
        component={Discover}
        options={{ tabBarIcon: tabBarIcon('sections') }}
        listeners={{
          focus: () => {
            track({
              eventName: 'View Content',
              properties: {
                title: 'Tracks',
                id: 'tracks',
                type: 'tab',
              },
            });
          },
        }}
      />
      <Screen
        name="Info"
        component={Info}
        options={{ tabBarIcon: tabBarIcon('profile') }}
        listeners={{
          focus: () => {
            track({
              eventName: 'View Content',
              properties: {
                title: 'Info',
                id: 'info',
                type: 'tab',
              },
            });
          },
        }}
      />
    </Navigator>
  );
};

const ThemedTabNavigator = withTheme(({ theme }) => ({
  tabBarOptions: {
    activeTintColor: theme?.colors?.secondary,
    inactiveTintColor: theme?.colors?.text?.tertiary,
    style: {
      backgroundColor: theme?.colors?.background?.paper,
      borderTopColor: theme?.colors?.shadows.default,
      ...Platform.select(theme?.shadows.default),
    },
  },
}))(TabNavigator);

export default ThemedTabNavigator;
