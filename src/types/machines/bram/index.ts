import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OID4VCIMachineInterpreter, OID4VCIMachineState} from '../oid4vci';

export type OID4VCIMachineNavigationArgs = {
  oid4vciMachine: OID4VCIMachineInterpreter;
  state: OID4VCIMachineState;
  navigation: NativeStackNavigationProp<any>;
  onNext?: () => void;
  onBack?: () => void;
};
