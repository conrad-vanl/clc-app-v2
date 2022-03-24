import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  BackgroundView,
  H5,
  UIText,
  TableView,
  Touchable,
  Cell,
  CellText,
  Divider,
} from '@apollosproject/ui-kit';
import { Caret } from '../../ui/ScheduleItem';

import Maps from './LocalMaps';
import Resources from './LocalResources';

function Connect() {
  const navigation = useNavigation()

  return (
    <BackgroundView>
      <ScrollView style={{ flex: 1 }}>
        <Maps />
        <Resources />
      </ScrollView>
    </BackgroundView>
  );
}

export default Connect;
