const { v4: uuidv4 } = require('uuid');

const sessionKeys = new Map()

const startSession = (key, type) => {

    console.log(sessionKeys)

    const client_key = uuidv4()
    sessionKeys.set(client_key , {u_id: key, type: type } )
    console.log("SESSION: ", sessionKeys.get(client_key))
    return client_key 
} 

const getSession = (key) => sessionKeys.has(key) ? sessionKeys.get(key) : {u_id: '', type: 'GUEST'}

module.exports = { startSession, getSession }