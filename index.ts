import { promiseHooks } from "v8";
import { holder } from "./holder"
import { issuer } from "./issuer"
import { CREDENTIALS_CONTEXT_V1_URL, KeyType } from "@credo-ts/core"
import { resolve } from "path";

const app = async () => {
    // init issuer agent & wallet
    await issuer.initialize()
    // int holder agent & wallet
    await holder.initialize()

    //create issuer DID
    const issuerDIDResult = await issuer.dids.create({
        method: 'key',
        options:{
            keyType: KeyType.Ed25519
        }
    })
    const issuerDID = issuerDIDResult.didState.did
    console.log('Issuer DID=', issuerDID)

    //create holder DID
    const holderDIDResult = await holder.dids.create({
        method: 'key',
        options:{
            keyType: KeyType.Ed25519
        }
    })
    const holderDID = holderDIDResult.didState.did
    console.log('Holder DID=',holderDID)

    // create offer
    const credentialOffer = await issuer.modules.credentials.createOffer({
        credentialFormats:{
            jsonld: {
                credential: {
                    "@context": [
					CREDENTIALS_CONTEXT_V1_URL,
						"https://www.w3.org/2018/credentials/examples/v1",
					],
					type: ["VerifiableCredential", "UniversityDegreeCredential"],
					issuer: issuerDID ?? '',
					issuanceDate: new Date().toISOString(),
					credentialSubject: {
						id: holderDID ?? '',
						degree: {
							type: "BachelorDegree",
							name: "Bachelor of Science and Arts",
                        },
                    },
                },
                options:{
                    proofType: "Ed25519Signature2018",
                    proofPurpose: "assertionMethod"
                },         
            },
        },
        protocolVersion :"v2",
    
    }as any); //by passed as the code was not working//problem in....protocolVersion

    //create invitation by issuer
    const invitation = await issuer.modules.oob.createInvitation({
        messages: [credentialOffer.message]
    })
    const {connectionRecord} = await holder.modules.oob.receiveInvitation(invitation.outOfBandInvitation)
    if(connectionRecord ===undefined){
        throw new Error("connection not found...")
    }

   
    await holder.modules.connections.returnWhenIsConnected(connectionRecord.id)
    await new Promise((resolve) => setTimeout(resolve,5000))

    const updatedRecord = await holder.modules.connections.getAll()
    //console.log ( 'n/n/n/n 2222 connection RECORD', JSON.stringify(updatedRecord, null, 2))

    //creating holder invitation
const credentialRecord = await holder.modules.credentials.getAll()
console.log('/n/n/n/ CRED records =', JSON.stringify(credentialRecord,null,2))
await holder.modules.credentials.acceptOffer({
    credentialRecordId: credentialRecord[0].id
})
await new Promise((resolve) => setTimeout(resolve, 10000))
const updatedCredRecord = await holder.modules.credentials.getAll()
//console.log ('n/n/ UPDATE CRED records =', JSON.stringify(updatedCredRecord,null, 2))

//Send basic messages from holder to issuer 

const holderConnections = await holder.modules.connections.getAll()
await holder.modules.basicMessages.sendMessage(holderConnections[0].id,'hiii')
await new Promise((resolve)=> setTimeout(resolve,2000))
const issuerMessages = await issuer.modules.basicMessages.findAllByQuery({})
console.log('n/n/n/n issuerMessages = /n/n', JSON.stringify(issuerMessages,null, 2))

//send basic message form issuer to holder 
const issuerConnections = await issuer.modules.connections.getAll()
await issuer.modules.basicMessages.sendMessage(issuerConnections[0].id,'HELLO')
await new Promise((resolve)=> setTimeout(resolve,2000))
const holderMessages = await holder.modules.basicMessages.findAllByQuery({})
console. log('n/n/n/ holderMessages = n/n', JSON.stringify(holderMessages,null,2))


};

app();