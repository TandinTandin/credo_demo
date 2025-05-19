import { AskarModule } from "@credo-ts/askar";
import { Agent, AgentConfig } from "@credo-ts/core";
import { AutoAcceptCredential,Connection, ConnectionsModule, CredentialsModule, getDefaultDidcommModules, HttpOutboundTransport, JsonLdCredentialFormatService, V2CredentialProtocol } from "@credo-ts/didcomm";
import { agentDependencies, HttpInboundTransport } from "@credo-ts/node";
import { askar } from '@openwallet-foundation/askar-nodejs'


export const holder = new Agent({
    config:{
        label: 'Tandin',
        walletConfig:{
            id: '17611992',
            key:'pass123'
        }
    },
    modules:{
        ...getDefaultDidcommModules({
            endpoints:['http://localhost:9000/didcomm']
        }),
        connections: new ConnectionsModule({
            autoAcceptConnections: true
        }),
        credentials: new CredentialsModule({
            autoAcceptCredentials:AutoAcceptCredential.ContentApproved,
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
holder.modules.didcomm.registerInboundTransport(new HttpInboundTransport({ port:9000, path: '/didcomm'}))
holder.modules.didcomm.registerInboundTransport(new HttpOutboundTransport())