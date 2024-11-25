import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch} from 'react-redux';
import store from '../store';
import {MainRoutesEnum, StackParamList} from '../types';
import {translate} from '../localization/Localization';
import {deleteUser} from '../store/actions/user.actions';

export const useDeleteWallet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const dispatch = useDispatch();
  const prompt = () => {
    const activeUser = store.getState().user.activeUser;
    if (!activeUser) return;
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('profile_delete_wallet_action_title'),
      details: translate('profile_delete_wallet_action_subtitle', {userName: `${activeUser.firstName} ${activeUser.lastName}`}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async (): Promise<void> => dispatch<any>(deleteUser(activeUser.id)),
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async (): Promise<void> => navigation.goBack(),
      },
    });
  };

  return prompt;
};
