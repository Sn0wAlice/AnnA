# AnnA
My private secure retro chat

<img src="./assets/logo.jpg">
🌱Artwork by Rui Li:

- https://www.artstation.com/melodyoflost
- https://www.instagram.com/go_6e/
- https://www.patreon.com/user?u=9551364


# API
## Server auth
1. connect to the websocket
2. send the server auth password
```json
{
    "name": "auth",
    "serverPassword": "value",

    "username": "${username}",
    "password": "${password}"
}
```

## Server Register
1. connect to the websocket
2. send the server auth password
```json
{
    "name": "register",
    "serverPassword": "value",

    "username": "${username}",
    "password": "${password}"
}
```

> note if the server respond `success:false` the password is incorect !


## Send private message
- user need to be auth
- need to have the public key of the dest

1. send the websocket object: 
```json
{
    "name": "message",
    "message": "${message content}",
    "key": "${user public auth}",
    "uid": "${uid for cache and content backuping}"
}
```


## Group

### Create
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",

    "type": "create",
    "infos": {
        "name": "${group name}",
        "public?": false,
        "key": "${private key}"
    }
}
```
### Delete
todo
### Join
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",

    "type": "join",
    "infos": {
        "uid": "${group uid}",
        "password?": "${password for private group}"
    }
}
```

### Set password
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",

    "type": "set_password",
    "infos": {
        "uid": "${group uid}",
        "password": "${new password}"
    }
}
```

### Leave
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",

    "type": "leave",
    "infos": {
        "uid": "${group uid}"
    }
}
```

### List
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",
    "type": "list",
}
```

### List user
- user need to be auth

1. send the websocket object: 
```json
{
    "name": "group",
    "uid": "${uid for cache and content backuping}",
    "type": "list_members",
    "infos": {
        "uid": "${group uid}"
    }
}
```

### Perms
todo