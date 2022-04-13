const { createInterface, clearLine, moveCursor } = require("readline"),
    { createConnection } = require("net");

const interface = createInterface(process.stdin, process.stdout),
    socket = createConnection({ host: "127.0.0.1", port: 8080 });


const SERVERPASSWORD = "1234"
const CLIENTKEY = randomString(4)

let curGroup = "none";

function init() {
    process.stdout.write("\x1Bc");
    console.log(Array(process.stdout.rows + 1).join("\n"));
}

function output(content) {
    clearLine(process.stdout);

    //move cursor to the beginning of the line
    moveCursor(process.stdout, -(curGroup.length+5), 0);

    console.log(content);
    interface.prompt(true);
}

function input() {
    return new Promise(resolve => {
        let question = "["+curGroup+"]> ";
        interface.question(question, answer => {
            moveCursor(process.stdout, 0, -1);
            clearLine(process.stdout);
            resolve(answer);
        });
    })
}

async function *inputs() {
    while (true) {
        yield await input();
    }
}

socket.on("data", buffer => {

    let message = JSON.parse(buffer.toString());
    if(message.name == "auth"){
        if(message.success){
            output("~ You are now logged in!");
        } else {
            output("~ Wrong password!");
        }
    } else if(message.name == "message"){
        //receive a dm
        let str =  `[DM] ${message.key}: ${message.message}`;
        output(str);
    }  else if(message.name == "group"){
        //receive a message from a group
        //output(JSON.stringify(message));
        let str = ""
        
        if(message.system){
            str = `[SYSTEM] ${message.message}`;
        } else {
            str = `[${message.group}] ${message.key}: ${message.message}`;
        }
        output(str);
    } else {
        output(JSON.stringify(message));
    }

});

async function main() {
    init();
    output("------ Welcome to the chat!");
    output("@ your key is " + CLIENTKEY);
    output('@ Please login before you can start chatting!');
    for await (let input of inputs()) {

        //here the message controller
        if(input.startsWith("/")){
            if(input == "/login"){
                socket.write(JSON.stringify({
                    name: "auth",
                    password: SERVERPASSWORD,
                    key: CLIENTKEY
                }));
            } else if(input.startsWith('/dm')){
                let [, user, message] = input.split(" ");
                socket.write(JSON.stringify({
                    name: "message",
                    key: user,
                    message: message,
                    uid: creeateUID()
                }));
            } else if(input.startsWith('/group')){
                if(input.startsWith('/group create ')){
                    //need to get a group name, key, public
                    input = input.replace("/group create ", "");
                    let [groupName, groupKey, public] = input.split(" "); 
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),

                        type: "create",
                        infos: {
                            name: groupName,
                            key: groupKey,
                            public: public
                        }
                    }));
                } else if(input.startsWith('/group select ')){
                    // set variable curGroup via group uid
                    input = input.replace("/group select ", "");
                    curGroup = input.split(" ")[0];
                    output(`@ You are now writting in group ${curGroup}`);
                } else if(input.startsWith('/group join ')){
                    input = input.replace("/group join ", "");
                    let [groupUID, groupPassword] = input.split(" ");
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),
                        type: "join",
                        infos: {
                            uid: groupUID,
                            password: groupPassword
                        }
                    }));
                }else if(input.startsWith('/group setpass ')){
                    input = input.replace("/group setpass ", "");
                    let [groupUID, groupPassword] = input.split(" ");
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),
                        type: "set_password",
                        infos: {
                            uid: groupUID,
                            password: groupPassword
                        }
                    }));
                } else if(input.startsWith('/group leave ')){
                    input = input.replace("/group leave ", "");
                    let [groupUID] = input.split(" ");
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),
                        type: "leave",
                        infos: {
                            uid: groupUID
                        }
                    }));
                }else if(input == '/group list'){
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),
                        type: "list",
                    }));
                }else if(input.startsWith('/group userlist ')){
                    input = input.replace("/group userlist ", "");
                    socket.write(JSON.stringify({
                        name: "group",
                        uid: creeateUID(),
                        type: "list_members",
                        infos: {
                            uid: input
                        }
                    }));
                }
            } 
        } else {
            //send message in selected group
            socket.write(JSON.stringify({
                name: "group",
                uid: creeateUID(),
                type: "send",
                infos: {
                    uid: curGroup,
                    message: input
                }
            }));
        }

        
    }
}

function creeateUID(){
    return randomString(12) +"-"+ randomString(4) +"-"+ randomString(4) +"-"+ randomString(13);
}

function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
}

main();