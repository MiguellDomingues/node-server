const { Appointment } = require('../models.js');
var mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

const buildResponse = (db_result) => {

    console.log("post appointment: raw db result: ", db_result)

        if(!db_result){
            return {}
        }

        return {                      
            appointment:{
                id:         String(db_result._id),
                loc_id:     String(db_result.location),
                date:       db_result.date,
                start:      db_result.start,
                end:        db_result.end, 
            }               
        }      
}

module.exports.postAppointment = async function postAppointment(
      loc_id, 
      user_id, 
      date,
      start, 
      end,
    callback) {
   
    await mongoose.connect(uri);

    try {  

        console.log(loc_id, "//",
            user_id,  "//",
            date, "//",
            start,  "//",
            end, "//")

            
        Appointment.create({ 
            location: loc_id,
            //user:     user_id, 
            date:   date,
            start:  start,
            end:    end,
         }, function (err, new_appointment) {
            if (err){
                console.log("postAppointment err", err)         
            }

            console.log("post appointment: ", new_appointment)

            mongoose.connection.close();
            callback( buildResponse(new_appointment) )                       
        });

     } catch(err) { throw err } 
 }