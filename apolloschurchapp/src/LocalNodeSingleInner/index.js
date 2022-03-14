import React from 'react';
import { View } from 'react-native';

import Spacer from './Spacer';
import LocalContentNodeConnected from './LocalContentNodeConnected';

// import Location from './Location';
// import Speakers from './Speakers';
// import Time from './Time';
// import Downloads from './Downloads';
// import Spacer from './Spacer';
// import ChildContentFeed from './ChildContentFeed';

import LocalActionContainer from './LocalActionContainer';

const ActionableTypes = [
  "Local_Event"
]

const LocalNodeSingleInner = ({ nodeId, typename, ImageWrapperComponent, ...props }) => (
  <View {...props}>
    <Spacer nodeId={nodeId} />
    <LocalContentNodeConnected
      ImageWrapperComponent={ImageWrapperComponent}
      nodeId={nodeId}
    />
    {/*
    <ScriptureNodeConnected nodeId={nodeId} />
    <NodeFeaturesConnected nodeId={nodeId} />
    <UpNextButtonConnected nodeId={nodeId} />
    */}

    {/* <Time contentId={nodeId} />
    <Location contentId={nodeId} />
    <Speakers contentId={nodeId} />
    <Downloads contentId={nodeId} /> */}
    {/*
    <ContentParentFeedConnected nodeId={nodeId} />
    <ContentChildFeedConnected nodeId={nodeId} />
    */}
    {/* <ChildContentFeed contentId={nodeId} /> */}

    {ActionableTypes.includes(typename) && (
      <LocalActionContainer contentId={nodeId} />
    )}

    <View style={{ height: 200 }} />
  </View>
);

export default LocalNodeSingleInner;
