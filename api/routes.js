const guest                       = require('./guest/guest.js')
const auth                        = require('./auth/auth.js')
const user                        = require('./user/user.js')
const storeowner                  = require('./storeowner/storeowner.js')
const config                      = require('./config/config.js')


const JSON = {

    configs:{

        GET:{
            STOREOWNER: config.fetchConfigs,
            USER:       config.fetchConfigs,
            GUEST:      config.fetchConfigs
        },   
    },
    locations:{

        GET:{
            STOREOWNER: storeowner.fetchLocations,
            USER:       user.fetchLocations,
            GUEST:      guest.fetchLocations
        },
        POST: { STOREOWNER: storeowner.addLocation },
        PATCH: { STOREOWNER: storeowner.editLocation },
        DELETE: { STOREOWNER: storeowner.deleteLocation}
        
    },

    auth:{
        
        POST: { GUEST: auth.validateLogin }
        
    },

    register:{
        
        POST: { GUEST: auth.registerNewUser }
        
    },

    appointment:{
        
        POST: { USER: user.addAppointment },
        PATCH: { STOREOWNER: storeowner.updateAppointmentStatus },
        DELETE: { USER: user.cancelAppointment}
        
    },

}

const testJSON = {
    availability:{
        
        GET: { STOREOWNER: ()=>{console.log()} },
        POST: { STOREOWNER: ()=>{console.log()} },
        
        
        workingplan: {
            GET: { STOREOWNER: ()=>{console.log()} },
            PATCH:  { STOREOWNER: ()=>{console.log()} },
        },

        breaks: {
            GET: { STOREOWNER: ()=>{console.log()} },
            DELETE: { STOREOWNER: ()=>{console.log()} },
            PATCH:  { STOREOWNER: ()=>{console.log()} },
        },

        servicedurations: {
            GET: { STOREOWNER: ()=>{console.log()} },
            PATCH:  { STOREOWNER: ()=>{console.log()} },
        }    
    } 
}

module.exports = { JSON, testJSON }






