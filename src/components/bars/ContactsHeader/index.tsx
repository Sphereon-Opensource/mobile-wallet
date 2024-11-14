import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {SSIHeaderBarBackIconStyled as BackIcon, SSITextH3LightStyled} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';

export type Props = NativeStackHeaderProps;

const ContactsHeader = ({options: {title, ...rest}, navigation}: Props) => {
  const Left = useMemo(() => <BackIcon style={{marginTop: 0}} icon={ButtonIconsEnum.BACK} onPress={navigation.goBack} />, [navigation]);
  const Center = useMemo(() => <SSITextH3LightStyled>{title ?? 'Unknown contact'}</SSITextH3LightStyled>, [title]);

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ContactsHeader;
