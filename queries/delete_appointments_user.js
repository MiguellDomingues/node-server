const { Appointment } = require('../models.js');
var mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

const buildResponse = (db_result, apt_id) => {

    //console.log("delete appointment: raw db result: ", db_result)

        if(db_result.deletedCount !== 1){
            return {}
        }

        return {
            apt_id: apt_id
        }                         
}

module.exports.deleteAppointment = async function deleteAppointment(
      apt_id,
      user_id, // use this when we validate that appointment belongs to user
    callback) {
   
        await mongoose.connect(uri) //.then(function (a) { console.log("then m.connect:") } );

        console.log(apt_id)

        Appointment.deleteOne({ 
            _id: apt_id
         }).then(function (result) {
           
            console.log("delete appointment result: ", result)

            callback( buildResponse(result, apt_id) )                       
        }).catch( function (err) {
            console.log("error in delete query", err)                            
        }).finally( function () {
           mongoose.connection.close();                              
        })        
 }