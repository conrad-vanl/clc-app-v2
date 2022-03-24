import React from 'react';
import PropTypes from 'prop-types';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ModalCloseButton, ModalBackButton } from '@apollosproject/ui-kit';
import LocalContentSingle from './LocalContentSingle';

const { Screen, Navigator } = createNativeStackNavigator();

const LocalContentSingleNavigator = ({ route, navigation, ...props }) => (
  <BottomSheetModalProvider>
    <Navigator
      {...props}
      headerMode="float"
      screenOptions={{
        headerTranslucent: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerHideShadow: true,
        headerRight: ModalCloseButton,
        headerLeft: ModalBackButton,
        headerTitle: '',
        headerTopInsetEnabled: false,
      }}
    >
      <Screen
        name="LocalContentSingle"
        component={LocalContentSingle}
        initialParams={route.params}
      />
    </Navigator>
  </BottomSheetModalProvider>
);

LocalContentSingleNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default LocalContentSingleNavigator;
