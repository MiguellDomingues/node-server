const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchStoreOwnerLocations(storeowner_id) {
   
    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{

            //aggregate() is an alternative to using find(),
            // more verbose and implicit, but can handle more complicated queries
            //input to aggregate: an array of objects (pipelines), each object/pipeline contains keys (pipeline stages)
            
            /*
                    -> for each location l where owner_id = storeowner_id: 
                        -> fetch all appointments a at location l
                            -> fetch user u at appointment a
                            -> show only name field
                        
                        -> show only id/date/start/end fields
                        
                        -> fetch all tags t at location l
                            -> show only tag_name field
            */
            Location
            .aggregate([
            {$match: {owner: db.ObjectId(storeowner_id) }}, //filter by owners managed locations
            { 
                $lookup: // this lookup operates on appointments documents. JOIN appointments with location, grouping each appointment with matching location
                 {
                     from: "appointments",
                     localField: "_id",
                     foreignField: "location",
                     as: "appointments",
                     pipeline:[                      
                        {$lookup: {from: "users", localField: "user", foreignField: "_id", as: "user", pipeline:[{$project: {"name": 1}} ] },}, //join users with Appointments, fetching just the appointee name
                        {$lookup: {from: "tags", localField: "tags", foreignField: "_id", as: "tags",  pipeline: [ {$project: {"tag_name": 1,"_id": 0 }},] },},  //for each Tag object in tags arr, replace the id with the tag_name
                        {$project: {"user": 1,"_id:": 1, "date": 1, "start": 1, "end": 1, "status": 1, "tags":1}} 
                    ],                   
                 },              
             },
             {
                 $lookup: //for each Tag object in tags arr, replace the id with the tag_name
                 {
                     from: "tags",
                     localField: "tags",
                     foreignField: "_id",
                     as: "tags",
                     pipeline: [ 
                        {$project: {"tag_name": 1,"_id": 0 }}, //hide all fields in tags except tag_name                
                    ], 
                 },
             },

            //https://stackoverflow.com/questions/40992111/mongodb-join-data-inside-an-array-of-objects
             //replacing the Tag id with the tag_name for "service" for each object inside serviceDuration
             {
                $lookup: //first create a temp array called _tags
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
                                $mergeObjects:[ //for each object in serviceDurations
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
                $project: { owner: 0, _id: 1, user: 0, __v: 0, _tags: 0 } //remove owner/user/v/_tags from locations 
            }])
             .then( (result) => { resolve(result) } )
             .catch(  (err) =>  { reject(new Error("Query Error", { cause: err })) })
             .finally( ()=> { db.disconnect() })

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    }) 
 }