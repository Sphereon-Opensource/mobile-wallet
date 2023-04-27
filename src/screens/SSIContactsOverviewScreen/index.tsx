import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {IContact} from '@sphereon/ssi-sdk-data-store';
import React, {PureComponent} from 'react';
import {ListRenderItemInfo, RefreshControl} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {connect} from 'react-redux';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIContactViewItem from '../../components/views/SSIContactViewItem';
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem';
import {deleteContact, getContacts} from '../../store/actions/contact.actions';
import {SSIBasicContainerStyled as Container, SSIRippleContainerStyled as ItemContainer} from '../../styles/components';
import {IUser, MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {translate} from '../../localization/Localization';
import {backgrounds, borders} from '../../styles/colors';

const format = require('string-format');

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACTS_OVERVIEW> {
  getContacts: () => void;
  contacts: Array<IContact>;
  deleteContact: (contactId: string) => void;
  activeUser: IUser;
}

interface IState {
  refreshing: boolean;
}

class SSIContactsOverviewScreen extends PureComponent<IProps, IState> {
  state: IState = {
    refreshing: false,
  };

  onRefresh = async (): Promise<void> => {
    this.props.getContacts();
    this.setState({refreshing: false});
  };

  onDelete = async (contact: IContact): Promise<void> => {
    const { navigation, deleteContact } = this.props

    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('contact_delete_title'),
      details: format(translate('contact_delete_message'), contact.alias),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => {
          deleteContact(contact.id);
          navigation.goBack();
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => navigation.goBack(),
      },
    });
  };

  onItemPress = async (contact: IContact): Promise<void> => {
    this.props.navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, {contact});
  };

  renderItem = (itemInfo: ListRenderItemInfo<IContact>): JSX.Element => {
    const { activeUser, contacts } = this.props
    const contactItem = <SSIContactViewItem name={itemInfo.item.alias} uri={itemInfo.item.uri} roles={itemInfo.item.roles} />;
    const hiddenStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgrounds.secondaryDark : backgrounds.primaryDark,
    }
    const style = {
      ...hiddenStyle,
      ...(itemInfo.index === (contacts.length - 1) && itemInfo.index % 2 !== 0 && { borderBottomWidth: 1, borderBottomColor: borders.dark })
    }

    return itemInfo.item.id === activeUser.id ? (
      <ItemContainer
        style={style}
        onPress={() => this.onItemPress(itemInfo.item)}>
        {contactItem}
      </ItemContainer>
    ) : (
      <SSISwipeRowViewItem
        style={style}
        hiddenStyle={hiddenStyle}
        viewItem={contactItem}
        onPress={() => this.onItemPress(itemInfo.item)}
        onDelete={() => this.onDelete(itemInfo.item)}
      />
    );
  };

  render() {
    return (
      <Container>
        <SwipeListView
          data={this.props.contacts}
          keyExtractor={(itemInfo: IContact) => itemInfo.id}
          renderItem={this.renderItem}
          closeOnRowOpen
          closeOnRowBeginSwipe
          useFlatList
          initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    getContacts: () => dispatch(getContacts()),
    deleteContact: (contactId: string) => dispatch(deleteContact(contactId)),
  };
};

const mapStateToProps = (state: RootState) => {
  return {
    contacts: state.contact.contacts,
    activeUser: state.user.activeUser!,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SSIContactsOverviewScreen);
