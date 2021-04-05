import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { ConnectScreenConnected } from '@apollosproject/ui-connected';

import Maps from './Maps';
import Resources from './Resources';

class Connect extends PureComponent {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
  };

  render() {
    return (
      <ConnectScreenConnected ActionTable={Resources} ActionBar={Maps} />
    );
  }
}

export default Connect;
