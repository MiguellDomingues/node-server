const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function deleteLocationBreak(location_id, break_id){
   
    return new Promise( async (resolve, reject) => {

        db.connect().then( async ()=>{
 
            try{
                const location = await Location.findById(location_id) 
                
                if(!location) 
                    throw new Error(`location_id ${location_id} not found`)

                location.breaks.pull(break_id)
                await location.save()
                resolve(break_id)
            }
            catch(err){
                reject(new Error("Query Error: deleteLocationBreak", { cause: err })) 
            }
            finally{
                db.disconnect()
            }
        
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }