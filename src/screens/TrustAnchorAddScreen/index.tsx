import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {
  SSIBasicContainerStyled as Container,
  SSITabViewHeaderContainerStyled as TabRow,
  SSITabViewHeaderTabHeaderStyled as Tab,
  SSITabViewHeaderTabIndicatorStyled as TabIndicator,
} from '../../styles/components';
import SSITextInputField from '../../components/fields/SSITextInputField';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSIInlineQRScanner from '../../components/qrCodes/SSIInlineQRScanner';
import {translate} from '../../localization/Localization';
import {addTrustAnchor} from '../../store/actions/trustAnchor.actions';
import {TrustAnchorSource} from '../../entities/TrustAnchorEntity';

type InputMethod = 'paste' | 'file' | 'qr' | 'url';

const METHODS: Array<{method: InputMethod; labelKey: string}> = [
  {method: 'paste', labelKey: 'trust_anchor_method_paste'},
  {method: 'file', labelKey: 'trust_anchor_method_file'},
  {method: 'qr', labelKey: 'trust_anchor_method_qr'},
  {method: 'url', labelKey: 'trust_anchor_method_url'},
];

const TrustAnchorAddScreen = (): JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const [method, setMethod] = useState<InputMethod>('paste');
  const [label, setLabel] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onPickFile = async (): Promise<void> => {
    const result = await DocumentPicker.getDocumentAsync({type: ['application/x-pem-file', 'application/x-x509-ca-cert', '*/*'], copyToCacheDirectory: true});
    if (result.canceled || !result.assets?.[0]) {
      return;
    }
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    setValue(content);
  };

  const onFetchUrl = async (): Promise<void> => {
    const response = await fetch(value.trim());
    setValue(await response.text());
  };

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const source: TrustAnchorSource = method === 'paste' ? 'paste' : method === 'file' ? 'file' : method === 'qr' ? 'qr' : 'url';
      const isDid = value.trim().startsWith('did:web:');
      await dispatch<any>(
        addTrustAnchor({
          label: label.trim() || translate('trust_anchor_default_label'),
          type: isDid ? 'did:web' : 'x5c',
          value,
          source,
        }),
      );
      navigation.goBack();
    } catch {
      // Toast already shown by the thunk on failure.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 24}} keyboardShouldPersistTaps="handled">
          <View style={{marginBottom: 28}}>
            <SSITextInputField label={translate('trust_anchor_label_field')} initialValue={label} onChangeText={async (t: string) => setLabel(t)} />
          </View>

          <TabRow style={{marginBottom: 28}}>
            {METHODS.map(({method: m, labelKey}) => {
              const selected = method === m;
              return (
                <Tab key={m} accessibilityRole="button" accessibilityState={{selected}} style={{alignItems: 'center'}} onPress={() => setMethod(m)}>
                  <SSITextH5LightStyled style={{opacity: selected ? 1 : 0.5, marginBottom: 6}}>{translate(labelKey)}</SSITextH5LightStyled>
                  {selected ? <TabIndicator /> : null}
                </Tab>
              );
            })}
          </TabRow>

          {method === 'paste' && (
            <SSITextInputField
              label={translate('trust_anchor_paste_field')}
              placeholderValue={'-----BEGIN CERTIFICATE----- … or did:web:…'}
              initialValue={value}
              onChangeText={async (t: string) => setValue(t)}
            />
          )}

          {method === 'file' && (
            <TouchableOpacity onPress={onPickFile} accessibilityRole="button" style={{paddingVertical: 16}}>
              <SSITextH5LightStyled>{translate('trust_anchor_pick_file')}</SSITextH5LightStyled>
              {value ? (
                <SSITextH5LightStyled style={{opacity: 0.6, marginTop: 6}} numberOfLines={1}>
                  {value.slice(0, 64)}…
                </SSITextH5LightStyled>
              ) : null}
            </TouchableOpacity>
          )}

          {method === 'url' && (
            <View>
              <SSITextInputField label={translate('trust_anchor_url_field')} initialValue={value} onChangeText={async (t: string) => setValue(t)} />
              <TouchableOpacity onPress={onFetchUrl} accessibilityRole="button" style={{paddingVertical: 16, marginTop: 4}}>
                <SSITextH5LightStyled>{translate('trust_anchor_fetch_url')}</SSITextH5LightStyled>
              </TouchableOpacity>
            </View>
          )}

          {method === 'qr' && (
            <View style={{paddingVertical: 8}}>
              {value ? <SSITextH5LightStyled>{translate('trust_anchor_qr_scanned')}</SSITextH5LightStyled> : <SSIInlineQRScanner onScan={(data: string) => setValue(data)} />}
            </View>
          )}
        </ScrollView>

        <SSIButtonsContainer
          style={{paddingHorizontal: 24}}
          secondaryButton={{caption: translate('action_cancel_label'), onPress: async () => navigation.goBack()}}
          primaryButton={{caption: translate('action_save_label'), disabled: submitting || value.trim().length === 0, onPress: onSubmit}}
        />
      </SafeAreaView>
    </Container>
  );
};

export default TrustAnchorAddScreen;
