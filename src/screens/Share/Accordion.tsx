import React from 'react';
import {Image, View} from 'react-native';
import Animated, {SharedValue, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {DataPoint} from 'src/types/machines/share';
import {translate} from '../../localization/Localization';
import {SSITextH5LightStyled} from '../../styles/components';
import {InformationIconContainer} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {AusweisRequestedInfoSchema, Icon, InfoSchemaImages} from '../Onboarding/ImportDataConsentScreen/constants';

type ItemProps = {
  isExpanded: SharedValue<boolean>;
  children: React.ReactNode;
  viewKey: string;
  style?: any;
  duration?: number;
};

const Accordion = ({isExpanded, children, viewKey, style, duration = 500}: ItemProps) => {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    }),
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View
      key={`accordion_${viewKey}`}
      style={[
        {
          width: '100%',
          overflow: 'hidden',
        },
        bodyStyle,
        style,
      ]}>
      <View
        onLayout={e => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={{
          width: '100%',
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          // paddingBottom: 12,
        }}>
        {children}
      </View>
    </Animated.View>
  );
};

export const Item = ({item, missing = false}: {item: string; missing?: boolean}) => {
  const icon = AusweisRequestedInfoSchema.find(({label}) => label === item)?.icon as Icon;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8,
        width: '100%',
        position: 'relative',
        margin: 0,
      }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 8,
          height: '100%',
          backgroundColor: missing ? '#FF9900' : '#00C249',
        }}
      />
      <InformationIconContainer>
        <Image style={{height: 24, width: 24}} resizeMode="stretch" source={InfoSchemaImages[icon]} />
      </InformationIconContainer>
      <SSITextH5LightStyled style={{opacity: 0.8}}>{translate(`onboarding_pages.import_data_consent.labels.${item}`)}</SSITextH5LightStyled>
    </View>
  );
};

type Props = {
  open: SharedValue<boolean>;
  notRequested: DataPoint[];
};

export const NotRequestedAccordion = ({open, notRequested}: Props) => {
  return (
    <View>
      <Accordion isExpanded={open} viewKey="Accordion">
        {/*not entirely clear if the value should also be rendered here, but we can access it if needed */}
        {notRequested.map(({label, value: _}) => (
          <Item item={label} key={label} missing={true} />
        ))}
      </Accordion>
    </View>
  );
};
