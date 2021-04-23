import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { View } from 'react-native';
import {
  Cell,
  Divider,
  styled,
  UIText,
  H5,
  H6,
  Touchable,
  Icon,
} from '@apollosproject/ui-kit';

import Liked from './Liked';

const LabelText = styled(({ theme, expired }) => ({
  ...(!expired ? { color: '#b9a9b3' } : {}),
  fontSize: 10,
}))(H6);

const TimeContainer = styled(({ theme }) => ({
  width: 80,
  alignItems: 'flex-start',
  // paddingLeft: theme.sizing.baseUnit / 2,
}))(View);

const EventInfo = styled(({ theme }) => ({
  // paddingRight: theme.sizing.baseUnit / 2,
  flexGrow: 1,
  flexShrink: 1,
}))(View);

const ScheduleCell = styled(({ theme, expired }) => ({
  height: theme.sizing.baseUnit * 5,
  opacity: expired ? 0.6 : 1,
  backgroundColor: theme.colors.background.screen,
}))(Cell);

const ScheduleCellRowPositioner = styled({
  flexDirection: 'row',
})(View);

const Actions = styled(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: 50,
  paddingRight: theme.sizing.baseUnit / 2,
}))(View);

export const Caret = styled(({ theme }) => ({
  alignSelf: 'center',
  marginTop: 9,
  opacity: 0.5,
}))((props) => <Icon name="arrow-next" size={20} {...props} />);

const SecondaryText = styled({ opacity: 0.6 })(UIText);

const formatTime = (time) => time ? moment(time).format('h:mma') : null;

const ScheduleItem = ({
  id,
  startTime,
  endTime,
  title = '',
  summary = '',
  label = '',
  onPress,
  isLoading,
  ...other
}) => {
  let cell = (
    <ScheduleCell expired={moment(endTime) < new Date()} {...other}>
      <ScheduleCellRowPositioner>
        {startTime || isLoading ? (
          <TimeContainer>
            <UIText isLoading={isLoading}>{formatTime(startTime)}</UIText>
            <SecondaryText isLoading={isLoading}>{formatTime(endTime)}</SecondaryText>
          </TimeContainer>
        ) : null}
        <EventInfo>
          {label || isLoading ? (
            <LabelText isLoading={isLoading} expired={moment(endTime) < new Date()}>
              {label}
            </LabelText>
          ) : null}
          <H5 isLoading={isLoading} numberOfLines={2}>{title}</H5>
          {(summary && !label) || isLoading ? (
            <SecondaryText isLoading={isLoading} numberOfLines={title.length > 30 ? 1 : 2}>
              {summary}
            </SecondaryText>
          ) : null}
        </EventInfo>
        <Actions>
          <Liked id={id} />
          {onPress ? <Caret /> : null}
        </Actions>
      </ScheduleCellRowPositioner>
    </ScheduleCell>
  );
  if (onPress) cell = <Touchable onPress={onPress}>{cell}</Touchable>;
  return (
    <React.Fragment>
      {cell}
      <Divider />
    </React.Fragment>
  );
};

ScheduleItem.propTypes = {
  id: PropTypes.string,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  title: PropTypes.string,
  summary: PropTypes.string,
  onPress: PropTypes.func,
  label: PropTypes.string,
};

export default ScheduleItem;
