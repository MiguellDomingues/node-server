
const deleteStoreOwnerLocation  = require('../../database/delete/delete_location_storeowner.js')
const fetchStoreOwnerLocations  = require('../../database/read/storeowner_locations.js')

const editStoreOwnerLocation    = require('../../database/update/edit_locations_storeowner.js')
const editAppointment           = require('../../database/update/edit_appointment.js')

const createLocation            = require('../../database/create/post_locations_storeowner.js')

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteLocation = (req, res) => {

    console.log("/delete location")
    
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    deleteStoreOwnerLocation(req.body.loc_id, u_id)
    .then( function(raw_db_result){

        const res_json = deleteStoreOwnerLocation_format(raw_db_result, req.body.loc_id)

       res.setHeader('Content-Type', 'application/json');
       res.send( JSON.stringify(res_json) );
    })
    .catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
    
}

const deleteStoreOwnerLocation_format = (db_result, loc_id) => {

    if(!db_result){
        return {}
    }

    return {
        id: loc_id
    }                         
}

////////////////////////////////////////////////////////////////////////////////////

const fetchLocations = (req,res) => {

    console.log("/posts/storeowner")


    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    console.log("STOREOWNER KEY: ", u_id)
  
    fetchStoreOwnerLocations(u_id).then ( function(result){

        //console.log(result)

        const res_json = storeOwnerLocations_format(result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
        
    }).catch( (err)=>{

      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');

    }); 
}

const storeOwnerLocations_format = (db_result) => {

    return {
        
        posts: db_result.map( (loc) => {

            //console.log("loc: ", loc)

                    return {
                        id: String(loc._id), 
                        address: loc.address, 
                        info: loc.info,
                        LatLng: { lat: loc.lat, lng: loc.lng},
                        appointments: loc.appointments.map( (apt) => {
                            //console.log("--------apt: ", apt)
                            apt.appointment_types = apt.tags.map(tag=>tag.tag_name)   
                            apt.id = String(apt._id)
                            apt.appointee = apt.user[0].name 
                            delete apt._id
                            delete apt.tags
                            delete apt.user
                            console.log("STOREOWNER apt: ", apt)
                            return apt
                        } ),
                        icons: loc.tags.map( (tag) => tag.tag_name )
                    }
                })
                
    }  
}

/////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////// editAppointmentStatus

const updateAppointmentStatus = (req, res) => {

    console.log("/patch appointment (storeowner)")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    const storeowner_id =  u_id
    const apt_id = req.body.apt_id
    const status = req.body.new_status

    //res.send( JSON.stringify(req.body) );

    editAppointment(storeowner_id, apt_id, status).then(function(raw_db_result){
  
          const res_json = updateAppointmentStatus_format(raw_db_result)

          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
      });
      
}

const updateAppointmentStatus_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {                      
        appointment:{
            id: String(db_result._id),
            status: db_result.status
        }               
    }      
}

//////////////////////////////////////////////////////////////////////////////////////

const editLocation = (req, res) => {

    console.log("/patch location")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
    
    const storeowner_id = u_id
    const location = req.body.location

    editStoreOwnerLocation (
        storeowner_id,
        location.id,
        location.info,
        location.address,
        location.LatLng.lat,
        location.LatLng.lng,
        location.icons)
        .then(function(raw_db_result){
  
          const res_json = editStoreOwnerLocation_format(raw_db_result)

          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
  
      });
}

const editStoreOwnerLocation_format = (db_result) => {

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
        }               
    }      
}

const addLocation = (req, res) => {

    console.log("/post location")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
 
    createLocation (
        u_id,
        req.body.info,
        req.body.address, 
        req.body.LatLng.lat,
        req.body.LatLng.lng,  
        [...req.body.icons]
        ).then(function(raw_db_result){
  
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

module.exports = { deleteLocation, fetchLocations, updateAppointmentStatus, editLocation, addLocation }