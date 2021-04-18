import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HorizontalLikedContentFeedConnected } from '@apollosproject/ui-connected';
import { BackgroundView } from '@apollosproject/ui-kit';

import ActionTable from './ActionTable';
import ActionBar from './ActionBar';

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