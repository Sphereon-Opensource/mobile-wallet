import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors} from '@sphereon/ui-components.core';
import {ScrollView} from 'react-native';
import {contentContainerStyle} from '../../../components/containers/ScreenContainer';
import {translate} from '../../../localization/Localization';
import {SSITextH5LightStyled} from '../../../styles/components';
import {Document, ReadDocumentParamsList} from '../../../types';

type DocumentScreenProps = NativeStackScreenProps<ReadDocumentParamsList, Document>;
const SCREEN_CONTAINER_HORIZONTAL_PADDING = Number(contentContainerStyle.paddingHorizontal);

const DocumentText = ({
  route: {
    params: {document},
  },
}: DocumentScreenProps) => (
  <ScrollView
    style={{
      backgroundColor: backgroundColors.primaryDark,
      paddingHorizontal: SCREEN_CONTAINER_HORIZONTAL_PADDING,
    }}
    showsVerticalScrollIndicator={false}>
    <SSITextH5LightStyled selectable={true}>{translate(`onboarding_pages.read_terms_and_privacy.${document}.text`)}</SSITextH5LightStyled>
  </ScrollView>
);

export default DocumentText;
