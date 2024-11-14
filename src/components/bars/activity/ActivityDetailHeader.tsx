import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {fontColors} from '@sphereon/ui-components.core';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {SSIHeaderBarBackIconStyled as BackIcon, SSITextH3LightStyled, SSITextH4Styled} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';

export type Props = NativeStackHeaderProps & {
  createdAt: string;
};

const ActivityDetailHeader = ({options: {title}, createdAt, navigation}: Props) => {
  const Left = useMemo(() => <BackIcon style={{marginTop: 0}} icon={ButtonIconsEnum.BACK} onPress={navigation.goBack} />, [navigation]);

  const Center = useMemo(
    () => (
      <View style={{alignItems: 'center'}}>
        <SSITextH3LightStyled>{title ?? 'Unknown activity'}</SSITextH3LightStyled>
        <SSITextH4Styled style={{color: fontColors.greyedOut}}>{createdAt}</SSITextH4Styled>
      </View>
    ),
    [title, createdAt],
  );

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ActivityDetailHeader;
