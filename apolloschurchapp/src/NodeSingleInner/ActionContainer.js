import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Platform, View } from 'react-native';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { styled, ChannelLabel, H6, Button } from '@apollosproject/ui-kit';

import RegisterButton from './RegisterButton';

const QUERY = gql`
  query getRegistrationStatus($nodeId: ID!) {
    node(id: $nodeId) {
      ... on Event {
        id
        registered
        capacity
        isRegistered
      }
    }
  }
`;

const REGISTER = gql`
  mutation register($nodeId: ID!) {
    register(nodeId: $nodeId) {
      id
      isRegistered
      registered
    }
  }
`;

const UNREGISTER = gql`
  mutation unregister($nodeId: ID!) {
    unregister(nodeId: $nodeId) {
      id
      isRegistered
      registered
    }
  }
`;

const ModalBackgroundView = styled(({ theme }) => ({
  borderTopLeftRadius: theme.sizing.baseUnit,
  borderTopRightRadius: theme.sizing.baseUnit,
  backgroundColor: theme.colors.background.paper,
  ...Platform.select({ ios: theme.shadows.default.ios }),
}))(View);

const CapacityRow = styled(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
}))(View);

const Container = styled(({ theme }) => ({
  paddingHorizontal: theme.sizing.baseUnit,
  flex: 1,
}))(SafeAreaView);

const ActionContianer = ({ contentId }) => {
  const safeArea = useSafeAreaInsets();
  const bottomSheetModalRef = useRef();

  const { data } = useQuery(QUERY, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 3000,
    variables: { nodeId: contentId },
  });
  const [register, { loading: loadingRegister }] = useMutation(REGISTER);
  const [unregister, { loading: loadingUnregister }] = useMutation(UNREGISTER);

  const isCapacityEvent = data?.node?.capacity && data?.node?.capacity > 0;
  const capacityRemaining = data?.node?.capacity - data?.node?.registered;

  const handleButtonPress = useCallback(
    () => {
      const variables = {
        nodeId: contentId,
      };
      return data?.node?.isRegistered
        ? unregister({ variables })
        : register({ variables });
    },
    [data?.node?.isRegistered, register, unregister]
  );

  // present on mount
  useEffect(
    () => {
      if (data?.node?.id) bottomSheetModalRef.current?.present();
    },
    [data?.node?.id, bottomSheetModalRef]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={[90 + safeArea.bottom]}
      animateOnMount
      dismissOnPanDown={false}
      backgroundComponent={(bgProps) => <ModalBackgroundView {...bgProps} />} // eslint-disable-line react/jsx-props-no-spreading
    >
      <Container edges={['bottom', 'left', 'right']}>
        {isCapacityEvent ? (
          <CapacityRow>
            <ChannelLabel
              icon="groups"
              label={
                isCapacityEvent ? `${data?.node?.capacity} person capacity` : ``
              }
            />
            {isCapacityEvent && capacityRemaining >= 0 ? (
              <H6>
                {capacityRemaining} {capacityRemaining === 1 ? 'spot' : 'spots'}{' '}
                left
              </H6>
            ) : null}
          </CapacityRow>
        ) : null}
        <RegisterButton
          isRegistered={!!data?.node?.isRegistered}
          isCapacityEvent={!!isCapacityEvent}
          capacityRemaining={capacityRemaining}
          loading={loadingRegister || loadingUnregister}
          onPress={handleButtonPress}
        />
      </Container>
    </BottomSheetModal>
  );
};

export default ActionContianer;
