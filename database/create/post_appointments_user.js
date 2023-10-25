const { Appointment,Tag  } = require('../models.js');
let db = require('../database.js')

module.exports = async function createAppointment(loc_id, user_id, date,start, end, appointment_types) {
    return new Promise( (resolve, reject) => {
         db.connect().then( async ()=>{         
            const tags = await Tag.find({ tag_name: { $in: appointment_types } }) //fetch Tag models in appointment_types 
            Appointment.create({ 
                location: loc_id,
                user:     user_id, 
                date:   date,
                start:  start,
                end:    end,
                tags:  tags.map( (tag) => {return {_id: tag._id}} ) //insert Tag models by id
            })
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
            .finally( ()=> { db.disconnect()} )
    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }