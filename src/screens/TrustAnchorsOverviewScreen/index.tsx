import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {ListRenderItemInfo, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {useDispatch, useSelector} from 'react-redux';
import {backgroundColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SSITextH3LightStyled, SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem';
import {translate} from '../../localization/Localization';
import {getTrustAnchors, removeTrustAnchor} from '../../store/actions/trustAnchor.actions';
import {MainRoutesEnum, RootState, ScreenRoutesEnum} from '../../types';
import {ITrustAnchor} from '../../types/store/trustAnchor.types';

const TrustAnchorsOverviewScreen = (): JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const {trustAnchors} = useSelector((state: RootState) => state.trustAnchor);

  useEffect(() => {
    dispatch<any>(getTrustAnchors());
  }, [dispatch]);

  const onAdd = (): void => navigation.navigate(ScreenRoutesEnum.TRUST_ANCHOR_ADD);

  const confirmDelete = async (item: ITrustAnchor): Promise<void> => {
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('trust_anchor_remove_label'),
      details: translate('trust_anchor_remove_message', {label: item.label}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async (): Promise<void> => {
          dispatch<any>(removeTrustAnchor(item.id));
          navigation.goBack();
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async (): Promise<void> => navigation.goBack(),
      },
    });
  };

  const renderItem = (info: ListRenderItemInfo<ITrustAnchor>): JSX.Element => {
    const item = info.item;
    const expired = item.notAfter ? new Date(item.notAfter).getTime() < Date.now() : false;
    const backgroundStyle = {backgroundColor: info.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark};
    const rowContent = (
      <View style={{paddingHorizontal: 24, paddingVertical: 16}}>
        <SSITextH3LightStyled>{item.label}</SSITextH3LightStyled>
        <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 2}}>
          {item.type.toUpperCase()} · {item.trustMode}
        </SSITextH5LightStyled>
        {item.subjectDN ? (
          <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 2}} numberOfLines={1}>
            {item.subjectDN}
          </SSITextH5LightStyled>
        ) : null}
        {item.notAfter ? (
          <SSITextH5LightStyled style={{opacity: 0.7, marginTop: 2}}>
            {translate('trust_anchor_valid_until_label')}: {new Date(item.notAfter).toLocaleDateString()}
            {expired ? ` (${translate('trust_anchor_expired_label')})` : ''}
          </SSITextH5LightStyled>
        ) : null}
      </View>
    );
    return (
      <SSISwipeRowViewItem
        style={backgroundStyle}
        hiddenStyle={backgroundStyle}
        viewItem={rowContent}
        onPress={async () => navigation.navigate(ScreenRoutesEnum.TRUST_ANCHOR_DETAILS, {trustAnchor: item})}
        onDelete={async () => confirmDelete(item)}
      />
    );
  };

  return (
    <Container>
      <SafeAreaView style={{flex: 1}} edges={['bottom']}>
        {trustAnchors.length === 0 ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32}}>
            <SSITextH5LightStyled style={{textAlign: 'center', marginBottom: 24}}>{translate('trust_anchor_overview_empty')}</SSITextH5LightStyled>
            <PrimaryButton caption={translate('trust_anchor_add_button')} style={{width: '100%'}} onPress={onAdd} />
          </View>
        ) : (
          <>
            <SwipeListView
              data={trustAnchors}
              keyExtractor={(item: ITrustAnchor) => item.id}
              renderItem={renderItem}
              closeOnRowOpen
              closeOnRowBeginSwipe
              useFlatList
            />
            <View style={{paddingHorizontal: 24, paddingVertical: 16}}>
              <PrimaryButton caption={translate('trust_anchor_add_button')} style={{width: '100%'}} onPress={onAdd} />
            </View>
          </>
        )}
      </SafeAreaView>
    </Container>
  );
};

export default TrustAnchorsOverviewScreen;
