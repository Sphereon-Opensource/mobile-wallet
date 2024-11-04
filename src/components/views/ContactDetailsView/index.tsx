import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {FC} from 'react';
import {ListRenderItemInfo} from 'react-native';
import SSIImageField from '../../fields/SSIImageField';
import SSITextField from '../../fields/SSITextField';
import {SSICredentialDetailsViewContainerStyled as Container, SSIDetailsViewDetailsListStyled as DetailsList} from '../../../styles/components';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';

export interface IContactDetailsViewProps {
  properties: Array<CredentialDetailsRow>;
}

export const ContactDetailsView: FC<IContactDetailsViewProps> = (props: IContactDetailsViewProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };

  return (
    <Container>
      <DetailsList
        data={props.properties.filter(p => p.value !== undefined)}
        renderItem={renderItem}
        keyExtractor={(item: CredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
    </Container>
  );
};
