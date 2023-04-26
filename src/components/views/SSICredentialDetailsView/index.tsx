import React, {FC} from 'react';
import {ListRenderItemInfo, View} from 'react-native';

import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  SSICredentialDetailsViewContainerStyled as Container,
  SSIDetailsViewDetailsListStyled as DetailsList,
  SSICredentialDetailsViewFooterContainerStyled as FooterContainer,
  SSICredentialDetailsViewFooterLabelValueStyled as IssuedBy,
  SSICredentialDetailsViewFooterLabelCaptionStyled as IssuedByLabel,
} from '../../../styles/components';
import {HeaderEventEnum, ICredentialDetailsRow} from '../../../types';
import SSITextField from '../../fields/SSITextField';
import {headerEmitter} from '../../bars/SSIHeaderBar';

export interface IProps {
  credentialProperties: Array<ICredentialDetailsRow>;
  issuer?: string;
}

// TODO we are now using this for more than just credential information. Would be nice to refactor it to be a more general usage component

const SSICredentialDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialDetailsRow>) => (
    <View
      onStartShouldSetResponder={() => {
        headerEmitter?.emit(HeaderEventEnum.ON_MORE_MENU_CLOSE);
        return true;
      }}>
      <SSITextField item={itemInfo.item} index={itemInfo.index} />
    </View>
  );

  const renderFooter = () => (
    <FooterContainer
      onStartShouldSetResponder={() => {
        headerEmitter?.emit(HeaderEventEnum.ON_MORE_MENU_CLOSE);
        return true;
      }}>
      {props.issuer && (
        <>
          <IssuedByLabel>{translate('credential_details_view_issued_by')}</IssuedByLabel>
          <IssuedBy>{props.issuer}</IssuedBy>
        </>
      )}
    </FooterContainer>
  );

  return (
    <Container>
      <DetailsList
        // TODO has a ItemSeparatorComponent which is a bit nicer to use then the logic now with margins
        data={props.credentialProperties}
        renderItem={renderItem}
        keyExtractor={(item: ICredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        ListFooterComponent={renderFooter}
      />
    </Container>
  );
};

export default SSICredentialDetailsView;
