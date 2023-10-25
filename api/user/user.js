const deleteAppointment             = require('../../database/delete/delete_appointments_user.js')
const fetchUserLocations            = require('../../database/read/get_locations_user.js')
const createAppointment             = require('../../database/create/post_appointments_user.js')

const cancelAppointment = (req, res) => {

    console.log("/delete appointment")
    
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

    if(!u_id){
        console.error("res.locals.u_id is undefined")
        res.status(500).send('Internal Server Error');
    }

    deleteAppointment(req.body.apt_id, u_id)
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

////////////////////////////////////////////////////////////////////////////////////

const fetchLocations = (req,res) => {

    console.log("/posts/user")
    
    //const key = req.query.key;

    console.log("user session: ", res.locals.session)

    const key = res.locals.session.auth.u_id

    console.log("USER KEY: ", key)
  
    fetchUserLocations(key).then ( function(result){

        console.log(result)

        const res_json = fetchUserLocations_format(result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
        
    }).catch( (err)=>{

      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');

    }); 
}

const fetchUserLocations_format = (db_result) => {
    return {
        
        posts: db_result.map( (loc) => {

                    return {
                        id: String(loc._id), 
                        address: loc.address, 
                        info: loc.info,
                        LatLng: { lat: loc.lat, lng: loc.lng},
                        appointments: loc.appointments.map( (apt) => {
                            apt.appointment_types = apt.tags.map(tag=>tag.tag_name)               
                            apt.id = String(apt._id)                  
                            delete apt._id
                            delete apt.tags
                            return apt
                        } ),
                        icons: loc.tags.map( (tag) => tag.tag_name )
                    }
                })
                
    }  
}

//////////////////////////////////////////////////////////////////////////////////////////

const addAppointment = (req, res) => {

    console.log("/post appointment")
        
        console.log("req body",req.body)
        
        const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
        
        createAppointment (
          req.body.loc_id, 
          u_id,
          req.body.date,
          req.body.start_time, 
          req.body.end_time,
          req.body.apt_types).then(function(raw_db_result){
    
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
                    status:     db_result.status
                }               
            }      
    }
    
    
    ////////////////////////////////////////////////////////////
 

module.exports = { cancelAppointment, fetchLocations, addAppointment }