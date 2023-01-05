const { v4: uuidv4 } = require('uuid');

const sessionKeys = new Map()

const NO_AUTH_NAME  = 'GUEST'

const getNoAuth = () => {
    return {
        auth:{
            type: NO_AUTH_NAME 
}}}

const getAuth = (key, type) => {
    return {
        auth:{
            u_id: key, 
            type: type 
}}}

const startSession = (key, type) => {

    console.log(sessionKeys)

    const client_key = uuidv4()
    //auth_session(key, type) 
   
    sessionKeys.set(client_key, getAuth(key, type) )

    console.log("SESSION: ", sessionKeys.get(client_key))
    return client_key 
}

//const auth = (key) => sessionKeys.has(key)

//const getSession = (key) => auth(key) ? _getSession(key) : no_auth_session

const getSession = (key) => sessionKeys.get(key)

module.exports = { startSession, getSession, getNoAuth  }