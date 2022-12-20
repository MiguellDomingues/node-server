const { Appointment } = require('../models.js');
let db = require('../database.js')

module.exports = async function createAppointment(loc_id, user_id, date,start, end) {
   
    return new Promise( (resolve, reject) => {

         db.connect().then( ()=>{
    
            Appointment.create({ 
                location: loc_id,
                //user:     user_id, 
                date:   date,
                start:  start,
                end:    end,
            })
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
            .finally( ()=> { db.disconnect()} )
    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }