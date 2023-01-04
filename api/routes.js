const guest                       = require('./guest/guest.js')
const auth                        = require('./auth/auth.js')
const user                        = require('./user/user.js')
const storeowner                  = require('./storeowner/storeowner.js')

/*
an endpoint is defined as:
(name){ // the string path automatically becomes /(name)
    paths:{
        (1 or more  http methods){
            (1 or more of USER/STOREOWNER/GUEST): endpoint callback
        }
    }
}



*/

module.exports = {

    locations:{
        
        GET:{
            STOREOWNER: storeowner.fetchLocations,
            USER:       user.fetchLocations,
            GUEST:      guest.fetchLocations
        },
        
    },

    auth:{
        
        POST: { GUEST: auth.validateLogin }
        
    },

    register:{
        
        POST: { GUEST: auth.registerNewUser }
        
    },

    location:{
        
        POST: { STOREOWNER: storeowner.addLocation },
        PATCH: { STOREOWNER: storeowner.editLocation },
        DELETE: { STOREOWNER: storeowner.deleteLocation}
        
    },

    appointment:{
        
        POST: { USER: user.addAppointment },
        PATCH: { STOREOWNER: storeowner.updateAppointmentStatus },
        DELETE: { USER: user.cancelAppointment}
        
    } 
}
