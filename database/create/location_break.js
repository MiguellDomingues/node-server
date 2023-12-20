const { Location, Break } = require('../models.js');

let db = require('../database.js')

module.exports = async function addLocationBreak(days, start, end, location_id){
   
    return new Promise( async (resolve, reject) => {

         db.connect().then( async ()=>{

            const newbreak = await new Break({days, start, end}) 

            Location.findOneAndUpdate(
                {"_id": location_id}, 
                {$push: { breaks: newbreak }}, 
                { runValidators: true }) 
            .then( (result) => { 
                if(!result) throw new Error("location_id did not match any documents") 
                resolve(newbreak)
            })  
            .catch( (err) => reject(new Error("Error: addLocationBreak", { cause: err })))
            .finally( ()=>db.disconnect() )    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 /*
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


              /*
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
*/
