import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {ICredentialBranding} from '@sphereon/ssi-sdk.data-store';
import {useEffect, useState} from 'react';
import agent from '../../../agent';
import {Pressable} from 'react-native';
import {SSILogo} from '@sphereon/ui-components.ssi-react-native';
import {PressableCredentialMiniCardInnerContainer as MiniCard} from '../../../styles/components/components/PressableCredentialMiniCard';

type PressableCredentialMiniCardProps = {
  onPress: () => void;
  credential: UniqueDigitalCredential;
  selected?: boolean;
};

export const PressableCredentialMiniCard = (props: PressableCredentialMiniCardProps) => {
  const {onPress, credential, selected} = props;
  const [credentialBranding, setCredentialBranding] = useState<ICredentialBranding | undefined>();

  const loadCredentialBranding = async () => {
    const vcHashes = [credential].map(credential => ({vcHash: credential.hash}));
    const brandings = await agent.ibGetCredentialBranding({filter: vcHashes});
    const foundBranding = brandings.find(b => b.vcHash === credential.hash);
    setCredentialBranding(foundBranding);
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
        borderRadius: 12,
        padding: 2,
        borderWidth: selected ? 1 : 0,
        backgroundColor: selected ? '#0B81FF33' : 'transparent',
        zIndex: 1,
      }}>
      <MiniCard>
        <SSILogo logo={credentialBranding?.localeBranding?.at(0)?.logo} />
      </MiniCard>
    </Pressable>
  );
};
