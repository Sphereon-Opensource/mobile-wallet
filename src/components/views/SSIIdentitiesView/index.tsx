import {Identity} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {ListRenderItemInfo, RefreshControl} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {SSIIdentitiesViewContainerStyled as Container} from '../../../styles/components';
import SSIIdentityViewItem from '../SSIIdentityViewItem';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';

export interface IProps {
  identities: Array<Identity>;
}

const SSIIdentitiesView: FC<IProps> = (props: IProps): JSX.Element => {
  const {identities} = props;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(false);
  };

  const renderItem = (itemInfo: ListRenderItemInfo<Identity>): JSX.Element => (
    <SSIIdentityViewItem
      style={{
        backgroundColor: itemInfo.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
        ...(itemInfo.index === identities.length - 1 && itemInfo.index % 2 === 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
      }}
      name={itemInfo.item.alias}
      roles={itemInfo.item.roles}
    />
  );

  return (
    <Container>
      <SwipeListView
        data={identities}
        keyExtractor={(itemInfo: Identity) => itemInfo.id}
        renderItem={renderItem}
        closeOnRowOpen
        closeOnRowBeginSwipe
        useFlatList
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </Container>
  );
};

export default SSIIdentitiesView;
