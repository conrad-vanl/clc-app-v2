import React from 'react';
import PropTypes from 'prop-types';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ModalCloseButton, ModalBackButton } from '@apollosproject/ui-kit';

import { ConsequenceGenerator } from './ConsequenceGenerator';

const { Screen, Navigator } = createNativeStackNavigator();

const ConsequenceGeneratorNavigator = ({ route, navigation, ...props }) => (
  <BottomSheetModalProvider>
    <Navigator
      {...props}
      headerMode="float"
      screenOptions={{
        headerTranslucent: false,
        headerStyle: { opacity: 0 },
        headerHideShadow: true,
        headerRight: ModalCloseButton,
        headerLeft: ModalBackButton,
        headerTopInsetEnabled: false,
      }}
    >
      <Screen
        name="ConsequenceGenerator"
        component={ConsequenceGenerator}
        options={{ title: 'Farkle Wheel of Consequences' }}
        initialParams={route.params}
      />
    </Navigator>
  </BottomSheetModalProvider>
);

ConsequenceGeneratorNavigator.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({}),
  }),
};

export default ConsequenceGeneratorNavigator;
