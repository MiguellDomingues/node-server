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
        
    } 
}

const resolveController = (path, req_method,auth) => {
    return JSON[path][req_method][auth]
}

module.exports = { resolveController, JSON }
