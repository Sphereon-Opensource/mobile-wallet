import {DefaultActionSubType} from '@sphereon/ssi-types';
import {backgroundColors} from '@sphereon/ui-components.core';
import React, {useMemo} from 'react';
import {RefreshControl, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import {translate} from '../../localization/Localization';
import {
  ActivitiesOverviewScreenEmptyStateContainerStyled as EmptyStateContainer,
  ActivitiesOverviewScreenEmptyStateImageContainerStyled as EmptyStateImageContainer,
  SSILoadingScreenActivityCaptionStyled,
  SSILoadingScreenActivityIndicatorStyled,
  SSITextH3LightStyled,
  SSITextH4LightStyled as SubTitleText,
  ActivitiesOverviewScreenEmptyStateTitleTextStyled as TitleText,
} from '../../styles/components';
import {Activity} from '../../types';
import {toActivityEventRow} from '../../utils/activity';
import ActivitiesImage from '../assets/images/ActivitiesImage';
import {Props as SearchInputProps} from '../fields/OnboardingSearchField';
import {ActivityEventRow} from './ActivityEventRow';
import {Search} from './Search';

type Props = {
  activities?: Activity[];
  loading: boolean;
  onActivityPress: (id: string) => void;
  onRefresh: () => void;
  listTitle: string;
  loadingListText: string;
  searchInputProps?: SearchInputProps;
};

const NoActivities = () => (
  <EmptyStateContainer>
    <EmptyStateImageContainer>
      <ActivitiesImage />
    </EmptyStateImageContainer>
    <TitleText>{translate('activity.feed.list.empty_state.title')}</TitleText>
    <SubTitleText>{translate('activity.feed.list.empty_state.subtitle')}</SubTitleText>
  </EmptyStateContainer>
);

const searchFilter = (searchTerm: string) => (activity: Activity) => {
  let searchTokens: (string | number)[] = [];
  switch (activity.action) {
    case DefaultActionSubType.VC_SHARE:
    case DefaultActionSubType.VC_SHARE_DECLINE:
      searchTokens = [
        activity.at.toString(),
        activity.contactAlias,
        activity.action,
        activity.purpose,
        activity.result,
        ...(activity.shared ?? []).map(s => `${s.credential?.title}`),
        ...(activity.shared ?? []).map(s => Object.keys(s.info)).flat(),
        ...(activity.credentialType ? [activity.credentialType] : []),
      ];
      break;
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      searchTokens = [
        activity.at.toString(),
        activity.action,
        activity.result,
        ...(activity.credential?.title ? [activity.credential.title] : []),
        ...Object.keys(activity.info),
      ];
      break;
  }
  return searchTokens.some(token => token.toString().toLowerCase().includes(searchTerm));
};

const ActivityList = ({activities, loading, onActivityPress, onRefresh, listTitle, loadingListText, searchInputProps}: Props) => {
  const [search, setSearch] = React.useState('');
  const filteredActivities = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return (activities ?? []).filter(searchFilter(searchTerm)).map(toActivityEventRow);
  }, [search, activities]);
  return (
    <View style={{backgroundColor: backgroundColors.primaryDark, flex: 1}}>
      {loading ? (
        <View style={{flex: 1, alignItems: 'center', gap: 24, justifyContent: 'center'}}>
          <SSILoadingScreenActivityIndicatorStyled />
          <SSILoadingScreenActivityCaptionStyled>{loadingListText}</SSILoadingScreenActivityCaptionStyled>
        </View>
      ) : !activities ? (
        <></>
      ) : activities.length === 0 ? (
        <NoActivities />
      ) : (
        <>
          <Search search={search} onSearchChange={setSearch} {...searchInputProps} />
          <SSITextH3LightStyled
            style={{
              paddingHorizontal: 24,
              borderBottomWidth: 1,
              borderBottomColor: '#404D7A',
            }}>
            {listTitle}
          </SSITextH3LightStyled>
          <SwipeListView
            style={{
              backgroundColor: backgroundColors.primaryDark,
            }}
            data={filteredActivities}
            keyExtractor={row => Object.values(row).join('-')}
            renderItem={({item, index}) => <ActivityEventRow onPress={() => onActivityPress(item.id)} index={index} {...item} />}
            closeOnRowOpen
            closeOnRowBeginSwipe
            useFlatList
            initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
            removeClippedSubviews
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          />
        </>
      )}
    </View>
  );
};

export default ActivityList;
