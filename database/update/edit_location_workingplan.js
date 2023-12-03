const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function editLocationWorkingDay(wp_id, start, end){
   
    return new Promise( (resolve, reject) => {

         db.connect().then( ()=>{

            Location.findOneAndUpdate(
            {   //https://stackoverflow.com/questions/56527121/findoneandupdate-nested-object-in-array
                "workingPlan._id": wp_id // filter: match the location workingDay subdocument with wd_id
            },              
            {  $set:{
                    "workingPlan.$.start": start, //update the start/end fields
                    "workingPlan.$.end": end
                }                       
            }) 
            .then( (result) => { 
                if(!result) reject(new Error("Query Result Error: editLocationWorkingDay", { cause: "wp_id did not match any documents" })) 
                resolve({wp_id, start, end})
            })  
            .catch( (err) =>  { reject(new Error("Query Error: editLocationWorkingDay", { cause: err })) 
            })
            .finally( ()=> { db.disconnect()} )
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }