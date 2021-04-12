import React from 'react';
import { View } from 'react-native';

import {
    ContentNodeConnected,
    ScriptureNodeConnected,
    NodeFeaturesConnected,
    UpNextButtonConnected,
    ContentParentFeedConnected,
    ContentChildFeedConnected,
} from '@apollosproject/ui-connected';

const NodeSingleInner = ({ nodeId, ImageWrapperComponent, ...props }) => (
  <View {...props}>
    <ContentNodeConnected
      ImageWrapperComponent={ImageWrapperComponent}
      nodeId={nodeId}
    />
    <ScriptureNodeConnected nodeId={nodeId} />
    <NodeFeaturesConnected nodeId={nodeId} />
    <UpNextButtonConnected nodeId={nodeId} />
    <ContentParentFeedConnected nodeId={nodeId} />
    <ContentChildFeedConnected nodeId={nodeId} />
  </View>
);

export default NodeSingleInner;
