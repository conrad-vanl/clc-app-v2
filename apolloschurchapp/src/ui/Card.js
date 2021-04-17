import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import {
  ContentCard,
  ErrorCard,
  Card,
  CardContent,
  CardImage,
  H3,
  H4,
  BodyText,
  H6,
  styled,
} from '@apollosproject/ui-kit';

const LabelText = styled(({ theme }) => ({
  color: theme.colors.primary,
}))(H6);

const FloatingFooterText = styled(({ theme }) => ({
  position: 'absolute',
  bottom: theme.sizing.baseUnit,
  left: theme.sizing.baseUnit,
  right: theme.sizing.baseUnit,
}))(H4);

const ContentCardConnected = ({
  error,
  title,
  isLoading,
  labelText,
  summary,
  coverImage,
  ...otherProps
}) => {
  if (error) return <ErrorCard error={error} />;

  return (
    <Card isLoading={isLoading}>
      {coverImage || isLoading ? <CardImage source={coverImage} /> : null}
      <CardContent>
        {labelText ? <LabelText>{labelText}</LabelText> : null}
        {title || isLoading ? <H3>{title}</H3> : null}
        {summary || isLoading ? (
          <BodyText>{summary}</BodyText>
        ) : null}
      </CardContent>
    </Card>
  );
};

ContentCardConnected.propTypes = {
  isLoading: PropTypes.bool,
  contentId: PropTypes.string,
  tile: PropTypes.bool,
};

export default ContentCardConnected;