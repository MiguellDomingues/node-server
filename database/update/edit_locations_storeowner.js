const { Location, Tag } = require('../models.js');
let db = require('../database.js')

module.exports = async function editLocation(
        storeowner_id,
        location_id,
        info, 
        address, 
        lat, 
        lng, 
        req_tags
    ){
   
    return new Promise( (resolve, reject) => {

        // since i used 2 queries here, need to change the flow of then/catch/finally
         db.connect().then( ()=>{

            Tag.find({ tag_name: { $in: req_tags } })   // fetch the ids where req_tags strings = tag_name in Tag collection
            .then( (tags) => { 

                Location.findOneAndUpdate(
                    {   // filter: match the location id and storeowner id with the document to update
                        _id:    location_id,
                        owner:  storeowner_id,
                    },              
                    {   //update fields: update the location by replacing every feild                  
                        info:       info, 
                        address:    address,
                        lat:        lat,
                        lng:        lng,
                        tags:       tags.map( (tag) => {return {_id: tag._id}} ) // input an array of tag id's
                    }, 
                    {   //options: return the modifed document
                        new: true 
                    }) 
                .then( (result) => { 
                    // if result is null, no match was found on location and owner id's
                    if(!result) reject(new Error("Query Error: Location.update()", { cause: "owner/location id did not match any documents" })) 
                    resolve( {...result._doc, tags: req_tags} )} //replace the tag id's with the tag names
                )  
                .catch( (err) =>  { reject(new Error("Query Error: Location.update()", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )
            })
            .catch( (err) =>  { 
                db.disconnect()
                reject(new Error("Query Error: Tag.find()", { cause: err }))
             })
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }