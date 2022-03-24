import React from 'react';
import PropTypes from 'prop-types';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ModalCloseButton, ModalBackButton } from '@apollosproject/ui-kit';
import { NotificationHistory } from './NotificationHistory';

const { Screen, Navigator } = createNativeStackNavigator();

const NotificationHistoryNavigator = ({ route, navigation, ...props }) => (
  <BottomSheetModalProvider>
    <Navigator
      {...props}
      headerMode="float"
      screenOptions={{
        headerTranslucent: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerHideShadow: true,
        headerRight: ModalCloseButton,
        headerLeft: ModalBackButton,
        headerTitle: 'Notifications',
        headerTopInsetEnabled: true,
      }}
    >
      <Screen
        name="NotificationHistory"
        component={NotificationHistory}
        initialParams={route.params}
      />
    </Navigator>
  </BottomSheetModalProvider>
);

NotificationHistoryNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default NotificationHistoryNavigator;
