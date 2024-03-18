// todo: Move over to SSI-SDK, when SIOP machine is moved over
import {LinkHandlerAdapter} from '@sphereon/ssi-sdk.core';
import {IDidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {IMachineStatePersistence, interpreterStartOrResume} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {IAgentContext} from '@veramo/core';
import Debug from 'debug';
import {SiopV2Machine} from '../../machines/siopV2Machine';
const debug = Debug(`sphereon:ssi-sdk:linkhandler:siop`);
export class SIOPv2OID4VPLinkHandler extends LinkHandlerAdapter {
  private readonly context: IAgentContext<IDidAuthSiopOpAuthenticator & IMachineStatePersistence>;

  constructor(args: {protocols?: Array<string | RegExp>; context: IAgentContext<IDidAuthSiopOpAuthenticator & IMachineStatePersistence>}) {
    super({...args, id: 'SIOPv2'});
    this.context = args.context;
  }

  async handle(url: string | URL): Promise<void> {
    debug(`handling SIOP link: ${url}`);
    const interpreter = SiopV2Machine.newInstance({url});
    interpreter.start();
    const init = await interpreterStartOrResume({
      stateType: 'new',
      interpreter,
      context: this.context,
      cleanupAllOtherInstances: true,
      cleanupOnFinalState: true,
      singletonCheck: true,
    });
    debug(`SIOP machine started for link: ${url}`, init);
  }
}
