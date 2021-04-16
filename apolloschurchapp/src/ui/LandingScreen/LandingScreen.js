import React from 'react';
import PropTypes from 'prop-types';

import { Image } from 'react-native';

import {
  styled,
  withTheme,
  Icon,
  H1,
  H4,
  PaddedView,
  BackgroundView,
} from '@apollosproject/ui-kit';

import { Slide } from '@apollosproject/ui-onboarding';

const Content = styled({
  flex: 1,
  justifyContent: 'center',
})(PaddedView);

const BrandIcon = withTheme(({ theme, color }) => ({
  source: require('./img/logo-orange.jpg'),
  style: {
    marginBottom: theme.sizing.baseUnit,
    width: theme.sizing.baseUnit * 3,
    height: theme.sizing.baseUnit * 3,
    aspectRatio: 1,
  },
}))(Image);

const Title = styled(({ theme, color }) => ({
  marginBottom: theme.sizing.baseUnit,
  ...(color ? { color } : {}),
}))(H1);

const StyledH4 = styled(({ color }) => ({
  ...(color ? { color } : {}),
}))(H4);

const LandingScreen = ({
  slideTitle,
  description,
  textColor,
  BackgroundComponent,
  ...props
}) => (
  <BackgroundView>
    <Slide {...props} scrollEnabled={false}>
      {BackgroundComponent}
      <Content>
        <BrandIcon color={textColor} />
        <Title color={textColor}>{slideTitle}</Title>
        <StyledH4 color={textColor}>{description}</StyledH4>
      </Content>
    </Slide>
  </BackgroundView>
);

LandingScreen.propTypes = {
  /* The `Swiper` component used in `<onBoarding>` looks for and hijacks the title prop of it's
   * children. Thus we have to use more unique name.
   */
  slideTitle: PropTypes.string,
  description: PropTypes.string,
  textColor: PropTypes.string, // Use for custom text and `BrandIcon` color when overlaying text on an image or video needs more clarity. Defaults to theme driven colors.
  /* Recommended usage:
   * - `Image` (react-native)
   * - `GradientOverlayImage` (@apollosproject/ui-kit) for increased readability
   * - `Video` (react-native-video) because moving pictures!
   */
  BackgroundComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

LandingScreen.defaultProps = {
  slideTitle: "Meet the Church Leaders Conference App",
  description:
    "Your go-to resource for schedules, maps, news and of course - Farkle.",
};

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
