const deleteAppointment             = require('../database/delete/delete_appointments_user.js')
const deleteLocation                = require('../database/delete/delete_location_storeowner.js')

const cancelUserAppointment = (req, res) => {

    console.log("/delete appointment")
    
    console.log("req body",req.body)

    deleteAppointment(req.body.apt_id, req.body.user_id)
    .then( function(raw_db_result){

        const res_json = deleteAppointment_format(raw_db_result)

        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
    })
    .catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const deleteAppointment_format = (db_result, apt_id) => {

    if(db_result.deletedCount !== 1){
        return {}
    }

    return {
        apt_id: apt_id
    }                         
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteStoreOwnerLocation = (req, res) => {

    console.log("/delete location")
    
    console.log("req body",req.body)

    deleteLocation(req.body.loc_id, req.body.storeowner_id)
    .then( function(raw_db_result){

        const res_json = deleteStoreOwnerLocation_format(raw_db_result)

       res.setHeader('Content-Type', 'application/json');
       res.send( JSON.stringify(res_json) );
    })
    .catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
    
}

const deleteStoreOwnerLocation_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {
        deleted_appointments: db_result.deletedCount
    }                         
}

module.exports = { cancelUserAppointment,deleteStoreOwnerLocation }