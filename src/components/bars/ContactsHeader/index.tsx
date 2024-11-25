import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {Back, Title} from '../components';

export type Props = NativeStackHeaderProps;

const ContactsHeader = ({options: {title}, navigation}: Props) => {
  const Left = useMemo(() => <Back onPress={navigation.goBack} accessibilityHint="Navigate back to the previous screen" />, [navigation]);
  const Center = useMemo(() => <Title>{title ?? 'Unknown contact'}</Title>, [title]);

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ContactsHeader;
