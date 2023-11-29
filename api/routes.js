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
        
        POST: { 
            GUEST: auth.validateLogin, 
            STOREOWNER: auth.LogOutSession,
            USER:       auth.LogOutSession,
        },     
    },

    register:{
        
        POST: { GUEST: auth.registerNewUser }
        
    },

    appointment:{
        
        POST: { USER: user.addAppointment },
        PATCH: { STOREOWNER: storeowner.updateAppointmentStatus },
        DELETE: { USER: user.cancelAppointment}
        
    },

    availability:{
        
        
        workingplans: {
            GET: { STOREOWNER:storeowner.fetchWorkingPlans }, 
            PATCH:  { STOREOWNER: (req, res)=>{console.log("PATCH workingplan")} },
        },

        breaks: {
            GET: { STOREOWNER: storeowner.fetchBreaks },
            DELETE: { STOREOWNER: (req, res)=>{console.log("DELETE breaks")} },
            PATCH:  { STOREOWNER: (req, res)=>{console.log("PATCH breaks")} },
        },

        servicedurations: {
            GET: { STOREOWNER: storeowner.fetchServiceDurations },
            PATCH:  { STOREOWNER: (req, res)=>{console.log("PATCH servicedurations")} },
        }    
    },


}

const testJSON = {
    availability:{
        
        GET: { STOREOWNER: ()=>{console.log()} },
        POST: { STOREOWNER: ()=>{console.log()} },
        
        
        workingplans: {
            GET: { STOREOWNER:storeowner.fetchWorkingPlans },
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






