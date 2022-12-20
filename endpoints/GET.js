
const fetchGuestLocations = require('.././database/queries/get_locations_guest.js')
const fetchUserLocations  = require('.././database/queries/get_locations_user.js')

////////////////////////////////////////////////////////////////////////////////////

const userAppointments = (req,res) => {

    console.log("/posts/guest")
    
    const key = req.query.key;
  
    fetchUserLocations(key).then ( function(result){

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
                            apt.id = String(apt._id)
                            delete apt._id
                            return apt
                        } ),
                        icons: loc.tags.map( (tag) => tag.tag_name )
                    }
                })
                
    }  
}

/////////////////////////////////////////////////////////////////////////////////////
 
const guestAppointments = (req,res) => {

    console.log("/posts/guest")
    const key = "123"
  
    fetchGuestLocations(key).then( function(db_result){
  
      const res_json = fetchGuestLocations_format(db_result)
      res.setHeader('Content-Type', 'application/json');
      res.send( JSON.stringify(res_json) );
  
    }).catch( (err)=>{
  
      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');
  
    }); 
}

const fetchGuestLocations_format = (db_result) => {

    return {
        posts: db_result.map( (apt) => {
  
                    return {
                        id: String(apt._id),
                        address: apt.address, 
                        info: apt.info,
                        LatLng: { lat: apt.lat, lng: apt.lng},
                        icons: apt.tags.map( (tag) => tag.tag_name )
                    }
                })
    }  
  }

  //////////////////////////////////////////////////////////////////////////////////////////////

  

  module.exports = { guestAppointments, userAppointments }