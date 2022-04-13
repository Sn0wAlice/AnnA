// Deno socket server
/*

$CLIENT_TOKEN = "";
when client connects, send $CLIENT_TOKEN and all the services that he listens to

Each server: 
| Service Name | Service UUID | Service listenner | Service public key |

1. the client send the auth request to the server  -> private auth key (like a password)
2. the server ask to the client what he wants to listen to -> and check if the client have de auth key
3. the server keep a list off connected user by server
4. send all the data to other client
*/

import {
    Server, Packet, Event, Client
} from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

import { Message } from "./message/main.ts";
import { group } from "./message/group.ts";

const ins_message = new Message();
const ins_group = new group();

const server = new Server({
    port: 8080
});

const PASSWORD = "1234"


// Server listen
server.on(Event.listen, (server: Deno.Listener) => {
    let addr = server.addr as Deno.NetAddr;
    console.log(`Server listen ${addr.hostname}:${addr.port}`);
});

// Client connect
server.on(Event.connect, (client: Client) => {
    console.log("New Client -", client.info());
    client.auth = false
});

// Receive packet
server.on(Event.receive, (client: Client, data: Packet, length: number) => {
    console.log("Receive -", data.toString());

    let body = JSON.parse(data.toString())

    if(client.auth){
        //the auth user can do 3 things
        //1. send a message to another client
        //2. send a message to a service
        //3. manage a service
        if(!body.uid){
            body.uid = "none"
        }

        if(body.name == "message"){
            ins_message.send(server.clients, body, client)
        } else if(body.name == "group"){
            ins_group.main(body, client, server.clients)
        } else if(body.name == "service"){
            //manage a service
        }

    } else {
        // force the client to authenticate
        if(body.name == "auth"){
            //check the password
            if(body.password == PASSWORD){
                client.auth = true
                //create a client token xxxxxx-xxxxxx-xxxxxx-xxxxxx
                client.token = "xxxxxxxx-xxxxxx-xxxxxx-xxxxxx"
                client.key = body.key
                client.write(JSON.stringify({
                    name: "auth",
                    success: true
                }))
                console.log("Client authenticated: "+client.token)
            }
        } else {
            client.write(JSON.stringify({
                name: "auth",
                success: false
            }))
        }
    }


});

// Client close
server.on(Event.close, (client: Client) => {
    console.log("Client close -", client.info());
});

// Server finish
server.on(Event.shutdown, () => {
    console.log("Server is shutdown");
});

// Handle error
server.on(Event.error, (e) => {
    console.error(e);
});

// Do
await server.listen(); // Start listen