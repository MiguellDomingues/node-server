let mongoose = require('mongoose');

const server    = '127.0.0.1:27017';          
const database  = 'appointment_bookings';     

const uri = `mongodb://${server}/${database}`;

mongoose.set('strictQuery', true);

const connect = async () => {  await mongoose.connect(uri); }

const disconnect = async () => { await mongoose.connection.close(); }

module.exports = { connect, disconnect }


