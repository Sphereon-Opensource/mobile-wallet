import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {Back, CenterInfo} from '../components';

export type Props = NativeStackHeaderProps & {
  createdAt: string;
};

const ActivityDetailHeader = ({options: {title}, createdAt, navigation}: Props) => {
  const Left = useMemo(() => <Back onPress={navigation.goBack} accessibilityHint="Navigate back to the previous screen" />, [navigation]);
  const Center = useMemo(
    () => (
      <CenterInfo
        title={title ?? 'Unknown activity'}
        titleAccessibilityLabel={`contact involved: ${title}`}
        subtitle={createdAt}
        subtitleAccessibilityLabel={`Activity occurred at: ${createdAt}`}
      />
    ),
    [title, createdAt],
  );

  return <HeaderSecondaryBar left={Left} center={Center} />;
};

export default ActivityDetailHeader;
