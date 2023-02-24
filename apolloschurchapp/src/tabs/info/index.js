import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { withTheme, Touchable, Icon } from '@apollosproject/ui-kit';
import { LikedContentFeedConnected } from '@apollosproject/ui-connected';

import UserSettings from '../../user-settings';
import PersonalDetails from '../../user-settings/PersonalDetails';
import ChangePassword from '../../user-settings/ChangePassword';
import TestingControlPanel from '../../testing-control-panel';

import Info from './Info';

const { Screen, Navigator } = createNativeStackNavigator();

const SettingsButton = () => {
  const navigation = useNavigation();
  return (
    <Touchable onPress={() => {
      navigation.navigate('UserSettings');
    }}>
      <Icon name="settings" size={24} />
    </Touchable>
  );
};

const ConnectNavigator = (props) => (
  <Navigator {...props}>
    <Screen
      component={Info}
      name="Info"
      options={{ headerRight: SettingsButton }}
    />
    <Screen
      component={TestingControlPanel}
      name="TestingControlPanel"
      options={{ headerTitle: 'Testing' }}
    />
    <Screen
      component={UserSettings}
      name="UserSettings"
      options={{ headerTitle: 'Settings' }}
    />

    <Screen
      name="PersonalDetails"
      component={PersonalDetails}
      options={{ headerTitle: 'Personal Details' }}
    />
    <Screen
      name="ChangePassword"
      component={ChangePassword}
      options={{
        title: 'Change Password',
      }}
    />
    <Screen
      component={LikedContentFeedConnected}
      name="LikedContentFeedConnected"
      options={{ headerTitle: 'Your Likes' }}
    />
  </Navigator>
);

const EnhancedConnect = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    // headerTintColor: theme.colors.action.secondary,
    // headerTitleStyle: {
    //   color: theme.colors.text.primary,
    // },
    // headerStyle: {
    //   backgroundColor: theme.colors.background.paper,
    // },
    headerLargeTitle: true,
  },
}))(ConnectNavigator);

export default EnhancedConnect;
