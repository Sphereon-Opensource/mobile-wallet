import {Image} from 'react-native';
import {AusweisRequestedInfoItem, InfoSchemaIcons} from '../constants';
import {
  InformationIconContainer,
  RequestedInformationContainer,
  RequestedInformationDescriptionContainer,
  RequestedInformationLabel,
  RequestedInformationRow,
  RequestedInformationValue,
} from './styles';

type ImportInformationSummaryProps = {
  data: AusweisRequestedInfoItem[];
};

const ImportInformationSummary = ({data}: ImportInformationSummaryProps) => (
  <RequestedInformationContainer>
    {data.map(info => (
      <RequestedInformationRow key={info.label}>
        <InformationIconContainer>{InfoSchemaIcons[info.icon]}</InformationIconContainer>
        <RequestedInformationDescriptionContainer>
          <RequestedInformationLabel>{info.label}</RequestedInformationLabel>
          {info.data && <RequestedInformationValue>{info.data}</RequestedInformationValue>}
        </RequestedInformationDescriptionContainer>
      </RequestedInformationRow>
    ))}
  </RequestedInformationContainer>
);

export {ImportInformationSummary};
