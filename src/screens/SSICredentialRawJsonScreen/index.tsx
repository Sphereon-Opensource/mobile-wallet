import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import React, {FC} from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import JSONTree from 'react-native-json-tree';
import Share from 'react-native-share';

import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIBasicHorizontalCenterContainerStyled,
  SSIButtonBottomContainerStyled,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_RAW_JSON>;

// The screen is WIP and created for the plugfest demo

const SSICredentialRawJsonScreen: FC<Props> = (props: Props): JSX.Element => {
  const {route} = props;

  const theme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#202537',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633',
  };

  const rawCredential = route.params.rawCredential;

  return (
    <Container>
      <ScrollView>
        <JSONTree theme={theme} data={rawCredential} invertTheme={false} />
      </ScrollView>
      <View style={{backgroundColor: '#202537', height: 100, marginTop: 'auto', marginRight: 38, marginLeft: 38}}>
        <SSIBasicHorizontalCenterContainerStyled>
          <SSIButtonBottomContainerStyled>
            <PrimaryButton
              caption={'Share'} // TODO translation
              onPress={async () => {
                const base64VC = Buffer.from(JSON.stringify(rawCredential, null, 2), 'binary').toString('base64');
                const base64Data = `data:application/json;base64,${base64VC}`;
                await Share.open({url: base64Data}).catch(error => console.log(error));
                console.log(`VC:\r\n${JSON.stringify(CredentialMapper.toUniformCredential(rawCredential as OriginalVerifiableCredential), null, 2)}`);
              }}
              // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
              style={{flex: 1, height: 42}}
            />
          </SSIButtonBottomContainerStyled>
        </SSIBasicHorizontalCenterContainerStyled>
      </View>
    </Container>
  );
};

export default SSICredentialRawJsonScreen;
