const fetchLocationsGuest = require('../../database/read/get_locations_guest.js')

const fetchLocations = (req,res) => {

    console.log("/posts/guest")

    const key = null
    
    fetchLocationsGuest(key).then( function(db_result){

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

  module.exports = { fetchLocations }