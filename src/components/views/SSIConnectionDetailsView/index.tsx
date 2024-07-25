import {Identity, MetadataItem, MetadataTypes} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {toLocalDateString} from '../../../utils';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  SSIFlexDirectionColumnHalfViewStyled as Column,
  SSIConnectionDetailsViewRoundedContainerStyled as Container,
  SSIConnectionDetailsLabelsContainerStyled as DetailLabelsContainer,
  SSIConnectionDetailsViewCaptionDetailsStyled as DetailsCaption,
  SSITextH5LightStyled as DetailsItemLabelCaption,
  SSIConnectionDetailsViewValueCaptionStyled as DetailsItemValueCaption,
  SSIDetailsViewDetailsListStyled as DetailsList,
  SSIConnectionDetailsViewLabelRowViewStyled as LabelRow,
} from '../../../styles/components';

export interface IProps {
  identity: Identity;
}

const SSIConnectionDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const {identity} = props;

  const parseValue = (value: MetadataTypes): string => {
    // FIXME we need to check the MetadataTypes, it holds undefined but the value field of MetadataItem cannot be undefined.
    // And we need to check if the database can have the value null
    // Besides that we might want rename the type to MetadataType
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return toLocalDateString(value.getTime());
    }

    return value.toString();
  };

  const renderItem = (itemInfo: ListRenderItemInfo<MetadataItem<MetadataTypes>>) => {
    return (
      <LabelRow>
        <Column>
          <DetailsItemLabelCaption>{itemInfo.item.label}</DetailsItemLabelCaption>
        </Column>
        <Column>
          <DetailsItemValueCaption>{itemInfo.item.value}</DetailsItemValueCaption>
        </Column>
      </LabelRow>
    );
  };

  // disabling for demo purpose
  return (
    <Container>
      {/*<SSIConnectionViewItem*/}
      {/*  name={props.entityConnection.entityName}*/}
      {/*  // TODO we need a connection uri which currently is not available*/}
      {/*  uri={props.entityConnection.connection.config.redirectUrl}*/}
      {/*/>*/}
      {/*<Separator />*/}
      <DetailLabelsContainer>
        <DetailsCaption>{translate('connection_details_view_details')}</DetailsCaption>
        <DetailsList
          // TODO has a ItemSeparatorComponent which is a bit nicer to use then the logic now with margins
          data={identity.metadata}
          renderItem={renderItem}
          keyExtractor={(item: MetadataItem<MetadataTypes>) => item.id}
          initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
        />
      </DetailLabelsContainer>
    </Container>
  );
};

export default SSIConnectionDetailsView;
