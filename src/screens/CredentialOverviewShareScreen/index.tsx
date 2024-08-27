import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton, SSITextH3LightStyled, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import styled from 'styled-components/native';
import ChevronIcon from '../../components/assets/icons/ChevronIcon';
import ScreenContainer from '../../components/containers/ScreenContainer';

import {SSITextH1LightStyled as Title, SSITextH2SemiBoldLightStyled, SSITextH5Styled} from '../../styles/components';

import {ProviderContainer, ProviderDescription, ProviderImage, ProviderUrl} from '../Onboarding/ImportDataConsentScreen/components/styles';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {SSIContactViewItemLogoContainerStyled as LogoContainer} from '../../styles/components';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';
import {CredentialMapper} from '@sphereon/ssi-types';
import {convertFromPIDPayload} from '../Onboarding/ImportDataConsentScreen/util';
import {generateDigest} from 'src/utils';
import {ImportInformationSummary} from '../Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {translate} from '../../localization/Localization';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW>;

const RequestedInformationContainer = styled.View`
  border: 1px solid #5d6990;
  border-radius: 8px;
  background-color: #2c334b;
  width: 100%;
  overflow: hidden;
`;

const credential = {
  type: ['urn:eu.europa.ec.eudi:pid:1'],
  '@context': [],
  credentialSubject: {
    '12': true,
    '14': true,
    '16': true,
    '18': true,
    '21': true,
    '65': false,
    family_name: 'MUSTERMANN',
    given_name: 'ERIKA',
    birthdate: '1984-01-26',
    age_birth_year: 1984,
    age_in_years: 40,
    birth_family_name: 'GABLER',
    nationalities: ['DE'],
    locality: 'KÖLN',
    country: 'DE',
    postal_code: '51147',
    street_address: 'HEIDESTRASSE 17',
  },
  issuanceDate: '2024-08-27T18:25:30Z',
  expirationDate: '2024-09-10T18:25:30Z',
  issuer: 'https://demo.pid-issuer.bundesdruckerei.de/c',
  cnf: {
    jwk: {
      kty: 'EC',
      crv: 'P-256',
      kid: 'I3gDf1UG1XRQgOLNddgtnOKs17zezTGGtXZIFbMn8_g',
      x: 'zhNbnaZf2T82puQsg139N25n5XaMuARv2cvQdQXWPC8',
      y: 'kU9o_hgZnb3eLyx9ObNBxw5mw28dFw49DjcI8aqKVm0',
      alg: 'ES256',
    },
  },
  proof: {
    type: 'SdJwtProof2024',
    created: '2024-08-27T18:25:30Z',
    proofPurpose: 'authentication',
    verificationMethod: 'https://demo.pid-issuer.bundesdruckerei.de/c',
    jwt: 'eyJ4NWMiOlsiTUlJQ2REQ0NBaHVnQXdJQkFnSUJBakFLQmdncWhrak9QUVFEQWpDQmlERUxNQWtHQTFVRUJoTUNSRVV4RHpBTkJnTlZCQWNNQmtKbGNteHBiakVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneEVUQVBCZ05WQkFzTUNGUWdRMU1nU1VSRk1UWXdOQVlEVlFRRERDMVRVRkpKVGtRZ1JuVnVhMlVnUlZWRVNTQlhZV3hzWlhRZ1VISnZkRzkwZVhCbElFbHpjM1ZwYm1jZ1EwRXdIaGNOTWpRd05UTXhNRGd4TXpFM1doY05NalV3TnpBMU1EZ3hNekUzV2pCc01Rc3dDUVlEVlFRR0V3SkVSVEVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneENqQUlCZ05WQkFzTUFVa3hNakF3QmdOVkJBTU1LVk5RVWtsT1JDQkdkVzVyWlNCRlZVUkpJRmRoYkd4bGRDQlFjbTkwYjNSNWNHVWdTWE56ZFdWeU1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRU9GQnE0WU1LZzR3NWZUaWZzeXR3QnVKZi83RTdWaFJQWGlObTUyUzNxMUVUSWdCZFh5REsza1Z4R3hnZUhQaXZMUDN1dU12UzZpREVjN3FNeG12ZHVLT0JrRENCalRBZEJnTlZIUTRFRmdRVWlQaENrTEVyRFhQTFcyL0owV1ZlZ2h5dyttSXdEQVlEVlIwVEFRSC9CQUl3QURBT0JnTlZIUThCQWY4RUJBTUNCNEF3TFFZRFZSMFJCQ1l3SklJaVpHVnRieTV3YVdRdGFYTnpkV1Z5TG1KMWJtUmxjMlJ5ZFdOclpYSmxhUzVrWlRBZkJnTlZIU01FR0RBV2dCVFVWaGpBaVRqb0RsaUVHTWwyWXIrcnU4V1F2akFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUFiZjVUemtjUXpoZldvSW95aTFWTjdkOEk5QnNGS20xTVdsdVJwaDJieUdRSWdLWWtkck5mMnhYUGpWU2JqVy9VLzVTNXZBRUM1WHhjT2FudXNPQnJvQmJVPSIsIk1JSUNlVENDQWlDZ0F3SUJBZ0lVQjVFOVFWWnRtVVljRHRDaktCL0gzVlF2NzJnd0NnWUlLb1pJemowRUF3SXdnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUI0WERUSTBNRFV6TVRBMk5EZ3dPVm9YRFRNME1EVXlPVEEyTkRnd09Wb3dnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFWUd6ZHdGRG5jNytLbjVpYkF2Q09NOGtlNzdWUXhxZk1jd1pMOElhSUErV0NST2NDZm1ZL2dpSDkycU1ydTVwL2t5T2l2RTBSQy9JYmRNT052RG9VeWFObU1HUXdIUVlEVlIwT0JCWUVGTlJXR01DSk9PZ09XSVFZeVhaaXY2dTd4WkMrTUI4R0ExVWRJd1FZTUJhQUZOUldHTUNKT09nT1dJUVl5WFppdjZ1N3haQytNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUF3RGdZRFZSMFBBUUgvQkFRREFnR0dNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJR0VtN3drWktIdC9hdGI0TWRGblhXNnlybndNVVQydTEzNmdkdGwxMFk2aEFpQnVURnF2Vll0aDFyYnh6Q1AweFdaSG1RSzlrVnl4bjhHUGZYMjdFSXp6c3c9PSJdLCJraWQiOiJNSUdVTUlHT3BJR0xNSUdJTVFzd0NRWURWUVFHRXdKRVJURVBNQTBHQTFVRUJ3d0dRbVZ5YkdsdU1SMHdHd1lEVlFRS0RCUkNkVzVrWlhOa2NuVmphMlZ5WldrZ1IyMWlTREVSTUE4R0ExVUVDd3dJVkNCRFV5QkpSRVV4TmpBMEJnTlZCQU1NTFZOUVVrbE9SQ0JHZFc1clpTQkZWVVJKSUZkaGJHeGxkQ0JRY205MGIzUjVjR1VnU1hOemRXbHVaeUJEUVFJQkFnPT0iLCJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJwbGFjZV9vZl9iaXJ0aCI6eyJfc2QiOlsiOEtpZTVqOG9LZklaV0ItNm1BQ0VmcUluU01qcFRRT2VVOTA3ci1zZUtpMCJdfSwiX3NkIjpbIjN2VGlVbExtWDZJb0RlbVJtSmJiX1gxdEx2MjlGVEhkQWExVXB5amgzTEUiLCJKZUhVWjQxZUtZVkVkU1o0Q2pyQXREUDR2UkhnYU9XNHFkRVI3WGRzNmw0IiwiUTVsUHJsZGJ2aElfRTQ5SWNtQVYwalJreUVpUDdZTTl6VXROMURRUld2QSIsIlZmaXVJaWp2WldJUEVuajdNWTFVVXB1YmgzelJmQUtIbmxLRlp4VEVDQjQiLCJsenNhckcxV0o0ajdFT2UxR0lxcndWQVFtR1pfWmhYbFgwQXBoVlUtTHFjIiwidERTTzBvNmdnMWlfWGJ4Q2dWaUtUOE9lWUpUZVp2eE1YUnZRLVFqc3pGSSIsInRjclR4VVVwXzk3eVlxc0VTY0xCYUJnc2MxQVBYUmI5U1I1bm5HLUxBeG8iXSwiYWRkcmVzcyI6eyJfc2QiOlsiX2ZEbTFlVjhZMjAyWXlmYUZXWWxMVmczZ0hCVF9FblNtdkZ2Wl91a2t4SSIsIm12VHhBYlBCQlhtRkFzOHVaY3l0UzhpYzRMU2ZfaHpOTGZCR3pRbWMybjAiLCJybFM2aFRFek1oQzh6eHA5NWg5ZnNoTllWTGJRWEU1ejFkQTJSMWJwUUZFIiwicnlJTWVrT2tBUVJUdnBpYlZ4eV9OZnZjNVBjcmVuYXRlM2xfNm9ON19TMCJdfSwiaXNzdWluZ19jb3VudHJ5IjoiREUiLCJ2Y3QiOiJ1cm46ZXUuZXVyb3BhLmVjLmV1ZGk6cGlkOjEiLCJpc3N1aW5nX2F1dGhvcml0eSI6IkRFIiwiX3NkX2FsZyI6InNoYS0yNTYiLCJpc3MiOiJodHRwczovL2RlbW8ucGlkLWlzc3Vlci5idW5kZXNkcnVja2VyZWkuZGUvYyIsImNuZiI6eyJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsImtpZCI6IkkzZ0RmMVVHMVhSUWdPTE5kZGd0bk9LczE3emV6VEdHdFhaSUZiTW44X2ciLCJ4IjoiemhOYm5hWmYyVDgycHVRc2cxMzlOMjVuNVhhTXVBUnYyY3ZRZFFYV1BDOCIsInkiOiJrVTlvX2hnWm5iM2VMeXg5T2JOQnh3NW13MjhkRnc0OURqY0k4YXFLVm0wIiwiYWxnIjoiRVMyNTYifX0sImV4cCI6MTcyNTk5MjczMCwiaWF0IjoxNzI0NzgzMTMwLCJhZ2VfZXF1YWxfb3Jfb3ZlciI6eyJfc2QiOlsiRXpROG44OEFpdG8wT1U2QjVlMVRHcjZTX0k2OE9pRWpuM1RJVk9GRmJDQSIsIlF4QWNiSG52ZmlTTXV4Zlp2SjNLbllmVkt6RjlwOTBhYWttdDJoOWozMmciLCJnVnk3cjNLajVKMDkzUWtDaXZFb3hxS2tkME5vYlNnVk00cnJKNDdtZzgwIiwiakh4Tlo3bGdwWUIwbzRQWkNtSFA4N29DYkR1bS0xRVdrXzhhcUQyMGc0NCIsIm9kSWhwMXFUeXNfcF9TcUY0N2Z4dDFZZHNoSUNadnRwd2M4U0hYRVhQcWsiLCJ2blVuRjlXRjdBZmdRWEtpNzlCNG1LcWRkbG5QcXY0ai1IcUhFVGx3QXlFIl19fQ.DllJzygYKmDgBrVWxdOqoC8mYg3ZiSYNKusB_jOlpKlktaBACM5EaX_QOp-X_qL1L6s-hqRsWDspqaY_aEQQpA~WyI3ZFlZS09VX0Vmd05IZEVEU3NIN2ZRIiwiZmFtaWx5X25hbWUiLCJNVVNURVJNQU5OIl0~WyJ4ZFVGWkFZSXlyZDd2X3N3RWFXVGl3IiwiZ2l2ZW5fbmFtZSIsIkVSSUtBIl0~WyJHZUdIVVN6ZUtYb1dVeFRRdDNKVnRBIiwiYmlydGhkYXRlIiwiMTk4NC0wMS0yNiJd~WyJqbDR5Tjd3RjVnWjM1NHd5OW4xWG9RIiwiYWdlX2JpcnRoX3llYXIiLDE5ODRd~WyJNeElGdjNZVUhyVU9zNVlFd1VYR213IiwiYWdlX2luX3llYXJzIiw0MF0~WyJiWks3Q3MwZWlwNGVtd3lUX0lmSkRnIiwiYmlydGhfZmFtaWx5X25hbWUiLCJHQUJMRVIiXQ~WyJvUmlIX3g4TTU1X2czd0xhLWlOX25RIiwibmF0aW9uYWxpdGllcyIsWyJERSJdXQ~WyJMcFAtcHZBVC1SbkRMZ1B2UFhnbGpnIiwiMTIiLHRydWVd~WyJjV0RaWGM1a0hRRVlURDl2US1mN0NRIiwiMTQiLHRydWVd~WyJIUndRYTZ4aE8xRVhYNUpIeHFXUExnIiwiMTYiLHRydWVd~WyI0ZVd1Rk5heWNZMnlwTDA2QUVEbVpRIiwiMTgiLHRydWVd~WyJSY3hwcUlldFR5RUFQUW9fa1ROajVRIiwiMjEiLHRydWVd~WyJreWliTE5vNkRuNUYxYkpYMnZHUWpBIiwiNjUiLGZhbHNlXQ~WyJhMi1RRGk4czdIZGJtUTY2TmJHYjBRIiwibG9jYWxpdHkiLCJCRVJMSU4iXQ~WyJ2aExMT2ZhN3lyX1pQWW5tdEx3dFFRIiwibG9jYWxpdHkiLCJLw5ZMTiJd~WyJoUUpSakJORDZVdHpCUGRWc2JJd1RRIiwiY291bnRyeSIsIkRFIl0~WyI0RWZmVXRUS0FUbXpIV256M0lTa1RnIiwicG9zdGFsX2NvZGUiLCI1MTE0NyJd~WyJiRFl4VU9SUTU0MjEya2Q0UEhabnN3Iiwic3RyZWV0X2FkZHJlc3MiLCJIRUlERVNUUkFTU0UgMTciXQ~',
  },
};

const presentationDefinition = {
  id: '56e001a9-c41f-49c5-9b12-440ad4861f58',
  name: 'DIIP v3 compliance',
  purpose: "Prove you're compliant with DIIP v3",
  input_descriptors: [
    {
      id: 'b2a1f1d3-37ee-4494-98e2-ef9853b28197',
      name: 'DIIP v3 compliance',
      purpose: "Prove you're compliant with DIIP v3",
      format: {
        'vc+sd-jwt': {},
      },
      constraints: {
        limit_disclosure: 'preferred',
        fields: [
          {
            path: ['$.compliant'],
            name: 'compliant',
            filter: {
              type: 'boolean',
              const: true,
            },
          },
          {
            path: ['$.name'],
            name: 'name',
            filter: {
              type: 'string',
              const: 'name',
            },
          },
          {
            path: ['$.age'],
            name: 'age',
            filter: {
              type: 'number',
              const: 12,
            },
          },
        ],
      },
    },
  ],
};

const verifier = {
  contact: {
    displayName: 'Bundesdruckerei',
  },
  branding: {
    logo: {
      uri: 'https://picsum.photos/200/300',
    },
  },
};

// const uniformCredential = CredentialMapper.toUniformCredential(credential);

const SelectOverviewShareScreen = (props: Props) => {
  // memoize filtered and other values
  // const {credential, verifierName, presentationDefinition, onSend, onDecline} = props.route.params;
  const {onSend, onDecline} = props.route.params;

  const uniformCredential = useMemo(
    () =>
      CredentialMapper.toUniformCredential(credential, {
        hasher: generateDigest,
      }),
    [credential],
  );
  console.log(JSON.stringify(uniformCredential, null, 2));

  const data = useMemo(() => convertFromPIDPayload(uniformCredential.credentialSubject), [uniformCredential]);

  const ref = useRef<ScrollView>(null);
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
  const translationPath = 'share_pages.select_credentials';

  const footer = (
    <>
      <View style={{flex: 1}}>
        <SecondaryButton
          style={{height: 42}}
          caption={translate('action_decline_label')}
          captionColor={fontColors.secondaryButton}
          onPress={() => onSend(credential)}
        />
      </View>
      <View style={{flex: 1}}>
        <PrimaryButton style={{height: 42}} caption={translate('action_share_label')} captionColor={fontColors.light} onPress={() => onDecline()} />
      </View>
    </>
  );
  return (
    <ScreenContainer footer={footer} footerStyle={{flexDirection: 'row', gap: 8}} style={{paddingHorizontal: 0}}>
      <View style={{paddingHorizontal: 16}}>
        <ProviderContainer style={{marginBottom: 0}}>
          <ProviderDescription>
            <SSITextH3LightStyled>Purpose</SSITextH3LightStyled>
            <SSITextH4LightStyled>{presentationDefinition.purpose}</SSITextH4LightStyled>
          </ProviderDescription>
        </ProviderContainer>
        <ProviderContainer>
          <LogoContainer>
            <Logo logo={verifier.branding?.logo} />
          </LogoContainer>
          <ProviderDescription>
            <SSITextH3LightStyled>{verifier.contact.displayName}</SSITextH3LightStyled>
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
          <TouchableOpacity key={verifier.contact.displayName}>
            <View
              style={{
                width: 75,
                height: 50,
                position: 'relative',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                //fixme: add verifier branding to the object that we're passing
                backgroundColor: /*verifierName.contrastBackgroundColor ?? */ 'white',
              }}
              key={verifier.contact.displayName}>
              <LogoContainer>
                <Logo logo={verifier.branding?.logo} />
              </LogoContainer>
              <Title>{verifier.contact.displayName}</Title>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity onPress={onToggleAccordion} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
          <SSITextH3LightStyled>{verifier.contact.displayName}</SSITextH3LightStyled>
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            <SSITextH5Styled style={{color: '#0B81FF'}}>{/* Not sure where this "1" refers to */}1 selected</SSITextH5Styled>
            <Animated.View style={[chevronStyles, {marginTop: 1}]}>
              <ChevronIcon size={16} color={backgroundColors.primaryLight} />
            </Animated.View>
          </View>
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <ImportInformationSummary data={data} />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SelectOverviewShareScreen;
