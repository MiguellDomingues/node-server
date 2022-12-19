let mongoose = require('mongoose');

const server    = '127.0.0.1:27017';          
const database  = 'appointment_bookings';     

const uri = `mongodb://${server}/${database}`;

const connect = async () => { 

    return new Promise( (resolve, reject) => {
        mongoose.connect(uri).then( (db_obj) => resolve(db_obj) ).catch( (err) => reject(err) )
    })
}

const disconnect = async () => { await mongoose.connection.close(); }

module.exports = {
    connect,
    disconnect
}


