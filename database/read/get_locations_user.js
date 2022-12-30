const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchLocationsUser(user_id) {
   
    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{

            //aggregate() is an alternative to using find(),
            // more verbose and implicit, but can handle more complicated queries
            //input to aggregate: an array of objects (pipelines), each object/pipeline contains keys (pipeline stages)
            // this is an example of 3 pipelines, each with a single stage
            //fetch each location, the appointments at each location, and the tags for each location, removing unnessesary fields

            //TODO: try to change _id: to id in query   ("let": { "id": "$_id.phone" },)
            //      store lat, lng as LatLng in model
            // LESS WORK TO DO when converting results for client consumption

            /*
                for each location:
                    -> fetch all appointments for each location 
                        -> (WHERE user = user_id)
                            -> (show only id/date/start/end fields)
                    -> fetch all tag names for each location
                        -> (show only tag_name field)
            */
            Location
            .aggregate([{ 
                $lookup: //JOIN appointments with location where id = user_id, grouping each appointment with matching location
                 {
                     from: "appointments",
                     localField: "_id",
                     foreignField: "location",
                     as: "appointments",

                     pipeline: [                     
                        {$match: {user: db.ObjectId(user_id) }},                    
                        {$project: {"_id:": 1, "date": 1, "start": 1, "end": 1 ,"status":1}, } //hide user/location fields from appointment
                    ],                   
                 },              
             },
             { 
                 $project: { _id: 1, user: 0, __v: 0} //hide id/user/v from locations
             },
             {
                 $lookup: //JOIN tags with location, grouping each tag with matching locations
                 {
                     from: "tags",
                     localField: "tags",
                     foreignField: "_id",
                     as: "tags",
                     pipeline: [ 
                        {$project: {"tag_name": 1,"_id": 0 }}, //hide all fields in tags except tag_name                
                    ], 
                 }
             }])
             .then( (result) => { resolve(result) } )
             .catch(  (err) =>  { reject(new Error("Query Error", { cause: err })) })
             .finally( ()=> { db.disconnect() })

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    }) 
 }