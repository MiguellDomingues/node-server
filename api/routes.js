const guest                       = require('./endpoints/guest.js')
const auth                        = require('./endpoints/auth.js')
const user                        = require('./endpoints/user.js')
const storeowner                  = require('./endpoints/storeowner.js')
const config                      = require('./endpoints/config.js')


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

        GET:{ USER: user.fetchWeekSchedule }, 
          
        workingplans: {

            //GET: { STOREOWNER:storeowner.fetchWorkingPlans }, 
            PATCH:  { STOREOWNER: storeowner.updateWorkingPlan},
        },

        breaks: {

           // GET: { STOREOWNER: storeowner.fetchBreaks },
            DELETE: { STOREOWNER:  storeowner.deleteBreak },
            POST:  { STOREOWNER: storeowner.addNewBreak },
        },

        servicedurations: {
            
            //GET: { STOREOWNER: storeowner.fetchServiceDurations },
            PATCH:  { STOREOWNER: storeowner.updateServiceDuration },
        }    
    },


}

/*

addNewBreak, deleteBreak, updateServiceDuration
const testJSON = {
    availability:{
        
        GET: { STOREOWNER: ()=>{console.log()} },
        POST: { STOREOWNER: ()=>{console.log()} },
        
        
        workingplans: {
           // GET: { STOREOWNER: storeowner.fetchWorkingPlans },
            PATCH:  { STOREOWNER: storeowner.updateWorkingPlan },
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
*/
module.exports = { JSON,  }






