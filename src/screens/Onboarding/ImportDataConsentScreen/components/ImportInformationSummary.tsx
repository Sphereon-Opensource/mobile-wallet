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

const ImportInformationSummary = (props: ImportInformationSummaryProps) => {
  const {data} = props;

  return (
    <RequestedInformationContainer>
      {data.map(info => (
        <RequestedInformationRow>
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
};

export {ImportInformationSummary};
