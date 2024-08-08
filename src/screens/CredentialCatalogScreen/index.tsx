import {FC} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {View} from 'react-native';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_CATALOG>;

const CredentialCatalogScreen: FC<Props> = (props: Props): JSX.Element => {
  return <View />;
};
