import React from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { withTheme } from '@apollosproject/ui-kit';
import PropTypes from 'prop-types';
import hoistNonReactStatic from 'hoist-non-react-statics';

import {
  AuthSMSPhoneEntryConnected,
  AuthSMSVerification,
  AuthSMSVerificationConnected,
  AuthEmailEntryConnected,
  AuthPasswordEntry,
  AuthPasswordEntryConnected,
  AuthProfileEntry,
  AuthProfileDetailsEntry,
} from '@apollosproject/ui-auth';

import AuthProfileEntryConnected from './AuthProfileEntryConnected';

const AuthStack = createNativeStackNavigator();
const IdentityStack = createNativeStackNavigator();


const textOverrides = {
  authTitleText: 'Let\'s get started',
  promptText:
    'Sign in to customize your schedule, register for special events, access conference resources, and more.',
};

const ThemedAuthSMSPhoneEntryConnected = withTheme((props) => ({ ...textOverrides, ...props }))(AuthSMSPhoneEntryConnected);
const ThemedAuthEmailEntryConnected = withTheme((props) => ({ ...textOverrides, ...props }))(AuthEmailEntryConnected);

const AuthNavigator = (props) => (
  <AuthStack.Navigator
    initialRouteName="AuthIdentity"
    headerMode="none"
    {...props}
  >
    <AuthStack.Screen name="Identity">
      {() => (
        <IdentityStack.Navigator
          screenOptions={{ stackAnimation: 'none', headerShown: false }}
        >
          <IdentityStack.Screen
            name="AuthSMSPhoneEntryConnected"
            component={ThemedAuthSMSPhoneEntryConnected}
          />
          <IdentityStack.Screen
            name="AuthEmailEntryConnected"
            component={ThemedAuthEmailEntryConnected}
          />
        </IdentityStack.Navigator>
      )}
    </AuthStack.Screen>
    <AuthStack.Screen
      name="AuthSMSVerificationConnected"
      options={{ headerShown: true }}
      component={AuthSMSVerificationConnected}
    />
    <AuthStack.Screen
      name="AuthPasswordEntryConnected"
      options={{ headerShown: true }}
      component={AuthPasswordEntryConnected}
    />
    <AuthStack.Screen
      name="AuthProfileEntryConnected"
      component={AuthProfileEntryConnected}
    />

    {/* Redirects */}
    <AuthStack.Screen name="AuthSMSPhoneEntryConnected">
      {({ navigation }) =>
        navigation.replace('Identity', {
          screen: 'AuthSMSPhoneEntryConnected',
        }) || null
      }
    </AuthStack.Screen>
    <AuthStack.Screen name="AuthEmailEntryConnected">
      {({ navigation }) =>
        navigation.replace('Identity', {
          screen: 'AuthEmailEntryConnected',
        }) || null
      }
    </AuthStack.Screen>
  </AuthStack.Navigator>
);

const ThemedAuthNavigator = withTheme(({ theme, ...props }) => ({
  ...props,
  screenOptions: {
    headerTintColor: theme.colors.action.secondary,
    headerTitleStyle: {
      color: theme.colors.text.primary,
    },
    headerStyle: {
      backgroundColor: theme.colors.background.paper,
    },
    headerHideShadow: true,
    headerTitle: '',
    headerBackTitle: 'Back',
    headerShown: false,
  },
}))(AuthNavigator);

ThemedAuthNavigator.propTypes = {
  screenProps: PropTypes.shape({
    alternateLoginText: PropTypes.node,
    authTitleText: PropTypes.string,
    confirmationTitleText: PropTypes.string,
    confirmationPromptText: PropTypes.string,
    onFinishAuth: PropTypes.func,
    passwordPromptText: PropTypes.string,
    smsPolicyInfo: PropTypes.node,
    smsPromptText: PropTypes.string,
    emailRequired: PropTypes.bool,
    handleForgotPassword: PropTypes.func,
  }),
  BackgroundComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const Auth = (props) => <ThemedAuthNavigator {...props} />;
hoistNonReactStatic(Auth, AuthNavigator);

export default Auth;