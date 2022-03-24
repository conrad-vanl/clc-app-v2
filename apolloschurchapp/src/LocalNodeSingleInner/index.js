import React from 'react';
import { View } from 'react-native';

import Spacer from './Spacer';
import LocalContentNodeConnected from './LocalContentNodeConnected';

import LocalLocation from './LocalLocation';
import LocalSpeakers from './LocalSpeakers';
import LocalTime from './LocalTime';
import LocalDownloads from './LocalDownloads';
import HorizontalContentFeed from './LocalChildContentFeed';

import LocalActionContainer from './LocalActionContainer';

const ActionableTypes = ['Local_Event'];

const LocalNodeSingleInner = ({
  nodeId,
  typename,
  ImageWrapperComponent,
  ...props
}) => (
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

    <LocalTime contentId={nodeId} />
    <LocalLocation contentId={nodeId} />
    <LocalSpeakers contentId={nodeId} />
    <LocalDownloads contentId={nodeId} />
    <HorizontalContentFeed contentId={nodeId} />

    {ActionableTypes.includes(typename) && (
      <LocalActionContainer contentId={nodeId} />
    )}

    <View style={{ height: 200 }} />
  </View>
);

export default LocalNodeSingleInner;
