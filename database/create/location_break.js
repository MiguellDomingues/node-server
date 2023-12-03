const { Location, Break } = require('../models.js');
let db = require('../database.js')

module.exports = async function addLocationBreak(days, start, end, location_id){
   
    return new Promise( async (resolve, reject) => {

         db.connect().then( async ()=>{

            try{
                const location = await Location.findById(location_id)
                
                if(!location) 
                    throw new Error(`location_id ${location_id} not found`)

                const newBreak = await new Break({days, start, end})
                location.breaks.push(newBreak)
                await location.save()
                resolve(newBreak)
            }
            catch(err){
                reject(new Error("Query Error: addLocationBreak", { cause: err })) 
            }
            finally{
                db.disconnect()
            }

           
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }