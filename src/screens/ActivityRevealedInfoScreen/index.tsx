import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import styled from 'styled-components/native';
import {NavigationButton} from '../../components/buttons/NavigationButton';
import Info, {Props as InfoProps} from '../../components/activity/Info';
import {translate} from '../../localization/Localization';
import {SSIBasicContainerStyled} from '../../styles/components';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_REVEALED_INFO>;

const Container = styled(SSIBasicContainerStyled)`
  padding-horizontal: 16px;
  padding-top: 32px;
  gap: 16px;
`;

const getInfoConfigs = (activity: Activity): InfoProps[] => {
  switch (activity.action) {
    case DefaultActionSubType.VC_SHARE:
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return activity.shared.map(({info, credential}) => ({
        info,
        header: {
          title: credential?.branding?.alias ?? credential?.title ?? translate('activity.unknown.credential'),
          description: `${Object.keys(info).length} ${translate(`activity.${activity.action}.info_header.description`)}`,
          branding: credential?.branding,
        },
      }));
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return [
        {
          info: activity.info,
          header: {
            title: activity.credential?.branding?.alias ?? activity.credential?.title ?? translate('activity.unknown.credential'),
            description: `${Object.keys(activity.info).length} ${translate(`activity.${activity.action}.info_header.description`)}`,
            branding: activity.credential?.branding,
          },
        },
      ];
  }
};

const ActivityRevealedInfoScreen = (navProps: Props) => {
  const {activity} = navProps.route.params;
  if (!activity) return null;
  return (
    <Container>
      {getInfoConfigs(activity).map(infoConfig => (
        <Info {...infoConfig} key={JSON.stringify(infoConfig.info)} showValues />
      ))}
      <NavigationButton label={translate('activity.support_link')} onPress={() => {}} disabled />
    </Container>
  );
};

export default ActivityRevealedInfoScreen;
