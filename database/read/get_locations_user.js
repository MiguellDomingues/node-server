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
                        {$lookup: {from: "tags", localField: "tags", foreignField: "_id", as: "tags",  pipeline: [ {$project: {"tag_name": 1,"_id": 0 }},] },},                    
                        {$project: {"_id:": 1, "date": 1, "start": 1, "end": 1 ,"status":1, "tags":1}, } //hide user/location fields from appointment
                    ],                   
                 },              
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
             },
             {
                $lookup: //first create a temp array called _tags by joining Tags documents by _id with each service field on each object in the serviceDurations array
                 {
                     from: "tags",
                     localField: "serviceDurations.service",
                     foreignField: "_id",
                     as: "_tags",             
                 }
             },

             {
                $addFields:{ 
                    "serviceDurations":{ //replace serviceDurations with a new array
                        $map:{
                            "input": "$serviceDurations", //source of array objects to replace
                            "in": {
                                $mergeObjects:[ //iterate objects in serviceDurations
                                    "$$this", //copy all the fields in the object
                                    {"service":{ //replace service field by matching id with id from _tags
                                        $arrayElemAt: ["$_tags",{ $indexOfArray: ["$_tags._id","$$this.service"] } ]
                                    }}
                                ]
                            }
                        }
                    }
                }
            },
            { 
                $project: { owner: 0, _id: 1, user: 0, __v: 0, _tags: 0, breaks: 0, workingPlan: 0 } //remove owner/user/v/_tags from locations 
            }])
             .then( (result) => { resolve(result) } )
             .catch(  (err) =>  { reject(new Error("Query Error", { cause: err })) })
             .finally( ()=> { db.disconnect() })

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    }) 
 }