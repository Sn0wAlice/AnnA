import {
    Packet, Event, Client
} from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

export class Message {
    // class for the private message
   async send(clients: Client[], message:any, sender: Client){
        //get the client with the same key
        let destinatary = clients.find(client => client.key == message.key)
        if(destinatary){
            //send the message to the client
            message.sender = sender.key;
            destinatary.write(JSON.stringify(message))
        } else {
            sender.write(JSON.stringify({
                name: "message",
                success: false,
                uid: message.uid,
            }))
        }
    }
}