import { AskarModule } from "@credo-ts/askar";
import { Agent, AgentConfig } from "@credo-ts/core";
import { Connection, ConnectionsModule, CredentialsModule, getDefaultDidcommModules, HttpOutboundTransport, JsonLdCredentialFormatService, V2CredentialProtocol } from "@credo-ts/didcomm";
import { agentDependencies, HttpInboundTransport } from "@credo-ts/node";
import { askar } from '@openwallet-foundation/askar-nodejs'

export const issuer = new Agent({
    config:{
        label: 'TTPL',
        walletConfig:{
            id: 'ttpl-wallet',
            key:'ttpl123'
        }
    },
    modules:{
        ...getDefaultDidcommModules({
            endpoints:['http://localhost:9001/didcomm']
        }),
        connections: new ConnectionsModule({
            autoAcceptConnections: true
        }),
        credentials: new CredentialsModule({
            credentialProtocols:[
                new V2CredentialProtocol({
                    credentialFormats: [new JsonLdCredentialFormatService]
                })
            ]
        }),
        askar: new AskarModule({
            askar
        })
 
    },
    dependencies: agentDependencies
})
issuer.modules.didcomm.registerInboundTransport(new HttpInboundTransport({ port:9001, path: '/didcomm'}))
issuer.modules.didcomm.registerInboundTransport(new HttpOutboundTransport())