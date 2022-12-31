const editLocation = require('../database/update/edit_locations_storeowner.js')
const editAppointment = require('../database/update/edit_appointment.js')

const editStoreOwnerLocation = (req, res) => {

    console.log("/patch location")
        
    console.log("req body",req.body)

    const storeowner_id = req.body.storeowner_id
    const location = req.body.location

    editLocation (
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

///////////////////////////////////////////////////////////////////////////// editAppointmentStatus

const updateAppointmentStatus = (req, res) => {

    console.log("/patch appointment (storeowner)")
        
    console.log("req body",req.body)

    const storeowner_id = req.body.storeowner_id
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



module.exports = { editStoreOwnerLocation, updateAppointmentStatus }