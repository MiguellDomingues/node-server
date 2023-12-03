const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchStoreOwnerLocations(storeowner_id) {
   
    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{
            /*
            aggregate() is a method to expresss multiple operations,
            /more verbose and implicit, but can handle more complicated queries
            input to aggregate: an array of objects (pipelines), each object/pipeline contains keys (pipeline stages)

            1. filter locations by storeowner_id
            2. for each location, link appointments to that location by location.id == appointment.location
            3. for each appointment: 
                link the user to that appointment by user.id == appointment.user and get the user name
                for each tag in appointment.tags[], link the id to an id in tags.id and get the tag_name
            4. for each tag in location.tags[], link the id to an id in tags.id and get the tag_name
            5. replace the service field for each object in serviceDurations with the tag_name
            6. remove the _tags array from the return object

            */
            Location
            .aggregate([
            {$match: {owner: db.ObjectId(storeowner_id) }}, //filter by owners managed locations
            { 
                $lookup: // this lookup return an array of appointment documents where appointment.location === location._id 
                 {
                     from: "appointments",
                     localField: "_id",
                     foreignField: "location",
                     as: "appointments",
                     pipeline:[ //operations for each returned appointment document from the join.. 
                        //replace the user id field on each appointment with the name of that user             
                        {$lookup: {from: "users", localField: "user", foreignField: "_id", as: "user", pipeline:[{$project: {"name": 1}} ] },}, 
                        //replace each tag id in the tags array with the tag_name
                        {$lookup: {from: "tags", localField: "tags", foreignField: "_id", as: "tags",  pipeline: [ {$project: {"tag_name": 1,"_id": 0 }},] },},  
                        //show specific fields from the appointment
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

             /*
             https://stackoverflow.com/questions/40992111/mongodb-join-data-inside-an-array-of-objects
                the aggregation to replace subdocument id's with that subdocuments data fields
                the target is an array contaning objects with the id we want to replace
             */
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
                $project: { owner: 0, _id: 1, user: 0, __v: 0, _tags: 0 } //remove owner/user/v/_tags from locations 
            }])
             .then( (result) => { resolve(result) } )
             .catch(  (err) =>  { reject(new Error("Query Error", { cause: err })) })
             .finally( ()=> { db.disconnect() })

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    }) 
 }