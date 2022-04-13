import {
    Packet, Event, Client
} from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

export class group {
 
    private groupDB = []

    constructor(){
        try{
            this.groupDB = JSON.parse(Deno.readTextFileSync('./db/group.json'))
        } catch(err){}
        setInterval(() => {
            Deno.writeTextFileSync('./db/group.json', JSON.stringify(this.groupDB))
        }, 5000)
    }
 
    public async main(message: JSON, client: Client, clients){
        try{
            let type = message.type
            switch(type){
                case "create":
                    this.create(message, client)
                    break
                case "join":
                    this.join(message, client)
                    break
                case "set_password":
                    this.setPassword(message, client)
                    break
                case "leave":
                    this.leave(message, client)
                    break
                case "list":
                    this.list(message, client)
                    break
                case "list_members":
                    this.list_members(message, client)
                    break
                case "send": 
                    this.send(clients, message, client)
                    break
                default:
                    this.sendError(client, message.uid)
            }
        } catch(err){
            this.sendError(client, message.uid)
        }
    }

    private async sendError(client, uid){
        client.write(JSON.stringify({
            name: "group",
            success: false,
            uid: uid
        }))
    }

    private getGroup(uid:string){
        return this.groupDB.find(group => group.uid == uid)
    }



    private async create(message: JSON, client: Client){
        //a group have: 
        // - name
        // - members
        // - owner
        // - key
        // - private or public
        let groupInfo = {
            name: "",
            owner: "",
            members: [],
            key: "ecila",
            public: true,
            uid: creeateUID(),
            password: ""
        }

        let groupMessageInfo = message.infos
        groupInfo.name = groupMessageInfo.name
        groupInfo.owner = client.key
        groupInfo.members.push(client.key)

        if(groupMessageInfo.public != undefined && groupMessageInfo.public == "false"){
            groupInfo.public = false
            groupInfo.password = "password"
        }

        if(groupMessageInfo.key != undefined){
            groupInfo.key = groupMessageInfo.key
        }


        console.log("Creating group: ", groupInfo)
        client.write(JSON.stringify({
            name: "group",
            success: true,
            uid: message.uid,
            infos: groupInfo,
            message: "Group "+groupInfo.name+" successfully created",
            system: true
        }))

        this.groupDB.push(groupInfo)
    }

    private async join(message:JSON, client:Client){
        // if group is public, just add the client key to members
        // if group is private, check the key and add the client key to members

        let groupInfo = this.getGroup(message.infos.uid)

        if(groupInfo == undefined){
            client.write(JSON.stringify({
                name: "group",
                success: false,
                uid: message.uid,
                message: "Group not found",
                system: true
            }))
        } else {
            if(groupInfo.public){
                //just check user is not already in the group
                if(groupInfo.members.indexOf(client.key) == -1){
                    groupInfo.members.push(client.key)
                    client.write(JSON.stringify({
                        name: "group",
                        success: true,
                        uid: message.uid,
                        message: "You have successfully joined the group",
                        system: true
                    }))
                } else {
                    client.write(JSON.stringify({
                        name: "group",
                        success: false,
                        uid: message.uid,
                        message: "You are already in the group",
                        system: true
                    }))
                }
            } else {
                //same that public but need to check the password
                if(groupInfo.password == message.infos.password){
                    if(groupInfo.members.indexOf(client.key) == -1){
                        groupInfo.members.push(client.key)
                        client.write(JSON.stringify({
                            name: "group",
                            success: true,
                            uid: message.uid,
                            message: "You have successfully joined the group",
                            system: true
                        }))
                    } else {
                        client.write(JSON.stringify({
                            name: "group",
                            success: false,
                            uid: message.uid,
                            message: "You are already in the group",
                            system: true
                        }))
                    }
                } else {
                    client.write(JSON.stringify({
                        name: "group",
                        success: false,
                        uid: message.uid,
                        message: "Wrong password",
                        system: true
                    }))
                }
            }
        }

    }

    private async setPassword(message:JSON, client:Client){
        //check if the client is the owner of the group
        let groupInfo = this.getGroup(message.infos.uid)
        if(groupInfo == undefined){
            client.write(JSON.stringify({
                name: "group",
                success: false,
                uid: message.uid,
                message: "Group not found",
                system: true
            }))
        } else {
            if(groupInfo.owner == client.key){
                groupInfo.password = message.infos.password
                client.write(JSON.stringify({
                    name: "group",
                    success: true,
                    uid: message.uid,
                    message: "Password successfully set",
                    system: true
                }))
            } else {
                client.write(JSON.stringify({
                    name: "group",
                    success: false,
                    uid: message.uid,
                    message: "You are not the owner of the group",
                    system: true
                }))
            }
        }
    }

    private async leave(message:JSON, client:Client){
        //check if the client is the owner of the group
        let groupInfo = this.getGroup(message.infos.uid)
        if(groupInfo == undefined){
            client.write(JSON.stringify({
                name: "group",
                success: false,
                uid: message.uid,
                message: "Group not found",
                system: true
            }))
        } else {
            if(groupInfo.owner == client.key){
                client.write(JSON.stringify({
                    name: "group",
                    success: false,
                    uid: message.uid,
                    message: "You are the owner of the group, you can't leave it",
                    system: true
                }))
            } else {
                if(groupInfo.members.indexOf(client.key) != -1){
                    groupInfo.members.splice(groupInfo.members.indexOf(client.key), 1)
                    client.write(JSON.stringify({
                        name: "group",
                        success: true,
                        uid: message.uid,
                        message: "You have successfully left the group",
                        system: true
                    }))
                } else {
                    client.write(JSON.stringify({
                        name: "group",
                        success: false,
                        uid: message.uid,
                        message: "You are not in the group",
                        system: true
                    }))
                }
            }
        }
    }

    private async list(message, client:Client){
        //return le name:uid server list of the client
        let clientGroup = this.groupDB.filter(group => group.members.indexOf(client.key) != -1)

        //only keep the name & uid
        let clientGroupInfos = clientGroup.map(group => {
            return {
                name: group.name,
                uid: group.uid
            }
        })

        client.write(JSON.stringify({
            name: "group",
            success: true,
            uid: message.uid,
            message: "Group list: "+JSON.stringify(clientGroupInfos),
            system: true
        }))
    }


    private async list_members(message, client:Client){
        //check group exist
        //check user is in the group
        let groupInfo = this.getGroup(message.infos.uid)
        if(groupInfo == undefined){
            client.write(JSON.stringify({
                name: "group",
                success: false,
                uid: message.uid,
                message: "Group not found",
                system: true
            }))
        } else {
            if(groupInfo.members.indexOf(client.key) == -1){
                client.write(JSON.stringify({
                    name: "group",
                    success: false,
                    uid: message.uid,
                    message: "You are not in the group",
                    system: true
                }))
            } else {
                //only keep the name & uid
                client.write(JSON.stringify({
                    name: "group",
                    success: true,
                    uid: message.uid,
                    message: "Group members: "+JSON.stringify(groupInfo.members),
                    system: true
                }))
            }
        }
    }

    private async send(listClient: Client[], message, client:Client){
        //check group exist
        //check user is in the group
        let groupInfo = this.getGroup(message.infos.uid)
        if(groupInfo == undefined){
            client.write(JSON.stringify({
                name: "group",
                success: false,
                uid: message.uid,
                message: "Group not found",
                system: true
            }))
        } else {
            if(groupInfo.members.indexOf(client.key) == -1){
                client.write(JSON.stringify({
                    name: "group",
                    success: false,
                    uid: message.uid,
                    message: "You are not in the group",
                    system: true
                }))
            } else {
                //send the message to all the group members
                listClient.forEach(client_send => {
                    if(groupInfo.members.indexOf(client_send.key) != -1 && client_send.key != client.key){
                        client_send.write(JSON.stringify({
                            name: "group",
                            success: true,
                            group: message.infos.uid,
                            uid: message.uid,
                            message: message.infos.message,
                            key: client.key,
                        }))
                    }
                })
            }
        }
    }

}


function creeateUID(){
    return randomString(6);
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