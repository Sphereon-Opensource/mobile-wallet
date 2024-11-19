import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {Back, CenterInfo} from '../components';

export type Props = NativeStackHeaderProps & {
  createdAt: string;
};

const ActivityDetailHeader = ({options: {title}, createdAt, navigation}: Props) => {
  const Left = useMemo(() => <Back onPress={navigation.goBack} />, [navigation]);

  const Center = useMemo(() => <CenterInfo title={title ?? 'Unknown activity'} subtitle={createdAt} />, [title, createdAt]);

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ActivityDetailHeader;
