const auth                          = require('../database/read/auth.js')
const register                      = require('../database/create/register.js')
const createAppointment             = require('../database/create/post_appointments_user.js')
const createLocation                = require('../database/create/post_locations_storeowner.js')

const addStoreOwnerLocation = (req, res) => {

    console.log("/post location")
        
    console.log("req body",req.body)

    createLocation (
        req.body.storeowner_id,
        req.body.info,
        req.body.address, 
        req.body.LatLng.lat,
        req.body.LatLng.lng,  
        [...req.body.icons])
        .then(function(raw_db_result){
  
          const res_json = createLocation_format(raw_db_result)

          console.log("CREATE LOCATION RESULT: ", res_json)
  
          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
  
      });

}

const createLocation_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {                      
        location:{
            id: String(db_result._id),
            LatLng: {
                lat: db_result.lat,
                lng: db_result.lng
            },
            address: db_result.address,
            info:    db_result.info,
            icons:   db_result.tags,
            appointments: []
        }               
    }   
      
}

//////////////////////////////////////////////////////////////////////////////////////////

const addUserAppointment = (req, res) => {

console.log("/post appointment")
    
    console.log("req body",req.body)

    createAppointment (
      req.body.loc_id, 
      req.body.user_id, 
      req.body.date,
      req.body.start_time, 
      req.body.end_time).then(function(raw_db_result){

        const res_json = createAppointment_format(raw_db_result)

        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const createAppointment_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            appointment:{
                id:         String(db_result._id),
                loc_id:     String(db_result.location),
                date:       db_result.date,
                start:      db_result.start,
                end:        db_result.end, 
            }               
        }      
}


/////////////////////////////////////////////////////////////

const validateLogin = (req,res) => {

    console.log("/auth")
    
    console.log("req body",req.body)

    auth(req.body.user_name, req.body.password).then ( function(raw_db_result){

            const res_json = valiadateLogin_format(raw_db_result)
            res.setHeader('Content-Type', 'application/json');
            res.send( JSON.stringify(res_json) );

        }).catch( (err)=>{

            console.log("err from database")
            console.error(err)
            res.status(500).send('Internal Server Error');

    });
}

const valiadateLogin_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

////////////////////////////////////////////////////////////

const registerNewUser = (req,res) => {

    console.log("/register")
    
    console.log("req body",req.body)

    register(req.body.user_name, req.body.password, req.body.type)
    .then( function(raw_db_result){

        const res_json = registerNewUser_format(raw_db_result)     
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const registerNewUser_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

////////////////////////////////////////////////////////////////////////////////////////

module.exports = { validateLogin, registerNewUser, addUserAppointment, addStoreOwnerLocation }