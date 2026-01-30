import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {IBasicCredentialLocaleBranding, ICredentialBranding} from '@sphereon/ssi-sdk.data-store-types';
import {useEffect, useState} from 'react';
import agent from '../../../agent';
import {Pressable} from 'react-native';
import {SSICredentialMiniCardView} from '@sphereon/ui-components.ssi-react-native';
import {selectAppLocaleBranding} from '@sphereon/ui-components.credential-branding';

type PressableCredentialMiniCardProps = {
  onPress: () => void;
  credential: UniqueDigitalCredential;
  selected?: boolean;
};

export const PressableCredentialMiniCard = (props: PressableCredentialMiniCardProps) => {
  const {onPress, credential, selected} = props;
  const [localeBranding, setLocaleBranding] = useState<IBasicCredentialLocaleBranding | undefined>();

  const loadCredentialBranding = async () => {
    const vcHashes = [credential].map(credential => ({vcHash: credential.hash}));
    const brandings = await agent.ibGetCredentialBranding({filter: vcHashes});
    const foundBranding = brandings.find(b => b.vcHash === credential.hash);
    const selected = await selectAppLocaleBranding({localeBranding: foundBranding?.localeBranding});
    setLocaleBranding(selected as IBasicCredentialLocaleBranding | undefined);
  };

  useEffect(() => {
    loadCredentialBranding();
  }, [credential]);

  return (
    <Pressable
      key={credential.hash}
      onPress={onPress}
      style={{
        borderColor: '#0B81FF',
        borderRadius: 6,
        padding: 2,
        borderWidth: selected ? 1 : 0,
        backgroundColor: selected ? '#0B81FF33' : 'transparent',
        zIndex: 1,
      }}>
      <SSICredentialMiniCardView
        backgroundColor={localeBranding?.background?.color}
        backgroundImage={localeBranding?.background?.image}
        logo={localeBranding?.logo}
        logoColor={localeBranding?.text?.color}
      />
    </Pressable>
  );
};
