import React, {FC} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {
  SSITermsOfServiceViewContentTextStyled as ContentText,
  SSITermsOfServiceViewContainerStyled as RouteContainer,
  SSITermsOfServiceViewScrollViewStyled as ScrollView,
  TERMS_CONTENT_BOTTOM_MARGIN,
} from '../../../styles/components';

export interface IProps {
  content: string;
  onScrollBottom?: () => Promise<void>;
}

const SSITermsOfServiceView: FC<IProps> = (props: IProps): JSX.Element => {
  const {content, onScrollBottom} = props;

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent): boolean => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - TERMS_CONTENT_BOTTOM_MARGIN;
  };

  const onScroll = async ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (onScrollBottom) {
      if (isCloseToBottom(nativeEvent)) {
        await onScrollBottom();
      }
    }
  };

  return (
    <RouteContainer>
      <ScrollView onScroll={onScroll}>
        <ContentText>{content}</ContentText>
      </ScrollView>
    </RouteContainer>
  );
};

export default SSITermsOfServiceView;
