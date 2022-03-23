import React from 'react';
import { View, FlatList } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import {
  BackgroundView,
  H4,
  H5,
  styled,
  Touchable,
  Cell,
  CellText,
  GradientOverlayImage,
  Divider
} from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';

const getSpeakers = gql`
  query getStaffDirectory {
    local @client {
      speakerCollection {
        total
        items {
          sys { id }
          name
          title: summary
          photo {
            url
          }
          isOnConferenceDirectory
        }
      }
    }
  }
`;

interface GetSpeakersData {
  local: {
    speakerCollection: {
      total: number
      items: Speaker[]
    }
  }
}

interface Speaker {
  sys: { id: string }
  name: string
  title: string
  photo: { url: string }
  isOnConferenceDirectory: boolean
}


export function StaffDirectory() {
  const { data, loading, refetch } = useQueryAutoRefresh<GetSpeakersData>(getSpeakers);

  const items = (data?.local?.speakerCollection?.items || [])

  return <BackgroundView>
    <FlatList
      refreshing={loading}
      onRefresh={refetch}
      style={{ flex: 1 }}
      data={items}
      renderItem={(props) => <DirectorySpeaker item={props.item} loading={loading} />}
    />
  </BackgroundView>;
}

const Avatar = styled(({ theme }: any) => ({
  width: theme.sizing.baseUnit * 2.5,
  borderRadius: 1000,
  aspectRatio: 1,
}))(GradientOverlayImage);

const TextContainer = styled(({ theme }) => ({
  paddingLeft: theme.sizing.baseUnit / 2,
  flexGrow: 1,
  flexShrink: 1,
}))(View);

const SubtitleText = styled(({theme}) => ({
  color: '#28312F'
}))(CellText)

function DirectorySpeaker({item, loading}: { item: Speaker, loading: boolean }) {
  const navigation = useNavigation();

  return <Touchable
    onPress={() => navigation.push('LocalContentSingle', {
      itemId: item.sys.id,
    })}
    key={item?.sys?.id}
  >
    <View>
      <Cell>
        <Avatar
          isLoading={loading}
          source={item?.photo?.url}
        />
        <TextContainer>
          <CellText isLoading={loading}><H4>{item?.name}</H4></CellText>
          <SubtitleText isLoading={loading}>{item?.title}</SubtitleText>
        </TextContainer>
        <Caret />
      </Cell>
      <Divider />
    </View>
  </Touchable>
}
