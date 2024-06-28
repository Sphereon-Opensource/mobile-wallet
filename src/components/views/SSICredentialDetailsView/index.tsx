import React, {FC} from 'react';
import {ListRenderItemInfo} from 'react-native';

import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  SSICredentialDetailsViewContainerStyled as Container,
  SSIDetailsViewDetailsListStyled as DetailsList,
  SSICredentialDetailsViewFooterContainerStyled as FooterContainer,
  SSICredentialDetailsViewFooterLabelValueStyled as IssuedBy,
  SSICredentialDetailsViewFooterLabelCaptionStyled as IssuedByLabel,
} from '../../../styles/components';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import SSIImageField from '../../fields/SSIImageField';
import SSITextField from '../../fields/SSITextField';

export interface IProps {
  credentialProperties: Array<CredentialDetailsRow>;
  issuer?: string;
}

// TODO we are now using this for more than just credential information. Would be nice to refactor it to be a more general usage component

const SSICredentialDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };

  const renderFooter = () => (
    <FooterContainer>
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
        keyExtractor={(item: CredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        ListFooterComponent={renderFooter}
      />
    </Container>
  );
};

export default SSICredentialDetailsView;
