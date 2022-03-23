import React from 'react';
import PropTypes from 'prop-types';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ModalCloseButton, ModalBackButton, withTheme } from '@apollosproject/ui-kit';

import { StaffDirectory } from './StaffDirectory';

const { Screen, Navigator } = createNativeStackNavigator();

const StaffDirectoryNavigator = ({ route, navigation, ...props }) => (
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
        headerTitle: 'Staff Directory',
        headerTopInsetEnabled: false,
      }}
    >
      <Screen
        name="StaffDirectory"
        component={StaffDirectory}
        options={{ title: 'Staff Directory' }}
        initialParams={route.params}
      />
    </Navigator>
  </BottomSheetModalProvider>
);

StaffDirectoryNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default StaffDirectoryNavigator;