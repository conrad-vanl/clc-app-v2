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

import Location from './Location';
import Speakers from './Speakers';
import Time from './Time';
import Downloads from './Downloads';
import Spacer from './Spacer';
import ChildContentFeed from './ChildContentFeed';

import ActionContainer from './ActionContainer';

const NodeSingleInner = ({ nodeId, ImageWrapperComponent, ...props }) => (
  <View {...props}>
    <Spacer nodeId={nodeId} />
    <ContentNodeConnected
      ImageWrapperComponent={ImageWrapperComponent}
      nodeId={nodeId}
    />
    {/*
    <ScriptureNodeConnected nodeId={nodeId} />
    <NodeFeaturesConnected nodeId={nodeId} />
    <UpNextButtonConnected nodeId={nodeId} />
    */}
    
    <Time contentId={nodeId} />
    <Location contentId={nodeId} />
    <Speakers contentId={nodeId} />
    <Downloads contentId={nodeId} />
    {/*
    <ContentParentFeedConnected nodeId={nodeId} />
    <ContentChildFeedConnected nodeId={nodeId} />
    */}
    <ChildContentFeed contentId={nodeId} />

    <ActionContainer contentId={nodeId} />

    <View style={{ height: 200 }} />
  </View>
);

export default NodeSingleInner;
