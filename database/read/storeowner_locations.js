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
                $lookup: //JOIN appointments with location, grouping each appointment with matching location
                 {
                     from: "appointments",
                     localField: "_id",
                     foreignField: "location",
                     as: "appointments",
                     pipeline:[                      
                        {$lookup: {from: "users", localField: "user", foreignField: "_id", as: "user", pipeline:[{$project: {"name": 1}} ] },}, //join users with appointments, fetching just the appointee name
                        {$lookup: {from: "tags", localField: "tags", foreignField: "_id", as: "tags",  pipeline: [ {$project: {"tag_name": 1,"_id": 0 }},] },},   
                        {$project: {"user": 1,"_id:": 1, "date": 1, "start": 1, "end": 1, "status": 1, "tags":1}} 
                    ],                   
                 },              
             },
             { 
                 $project: { owner: 0, _id: 1, user: 0, __v: 0} //hide owner/user/v from locations
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