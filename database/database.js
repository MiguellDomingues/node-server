let mongoose = require('mongoose');

const { DATABASE_URI  }  = require('../utils/constants.js');

mongoose.set('strictQuery', true);

const connect = async () => {  return await mongoose.connect(DATABASE_URI); }

const disconnect = async () => { await mongoose.connection.close(); }

const ObjectId = (id) => { return new mongoose.Types.ObjectId(id) }

module.exports = { connect, disconnect, ObjectId }


