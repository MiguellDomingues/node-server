const { v4: uuidv4 } = require('uuid');

const sessionKeys = new Map()

const { NO_AUTH_USER_TYPE }  = require('../utils/constants.js');

const getNoAuth = () => {
    return {
        auth:{
            type: NO_AUTH_USER_TYPE
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
    
    sessionKeys.set(client_key, getAuth(key, type) )

    console.log("SESSION: ", sessionKeys.get(client_key))
    return client_key 
}

const endSession = (key) => sessionKeys.delete(key)


const getSession = (key) => key && sessionKeys.has(key) ? sessionKeys.get(key) : getNoAuth()

module.exports = { startSession, getSession, endSession,sessionKeys }



