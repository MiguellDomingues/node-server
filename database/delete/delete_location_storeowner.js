const { Appointment, Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function deleteLocation(loc_id, storeowner_id) {

    return new Promise( (resolve, reject) => {

        db.connect().then( (db)=>{

            Location.findOneAndDelete({_id: loc_id, owner: storeowner_id})
            .then( (result) => {
                
                if(!result) { reject(new Error("Query Result Error", { cause: "deleteLocation: location not found" })) }

                Appointment.deleteMany({location: loc_id}).then( (result)=> { resolve(result) })
                .catch( (err) => reject(new Error("Query Error", { cause: err })) )
                .finally( () => db.disconnect() )

            })
            .catch( (err) =>  { 
                db.disconnect()
                reject(new Error("Query Error", { cause: err })) 
            } )
     
       }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })            
 }



