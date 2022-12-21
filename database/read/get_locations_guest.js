const { Location } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchLocationsGuest(key) {   

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{
            Location.
            find({})
            .populate('tags')
                .then( (locations) => { resolve(locations)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }