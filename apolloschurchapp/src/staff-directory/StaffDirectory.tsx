import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { throttle } from 'lodash';

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
import { SearchInputHeader } from '@apollosproject/ui-connected'
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';
import { present } from '../util';

const getSpeakers = gql`
  query getStaffDirectory {
    local @client {
      speakerCollection {
        total
        items {
          sys { id }
          name
          title: summary
          team
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
  title?: string
  team?: string
  photo: { url: string }
  isOnConferenceDirectory: boolean
}


export function StaffDirectory() {
  const { data, loading, refetch } = useQueryAutoRefresh<GetSpeakersData>(getSpeakers);
  const [searchText, setSearchText] = useState('');

  let items = (data?.local?.speakerCollection?.items || [])
    .filter((s) => s.isOnConferenceDirectory)
    .slice()
    .sort(byLastNameFirstName)

  if (present(searchText)) {
    const term = searchText.toLowerCase()
    items = items.filter((s) => {
      return s.name.toLowerCase().includes(term) ||
        s.title?.toLowerCase()?.includes(term) ||
        s.team?.toLowerCase()?.includes(term)
    })
  }

  return <BackgroundView>
    <SearchInputHeader
      style={{paddingTop: 4}}
      onChangeText={throttle(setSearchText, 300)}
      // onFocus={setIsFocused}
      // inputRef={searchRef}
    />
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
  color: '#6A6A6A'
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

// if a > b return a positive number, if b > a return a negative number
function byLastNameFirstName(a: { name: string }, b: { name: string }): number {

  const [firstA, ...splitA] = a?.name?.split(/\s+/) || []
  const lastA = splitA[splitA.length - 1] // Handle "Timothy (TA) Ateek"
  const [firstB, ...splitB] = b?.name?.split(/\s+/) || []
  const lastB = splitB[splitB.length - 1]

  // put people without a last name at the end of the list
  if (lastA && !lastB) { return -1 }
  if (!lastA && lastB) { return 1 }
  if (!lastA && !lastB) { return 0 }

  const compare = lastA.localeCompare(lastB)
  if (compare != 0) { return compare }

  return firstA.localeCompare(firstB)
}