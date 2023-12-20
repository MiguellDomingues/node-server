const { Location,WorkingDay } = require('../models.js');

let db = require('../database.js')

module.exports = async function editLocationWorkingDay(wp_id, start, end, location_id){
   
    return new Promise( (resolve, reject) => {

         db.connect().then( async ()=>{

            Location.findOneAndUpdate(
                {   //https://stackoverflow.com/questions/56527121/findoneandupdate-nested-object-in-array
                    "_id": location_id,
                    "workingPlan._id": wp_id // filter: match the location workingDay subdocument with wd_id
                },              
                {  $set:{
                        "workingPlan.$.start": start, //update the start/end fields
                        "workingPlan.$.end": end
                    }                       
                },
                { runValidators: true }) 
                .then( (result) => { 
                    if(!result) throw new Error("wp_id or location_id did not match any documents") 
                    resolve({wp_id, start, end})
                })  
                .catch( (err) => reject(new Error("Query Error: editLocationWorkingDay", { cause: err })))
                .finally( ()=>db.disconnect() )

/*
            try{
                const location = await Location.findById(location_id)

                if(!location) //validate that the parent/child documents exist
                    throw new Error(`location_id ${location_id} not found`)
                if(!location.workingPlan.id(wp_id)) 
                    throw new Error(`wp_id ${wp_id} not found`)

                //run the validation middleware for the workingDay schema
                await WorkingDay.findOneAndUpdate({"_id": wp_id},{ $set:{"start": start, "end": end}},{ new: true })  
                await location.save()
                resolve({wp_id, start, end})

            }catch(err){reject(new Error("Error: editLocationWorkingDay", { cause: err }))
            }finally{db.disconnect()}
*/
        }).catch( (err)=> reject(new Error("Database connection Error", { cause: err }) ) );
    })
 }

    /*
 Location.findOneAndUpdate(
            {   //https://stackoverflow.com/questions/56527121/findoneandupdate-nested-object-in-array
                "_id": location_id,
                "workingPlan._id": wp_id // filter: match the location workingDay subdocument with wd_id
            },              
            {  $set:{
                    "workingPlan.$.start": start, //update the start/end fields
                    "workingPlan.$.end": end
                }                       
            },
            { runValidators: true }) 
            .then( (result) => { 
                if(!result) throw new Error("wp_id or location_id did not match any documents") 
                resolve({wp_id, start, end})
            })  
            .catch( (err) => reject(new Error("Query Error: editLocationWorkingDay", { cause: err })))
            .finally( ()=>db.disconnect() )
          */