
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { STATUS , AUTH_USER_TYPES, DAY_NAMES, DAY_ABBREVIATIONS } = require('../utils/constants.js');



/*
- Approved -> in progress OR canceled 
- in progress -> completed OR canceled
- completed -> none
- canceled -> none
*/

const appointmentSchema = new mongoose.Schema({
    date:  String,
    start: String,
    end:   String,
    status: { 
      type: String, 
      enum: Object.values(STATUS), 
      default: 'Approved'         
    },
    //user/appointment fk's
    user: {  type: Schema.Types.ObjectId, ref: 'User' },
    location: {  type: Schema.Types.ObjectId, ref: 'Location' },
    tags: [{  type: Schema.Types.ObjectId, ref: 'Tag' }]
  });

  const workingDaySchema = new mongoose.Schema({
    start: String,
    end:   String,
    day: { 
      type: String, 
      enum: Object.values(DAY_NAMES),         
    },
  });

  const breakSchema = new mongoose.Schema({
    start: String,
    end:   String,
    days: [{ 
      type: String, 
      enum: Object.values(DAY_ABBREVIATIONS) 
    }],
  });

  const serviceDurationSchema = new mongoose.Schema({
    duration: Number,
    service: {  type: Schema.Types.ObjectId, ref: 'Tag' }
  });

  const locationSchema = new mongoose.Schema({
    address:  String,
    lat:      Number,
    lng:      Number,
    info:     String,
    city:     String,
    province: String,
    country: String,
    postal_code: String,
    phone: String,
    email: String,
    title: String,
    workingPlans:     [workingDaySchema],
    breaks:           [breakSchema],
    serviceDurations: [serviceDurationSchema],
    //user/appointment fk's
    owner: {  type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{  type: Schema.Types.ObjectId, ref: 'Tag' }]
  });

  const userSchema = new mongoose.Schema({
    path:         String,
    name:         String,
    type:        { type: String, enum: Object.values(AUTH_USER_TYPES), required : true },
    login_name:  { type : String , unique : true, required : true, dropDups: true },
    password:    { type : String , required : true}
  });

  const tagTypeSchema = new mongoose.Schema({
    tag_type_name:  String,
});

const tagSchema = new mongoose.Schema({
    tag_name:  String,
    tag_type: {  type: Schema.Types.ObjectId, ref: 'TagType' },
});

module.exports = {
  TagType:          mongoose.models.TagType         || mongoose.model('TagType',         tagTypeSchema),
  Tag:              mongoose.models.Tag             || mongoose.model('Tag',             tagSchema),
  User:             mongoose.models.User            || mongoose.model('User',            userSchema),
  Location:         mongoose.models.Location        || mongoose.model('Location',        locationSchema),
  Appointment:      mongoose.models.Appointment     || mongoose.model('Appointment',     appointmentSchema),
  WorkingDay:       mongoose.models.WorkingDay      || mongoose.model('WorkingDay',      workingDaySchema),
  Break:            mongoose.models.Break           || mongoose.model('Break',           breakSchema),
  ServiceDuration:  mongoose.models.ServiceDuration || mongoose.model('ServiceDuration', serviceDurationSchema),
}
