import React from 'react';
import PropTypes from 'prop-types';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ModalCloseButton, ModalBackButton } from '@apollosproject/ui-kit';
import NodeSingle from './NodeSingle';

const { Screen, Navigator } = createNativeStackNavigator();

const NodeSingleNavigator = ({ route, navigation, ...props }) => (
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
      name="NodeSingle"
      component={NodeSingle}
      initialParams={route.params}
    />
  </Navigator>
  </BottomSheetModalProvider>
);

NodeSingleNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default NodeSingleNavigator;
