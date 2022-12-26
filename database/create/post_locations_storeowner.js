const { Location, Tag } = require('../models.js');
let db = require('../database.js')

module.exports = async function createLocation(storeowner_id, info, address, lat, lng, req_tags) {
   
    return new Promise( (resolve, reject) => {

        // since i used 2 queries here, need to change the flow of then/catch/finally
        // can replace with an aggregate() pipeline using multiple stages
         db.connect().then( ()=>{

            Tag.find({ tag_name: { $in: req_tags } })   // fetch the ids where req_tags strings = tag_name in Tag collection
            .then( (tags) => { 

                Location.create({                       // create a new location, using fetched tag id's from previous query 
                    owner:      storeowner_id,
                    info:       info, 
                    address:    address,
                    lat:        lat,
                    lng:        lng,
                    tags:       tags.map( (tag) => {return {_id: tag._id}} )
                })
                .then( (result) => { resolve( {...result._doc, tags: req_tags} )}) // on success, return the created location, replacing the tag id's with the tag_names
                .catch( (err) =>  { reject(new Error("Query Error: Location.create()", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

            })
            .catch( (err) =>  { 
                db.disconnect()
                reject(new Error("Query Error: Tag.find()", { cause: err }))
             })
            
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }