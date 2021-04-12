import React, { PureComponent } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import { ThemeMixin } from '@apollosproject/ui-kit';

import { NodeSingleConnected } from '@apollosproject/ui-connected';

import NavigationHeader from '../ui/NavigationHeader';
import NodeSingleInner from '../NodeSingleInner';

class NodeSingle extends PureComponent {
  static propTypes = {
    route: PropTypes.shape({
      params: PropTypes.shape({ nodeId: PropTypes.string }),
    }),
    navigation: PropTypes.shape({
      push: PropTypes.func,
    }),
  };

  get nodeId() {
    return this.props.route?.params?.nodeId;
  }

  static navigationOptions = {
    header: NavigationHeader,
    headerTransparent: true,
    headerMode: 'float',
  };

  render() {
    return (
      <ThemeMixin
        mixin={{
          type: get(this.props, 'theme.type'),
          colors: get(this.props, 'theme.colors'),
        }}
      >
        <NodeSingleConnected nodeId={this.nodeId} Component={NodeSingleInner} />
      </ThemeMixin>
    );
  }
}

export default NodeSingle;
