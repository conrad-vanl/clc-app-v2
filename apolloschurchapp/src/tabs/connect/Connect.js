import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import { BackgroundView } from '@apollosproject/ui-kit';

import Maps from './LocalMaps';
import Resources from './LocalResources';

class Connect extends PureComponent {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
  };

  render() {
    return (
      <BackgroundView>
        <ScrollView style={{ flex: 1 }}>
          <Maps />
          <Resources />
        </ScrollView>
      </BackgroundView>
    );
  }
}

export default Connect;