import React from 'react';
import { compose } from 'recompose';
import { Query } from '@apollo/client/react/components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Icon, styled, withTheme } from '@apollosproject/ui-kit';

const query = gql`
  query getLikedContentItem($id: ID!) {
    node(id: $id) {
      id
      ...on ContentItem {
        isLiked @cacheControl(maxAge: 0,scope: PRIVATE)
      }
    }
  }
`;

const LikedIcon = compose(
  styled(({ theme }) => ({
    alignSelf: 'center',
    marginRight: theme.sizing.baseUnit * 0.75,
  })),
  withTheme(({ theme }) => ({
    size: theme.sizing.baseUnit,
    fill: theme.colors.secondary,
  }))
)((props) => <Icon name="circle-outline-check-mark" {...props} />);

const Liked = ({ id }) => (
  <Query query={query} variables={{ id }}>
    {({ data: { node = {} } = {} }) => 
      node && node.isLiked ? <LikedIcon /> : null
    }
  </Query>
);

Liked.propTypes = {
  id: PropTypes.string,
};

export default Liked;
