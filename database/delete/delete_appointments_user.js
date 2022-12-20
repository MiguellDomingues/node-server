const { Appointment } = require('../models.js');
let db = require('../database.js')

module.exports = async function deleteAppointment(apt_id, user_id) {

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{
   
            Appointment.deleteOne({_id: apt_id})
                .then( (result) => { resolve(result)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )
   
       }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })            
 }
