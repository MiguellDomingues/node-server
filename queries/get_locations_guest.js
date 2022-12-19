const { Location } = require('../models.js');
//var mongoose = require('mongoose');

//const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

let db = require('../database.js')

const buildResponse = (db_result) => {

    //console.log("raw db query: ", db_result)

    return {
        posts: db_result.map( (apt) => {

                    return {
                        id: String(apt._id),
                        address: apt.address, 
                        info: apt.info,
                        LatLng: { lat: apt.lat, lng: apt.lng},
                        icons: apt.tags.map( (tag) => tag.tag_name )
                    }
                })
    }  
}

module.exports = async function fetchLocationsGuest(key, callback) {   

//module.exports.fetchLocationsGuest = async function fetchLocationsGuest(key, callback) {    
   
    //await mongoose.connect(uri);

    console.log("32")

    await db.connect().then( (conn) =>{

        console.log("36")

        Location.find({}).populate('tags').then( (locations)=>{
            console.log("39")
            callback( buildResponse(locations) )   
        }).catch( (err)=>{
            console.log("42")
            throw err
        }).finally( ()=>{
            console.log("44")
            db.disconnect()
        })

    }).catch( (err)=>{
        console.log("50")
        throw err
    } )

    /*
    try {  

        Location.
            find({}).
                populate('tags').
                    exec(function (err, locations) {
                            if (err) console.error(err);
                            //mongoose.connection.close();
                            db.disconnect()
                            callback( buildResponse(locations) )                  
                    });

     } catch(err) { throw err }
     */
 }