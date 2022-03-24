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
    "password": "value"
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

## Send message to group
todo


## Service
A ***Service*** is like a chat group
### Create
todo
### Delete
todo
### Join
todo
### Perms
todo