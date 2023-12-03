const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function editLocationServiceDuration(sd_id, duration){
   
    return new Promise( (resolve, reject) => {

         db.connect().then( ()=>{

            Location.findOneAndUpdate(
            {   //https://stackoverflow.com/questions/56527121/findoneandupdate-nested-object-in-array
                "serviceDurations._id": sd_id // filter: match the location ServiceDuration subdocument with sd_id
            },              
            {  $set:{
                    "serviceDurations.$.duration": duration, //update the duration
                }                       
            }) 
            .then( (result) => { 
                if(!result) throw new Error(`sd_id ${sd_id} did not match any documents`) //if no result returned, then sd_id was not found in any location.serviceDurations array
                resolve({sd_id, duration})
            })  
            .catch( (err) =>  { reject(new Error("Query Error: editLocationServiceDuration", { cause: err })) 
            })
            .finally( ()=> { db.disconnect()} )
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }