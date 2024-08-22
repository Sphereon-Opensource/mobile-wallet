import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SSITextH3LightStyled, SSITextH4LightStyled, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useMemo, useRef, useState} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import styled from 'styled-components/native';
import ChevronIcon from '../../components/assets/icons/ChevronIcon';
import ScreenContainer from '../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../localization/Localization';
import {ShareContext} from '../../navigation/machines/shareStateNavigation';
import {SSITextH2SemiBoldLightStyled, SSITextH5Styled} from '../../styles/components';
import {DataPoint, ShareMachineEvents} from '../../types/machines/share';
import {ProviderContainer, ProviderDescription, ProviderImage, ProviderUrl} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {AusweisRequestedInfoSchema} from '../Onboarding/ImportDataConsentScreen/constants';
import {Item, NotRequestedAccordion} from './Accordion';

type Provider = {
  name: string;
  image: any;
  // stricter types
  registeredData: DataPoint[];
  // remove hacky
  contrastBackgroundColor?: string;
};

const providers: Provider[] = [
  {
    name: 'Ausweid EID',
    image: require('../../assets/images/ausweis_icon.png'),
    registeredData: AusweisRequestedInfoSchema.map(({label}) => ({
      label,
      value: `${label} value`,
    })),
  },
  {
    // no overlapping data
    name: 'IDNow',
    image: require('../../assets/images/PlaceholderLogo.png'),
    registeredData: [
      {label: 'nationality', value: 'nationality value'},
      {label: 'birthdate', value: 'birthdate value'},
    ],
  },
  {
    name: 'IDThen',
    image: require('../../assets/images/PlaceholderLogo.png'),
    // some overlapping data
    registeredData: [
      {label: 'nationality', value: 'nationality value'},
      {label: 'birthdate', value: 'birthdate value'},
      {label: 'given_name', value: 'given_name value'},
      {label: 'family_name', value: 'family_name value'},
    ],
    contrastBackgroundColor: '#5BDED2',
  },
  {
    name: 'IDThen1',
    image: require('../../assets/images/PlaceholderLogo.png'),
    // some overlapping data
    registeredData: [
      {label: 'birthdate', value: 'birthdate value'},
      {label: 'given_name', value: 'given_name value'},
      {label: 'family_name', value: 'family_name value'},
    ],
    // put other random pal colors here
    contrastBackgroundColor: '#5B68EE',
  },
  {
    name: 'IDThen2',
    image: require('../../assets/images/PlaceholderLogo.png'),
    // some overlapping data
    registeredData: [
      {label: 'nationality', value: 'nationality value'},
      {label: 'birthdate', value: 'birthdate value'},
      {label: 'given_name', value: 'given_name value'},
      {label: 'family_name', value: 'family_name value'},
    ],
    contrastBackgroundColor: '#FDB9B9',
  },
  {
    name: 'IDThen3',
    image: require('../../assets/images/PlaceholderLogo.png'),
    // some overlapping data
    registeredData: [
      {label: 'nationality', value: 'nationality value'},
      {label: 'birthdate', value: 'birthdate value'},
      {label: 'given_name', value: 'given_name value'},
      {label: 'family_name', value: 'family_name value'},
    ],
    contrastBackgroundColor: '#4542F2',
  },
];

const RequestedInformationContainer = styled.View`
  border: 1px solid #5d6990;
  border-radius: 8px;
  background-color: #2c334b;
  width: 100%;
  overflow: hidden;
`;

const SelectCredentialsScreen = () => {
  // memoize filtered and other values
  const {shareInstance} = useContext(ShareContext);
  const {
    context: {credentialRequest},
  } = shareInstance.getSnapshot();
  const ref = useRef<ScrollView>(null);
  if (!credentialRequest) {
    return null;
  }
  const accordionExpanded = useSharedValue(false);
  const chevronRotation = useSharedValue(0);

  const chevronStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`}],
    };
  });

  const onToggleAccordion = () => {
    chevronRotation.value = withTiming(chevronRotation.value === 0 ? 1 : 0, {duration: 200});
    accordionExpanded.value = !accordionExpanded.value;
  };
  const {relyingParty, purpose, credentials, uri} = credentialRequest ?? {};
  const translationPath = 'share_pages.select_credentials';
  const providersWithRequestedData = useMemo(
    () =>
      providers.filter(provider => {
        return credentials.every(data => provider.registeredData.map(({label}) => label).includes(data));
      }),
    [credentials],
  );
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>(providersWithRequestedData[0]);
  const {requested, notRequested} = (selectedProvider?.registeredData ?? []).reduce<{requested: DataPoint[]; notRequested: DataPoint[]}>(
    (acc, data) => {
      if (credentials.includes(data.label)) {
        acc.requested?.push(data);
      } else {
        acc.notRequested?.push(data);
      }
      return acc;
    },
    {requested: [], notRequested: []},
  );
  const footer = (
    <>
      <View style={{flex: 1}}>
        <SecondaryButton
          style={{height: 42}}
          caption={translate('action_decline_label')}
          captionColor={fontColors.secondaryButton}
          onPress={() => shareInstance.send(ShareMachineEvents.PREVIOUS)}
        />
      </View>
      <View style={{flex: 1}}>
        <PrimaryButton
          style={{height: 42}}
          caption={translate('action_share_label')}
          captionColor={fontColors.light}
          onPress={() => {
            shareInstance.send(ShareMachineEvents.SET_CREDENTIALS_TO_SHARE, {data: requested});
            shareInstance.send(ShareMachineEvents.NEXT);
          }}
        />
      </View>
    </>
  );
  return (
    <ScreenContainer
      footer={footer}
      footerStyle={{flexDirection: 'row', gap: 8}}
      style={{paddingHorizontal: 0}}
      containerStyle={{paddingBottom: 24}}
      scrollViewPropsWithRef={ref => ({
        onContentSizeChange: () => ref.current?.scrollToEnd({animated: false}),
      })}>
      <View style={{paddingHorizontal: 16}}>
        <ScreenTitleAndDescription
          title={translate(`${translationPath}.title`)}
          description={`${relyingParty} ${translate(`${translationPath}.description`)}`}
        />
        <ProviderContainer style={{marginBottom: 0}}>
          <ProviderDescription>
            <SSITextH3LightStyled>Purpose</SSITextH3LightStyled>
            <SSITextH4LightStyled>{purpose}</SSITextH4LightStyled>
          </ProviderDescription>
        </ProviderContainer>
        <ProviderContainer>
          <ProviderImage source={require('../../assets/images/PlaceholderLogo.png')} width={40} height={40} resizeMode="stretch" />
          <ProviderDescription>
            <SSITextH3LightStyled>{relyingParty}</SSITextH3LightStyled>
            <SSITextH4LightStyled>Issuer and/or verifier</SSITextH4LightStyled>
            {uri && <ProviderUrl>{uri}</ProviderUrl>}
          </ProviderDescription>
        </ProviderContainer>
        <SSITextH2SemiBoldLightStyled>Following information will be shared</SSITextH2SemiBoldLightStyled>
      </View>
      <View style={{backgroundColor: backgroundColors.secondaryDark, padding: 24}}>
        <ScrollView
          ref={ref}
          horizontal
          contentContainerStyle={{
            columnGap: 12,
            padding: 8,
            marginBottom: 16,
          }}>
          {providersWithRequestedData.map((provider, i) => {
            const isSelected = selectedProvider?.name === provider.name;
            return (
              <TouchableOpacity
                key={provider.name}
                onPress={() => {
                  ref.current?.scrollTo({x: i * 75, animated: true});
                  setSelectedProvider(provider);
                }}>
                <View
                  style={{
                    width: 75,
                    height: 50,
                    position: 'relative',
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: provider.contrastBackgroundColor ?? 'white',
                  }}
                  key={provider.name}>
                  {isSelected && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        width: 83,
                        height: 58,
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: '#0B81FF',
                        borderRadius: 6,
                      }}
                    />
                  )}
                  <Image style={{width: 32, height: 32}} source={provider.image} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity onPress={onToggleAccordion} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
          <SSITextH3LightStyled>{selectedProvider?.name}</SSITextH3LightStyled>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            <SSITextH5Styled style={{color: '#0B81FF'}}>{/* Not sure where this "1" refers to */}1 selected</SSITextH5Styled>
            <Animated.View style={[chevronStyles, {marginTop: 1}]}>
              <ChevronIcon size={16} color={backgroundColors.primaryLight} />
            </Animated.View>
          </View>
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <RequestedInformationContainer>
            {credentials.map(credential => (
              <Item item={credential} key={credential} />
            ))}
            <NotRequestedAccordion open={accordionExpanded} notRequested={notRequested ?? []} />
          </RequestedInformationContainer>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SelectCredentialsScreen;
