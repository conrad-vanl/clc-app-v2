/* eslint-disable react/jsx-handler-names */
import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

import { LoginConsumer } from '@apollosproject/ui-auth/src/LoginProvider';
import ProfileEntry from '@apollosproject/ui-auth/src/Profile/ProfileEntry';

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
});

const ProfileEntryConnected = ({
  screenProps,
  navigation,
  profileSchema,
  Component,
}) => (
  <LoginConsumer>
    {({ handleProfileComplete }) => (
      <Formik
        onSubmit={async ({ firstName, lastName }, { setSubmitting }) => {
          setSubmitting(true);
          await handleProfileComplete({
            userProfile: { FirstName: firstName, LastName: lastName },
          });
          setSubmitting(false);
        }}
        validationSchema={profileSchema}
      >
        {(formikBag) => (
          <Component
            {...screenProps}
            {...formikBag}
            disabled={!formikBag.isValid}
            errors={formikBag.errors}
            isLoading={formikBag.isSubmitting}
            onPressNext={formikBag.handleSubmit}
            onPressBack={navigation.goBack}
          />
        )}
      </Formik>
    )}
  </LoginConsumer>
);

ProfileEntryConnected.propTypes = {
  navigation: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
  emailRequired: PropTypes.bool,
  screenProps: PropTypes.shape({}),
  profileSchema: PropTypes.shape({}),
  Component: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.object, // type check for React fragments
  ]),
};

ProfileEntryConnected.defaultProps = {
  emailRequired: true,
  profileSchema: ProfileSchema,
  Component: ProfileEntry,
};

export default ProfileEntryConnected;