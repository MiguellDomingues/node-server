
const mongoose = require('mongoose');
const uri             = "mongodb://127.0.0.1:27017/appointment_bookings";

module.exports.deleteDB = async function deleteDB() {
   
     await mongoose.connect(uri);

    /*
    await mongoose.connect(uri)
        .then( (m) => {
                console.log("then connect")
                m.connection.db.dropDatabase().then( () => console.log("dropped appointment_bookings") ).catch( (err) => console.error(err) ) } )
            .catch( (err) => console.error(err) )
                .finally( () => {
                    console.log("finally delete")
                    mongoose.connection.close()} );
                    */

     try {  
        await mongoose.connection.db.dropDatabase().then( (res) => console.log("dropped appointment_bookings: ", res) ).catch( (err) => console.error(err) );
     } finally {
         // Close the connection to the MongoDB cluster
        // await client.close();
        await mongoose.connection.close();
     }
 }

  //await mongoose.connection.db.dropCollection('users').then( () => console.log("User dropped") ).catch( (err) => console.error(err) );
        //await mongoose.connection.db.dropCollection('appointments').then( () => console.log("Appointment dropped") ).catch( (err) => console.error(err) );
       // await mongoose.connection.db.dropCollection('locations').then( () => console.log("Location dropped") ).catch( (err) => console.error(err) );
       // await mongoose.connection.db.dropCollection('tags').then( () => console.log("Tag dropped") ).catch( (err) => console.error(err) );
       // await mongoose.connection.db.dropCollection('locationtags').then( () => console.log("LocationTag dropped") ).catch( (err) => console.error(err) );
        //await mongoose.connection.db.dropCollection('tagtypes').then( () => console.log("TagType dropped") ).catch( (err) => console.error(err) );




