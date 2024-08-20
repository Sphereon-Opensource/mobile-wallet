import {Image} from 'react-native';
import {AusweisRequestedInfoItem, InfoSchemaImages} from '../constants';
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
        <InformationIconContainer>
          <Image style={{height: 20, width: 20}} resizeMode="stretch" source={InfoSchemaImages[info.icon]} width={20} height={20} />
        </InformationIconContainer>
        <RequestedInformationDescriptionContainer>
          <RequestedInformationLabel>{info.label}</RequestedInformationLabel>
          {info.data && <RequestedInformationValue>{info.data}</RequestedInformationValue>}
        </RequestedInformationDescriptionContainer>
      </RequestedInformationRow>
    ))}
  </RequestedInformationContainer>
);

export {ImportInformationSummary};
