import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { throttle, uniq } from 'lodash';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  BackgroundView,
  H4,
  H5,
  styled,
  Touchable,
  Cell,
  CellText,
  GradientOverlayImage,
  Divider,
  Button
} from '@apollosproject/ui-kit';
import { SearchInputHeader } from '@apollosproject/ui-connected'
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';
import { present, parseName, rewriteContentfulUrl } from '../util';

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

const Spacer = styled(({ theme }) => ({
  backgroundColor: theme.colors.background.paper,
  height: 4
}))(View);

export function StaffDirectory() {
  const { data, loading, refetch } = useQueryAutoRefresh<GetSpeakersData>(getSpeakers);
  const [searchText, setSearchText] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>();

  let items = (data?.local?.speakerCollection?.items || [])
    .filter((s) => s.isOnConferenceDirectory)
    .slice()
    .sort(byLastNameFirstName)

  const teams = uniq(items.map((s) => s.team).filter(present))

  if (present(teamFilter)) {
    items = items.filter((s) => s.team == teamFilter)
  }

  if (present(searchText)) {
    const term = searchText.toLowerCase()
    items = items.filter((s) => {
      return s.name.toLowerCase().includes(term) ||
        s.title?.toLowerCase()?.includes(term)
    })
  }

  return <BackgroundView>
    <Spacer />
    <View style={{ display: 'flex', flexDirection: 'row'}}>
      <SearchInputHeader
        style={{ flex: 3 }}
        onChangeText={throttle(setSearchText, 300)}
        // onFocus={setIsFocused}
        // inputRef={searchRef}
      />
      <Button style={{flex: 1}} title={teamFilter || 'Team...'} type={'secondary'}
          onPress={() => { bottomSheetModalRef?.current?.present()}}>
      </Button>
    </View>
    <FlatList
      refreshing={loading}
      onRefresh={refetch}
      style={{ flex: 1 }}
      data={items}
      renderItem={(props) => <DirectorySpeaker item={props.item} loading={loading} />}
    />
    
    <ForwardedPickerModal
      ref={bottomSheetModalRef}
      items={teams}
      selectedItem={teamFilter}
      onValueChange={setTeamFilter} />
  </BackgroundView>;
}

interface PickerModalProps {
  items: string[],
  selectedItem?: string
  onValueChange(item: string | undefined): void
}

const Container = styled(({ theme }) => ({
  paddingHorizontal: theme.sizing.baseUnit,
  flex: 1,
}))(SafeAreaView);

function PickerModal(props: PickerModalProps, ref: React.ForwardedRef<BottomSheetModal>) {
  const { items, selectedItem } = props
  console.log('items', items)

  return <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['33%']}
        dismissOnPanDown={true}>
      <Container edges={['bottom', 'left', 'right']}>
        <H4>Filter by team</H4>
        <Picker
          selectedValue={selectedItem}
          onValueChange={onValueChange}>

          <Picker.Item value='' label='No Filter' />
          {items.map((t) =>
            <Picker.Item key={t} label={t} value={t} />)}
        </Picker>
      </Container>
    </BottomSheetModal>

  function onValueChange(value: number | string) {
    if (!value) {
      return props.onValueChange(undefined)
    }
    if (typeof value == 'string') {
      props.onValueChange(value)
    } else {
      // the Picker.Item array has the placeholder at zero index
      props.onValueChange(items[value - 1])
    }
  }
}
const ForwardedPickerModal = React.forwardRef(PickerModal)

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

  const photoUrl = item?.photo?.url && rewriteContentfulUrl(item?.photo?.url, { w: 100 })

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
          source={photoUrl}
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

  const nameA = parseName(a?.name)
  const nameB = parseName(b?.name)

  const compare = nameA.last!.localeCompare(nameB.last!)
  if (compare != 0) { return compare }

  return nameA.first.localeCompare(nameB.first)
}
