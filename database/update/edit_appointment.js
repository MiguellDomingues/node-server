const { Appointment } = require('../models.js');
let db = require('../database.js')

module.exports = async function editAppointment
    (
        storeowner_id,
        appointment_id,
        new_status
    ){
   
    return new Promise( (resolve, reject) => {

        // since i used 2 queries here, need to change the flow of then/catch/finally
         db.connect().then( ()=>{

            Appointment.findOneAndUpdate(
            {   // filter: match the location id and storeowner id with the document to update
                _id: appointment_id,
            },              
            {   //update fields: update appointment status                 
                status: new_status, 
            }, 
            {   //options: return the modifed document
                new: true 
            }) 
            .then( (result) => { 
                // if result is null, no match was found on appointment id; it might have been deleted since the user sent the request with dirty ui data
                if(!result) reject(new Error("Query Result Error: editAppointment", { cause: "appointment id did not match any documents" })) 
                resolve(result)
            })  
            .catch( (err) =>  { reject(new Error("Query Error: editAppointment", { cause: err })) 
            })
            .finally( ()=> { db.disconnect()} )
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }