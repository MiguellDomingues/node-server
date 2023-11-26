const { Location, Tag } = require('../models.js');
let db = require('../database.js')

module.exports = async function editStoreOwnerLocation(storeowner_id,location){
   
    return new Promise( (resolve, reject) => {

        // since i used 2 queries here, need to change the flow of then/catch/finally
         db.connect().then( ()=>{

            const {LatLng: {lat, lng}, address, city, country, email, id, icons: req_tags, info, phone, postal_code, province, title } =  location

            Tag.find({ tag_name: { $in: req_tags } })   // fetch the ids where req_tags strings = tag_name in Tag collection
            .then( (tags) => { 

                Location.findOneAndUpdate(
                    {   // filter: match the location id and storeowner id with the document to update
                        //_id:    location_id,
                        _id:    id,
                        owner:  storeowner_id,
                    },              
                    {   //update fields: update the location by replacing every feild                  
                        info:        info, 
                        address:     address,
                        lat:         lat,
                        lng:         lng,
                        city:        city,
                        country:     country,
                        email:       email,
                        phone:       phone,
                        postal_code: postal_code,
                        province:    province,
                        title:       title,
                        tags:        tags.map( (tag) => {return {_id: tag._id}} ) // input an array of tag id's
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