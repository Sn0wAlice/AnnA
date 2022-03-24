import { Client, Packet, Event } from "https://deno.land/x/tcp_socket@0.0.1/mods.ts";

const client = new Client({ hostname: "127.0.0.1", port: 8080 });


const SERVERPASSWORD = "1234"
const CLIENTKEY = "1235"

// Connection open
client.on(Event.connect, (client: Client) => {
    console.log("Connect", client.conn?.remoteAddr);
    client.write(JSON.stringify({
        name: "auth",
        password: SERVERPASSWORD,
        key: CLIENTKEY
    }))
});

// Receive message
client.on(Event.receive, (client: Client, data: Packet) => {
    console.log("Receive", data.toString());
    let body = JSON.parse(data.toString())


    //manage the user auth
    if (body.name == "auth") {
        if(body.success){
            console.log('Client authenticated')
        } else {
            console.log('Client authentication failed')
            client.write(JSON.stringify({
                name: "auth",
                password: SERVERPASSWORD
            }))
        }
    }


});

// Connection close
client.on(Event.close, (client: Client) => {
  console.log("Close");
});

// Handle error
client.on(Event.error, (e) => {
  console.error(e);
});

// Do
await client.connect(); // Start client connect

setInterval(() => {
    if(CLIENTKEY == "1234"){
        client.write(JSON.stringify({
            name: "message",
            message: "Hello world",
            key: "1235",
            uid: "xxxxxxxx-xxxxxx-xxxxxx-xxxxxx"
        }))
    }
},3000)

//await client.write("Hello World"); // Send string data
//await client.write(new Uint8Array()); // Send Uint8Array data
//client.close();