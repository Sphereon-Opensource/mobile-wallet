import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {Back, Title} from '../components';

export type Props = NativeStackHeaderProps;

const ActivityRevealedInfoHeader = ({options: {title}, navigation}: Props) => {
  const Left = useMemo(() => <Back onPress={navigation.goBack} />, [navigation]);
  const Center = useMemo(() => <Title>{title ?? 'Unknown activity'}</Title>, [title]);

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ActivityRevealedInfoHeader;
