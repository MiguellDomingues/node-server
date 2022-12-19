const { Location } = require('../models.js');
var mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

const buildResponse = (db_result) => {

    console.log("raw db query: ", db_result)

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

module.exports.fetchLocationsUser = async function fetchLocationsUser(key, callback) {
   
    await mongoose.connect(uri);

    console.log('key: ', key) //use key to maych appointments to users, later

    try {  

        //input to aggregate: an array of objects (pipelines), each object/pipeline contains keys (pipeline stages)
        // this is an example of 3 pipelines, each with a single stage
        //fetch each location, the appointments at each location, and the tags for each location, removing unnessesary fields

        //TODO: try to change _id: to id in query   ("let": { "id": "$_id.phone" },)
        //      store lat, lng as LatLng in model
        const result = await Location
                .aggregate([{ 
                       $lookup: //JOIN appointments with location, grouping each appointment with matching location
                        {
                            from: "appointments",
                            localField: "_id",
                            foreignField: "location",
                            as: "appointments",
                            "pipeline": [{ 
                                "$project": { "_id:": 1, "date": 1, "start": 1, "end": 1},  //hide user/location fields from appointment
                            }],                   
                        },              
                    },{ 
                        $project: { _id: 1, user: 0, __v: 0} //hide id/user/v from locations
                    },{
                        $lookup: //JOIN tags with location, grouping each tag with matching locations
                        {
                            from: "tags",
                            localField: "tags",
                            foreignField: "_id",
                            as: "tags",
                            "pipeline": [{ "$project": {"tag_name": 1,"_id": 0 }}], //hide all fields in tags except tag_name
                        }
                    }              
                ]);

        callback(buildResponse(result))
    
     } catch(err) { 
        throw err 
    } finally { 
        mongoose.connection.close(); 
    }
 }