let mongoose = require('mongoose');

const server    = '127.0.0.1:27017';          
const database  = 'appointment_bookings';     

const uri = `mongodb://${server}/${database}`;

mongoose.set('strictQuery', true);

const connect = async () => {  return await mongoose.connect(uri); }

const disconnect = async () => { await mongoose.connection.close(); }

const ObjectId = (id) => { return new mongoose.Types.ObjectId(id) }

module.exports = { connect, disconnect, ObjectId }


