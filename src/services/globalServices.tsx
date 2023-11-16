import {createContext} from 'react';
import {ActorRefFrom} from 'xstate';
import {createOID4VCIMachine} from '../stateMachines/OID4VCIMachine';

interface GlobalStateContextType {
  OID4VCIMachine: ActorRefFrom<typeof createOID4VCIMachine>;
}

export const GlobalStateContext = createContext({} as GlobalStateContextType);
