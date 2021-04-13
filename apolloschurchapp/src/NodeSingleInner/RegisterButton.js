import React, { useCallback, useState } from 'react';
import { Button, H5, Icon } from '@apollosproject/ui-kit';

const RegisterButton = ({ isRegistered, isCapacityEvent, capacityRemaining, ...buttonProps }) => {
  const icon = isRegistered ? 'check' : 'circle-outline-plus';

  let buttonText = 'Add to my schedule';
  if (isCapacityEvent) buttonText = 'Register to attend';
  if (isRegistered) buttonText = 'Registered';

  return (
    <Button {...buttonProps}>
      <Icon name={icon} size={18} />
      <H5>{'  '}{buttonText}</H5>
    </Button>
  );
};

export default RegisterButton;
