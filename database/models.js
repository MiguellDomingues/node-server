const { Schema, model, models } = require('mongoose');

const { STATUS , AUTH_USER_TYPES, DAY_NAMES, DAY_ABBREVIATIONS } = require('../utils/constants.js');


/*
- Approved -> in progress OR canceled 
- in progress -> completed OR canceled
- completed -> none
- canceled -> none
*/

const appointmentSchema = new Schema({
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

  const workingDaySchema = new Schema({
    start: String,
    end:   String,
    day: { 
      type: String, 
      enum: Object.values(DAY_NAMES),         
    },
  });

/*

workingPlan:       {
      type : [ workingDaySchema ],
      validate: dateValidator
    },

  function dateValidator (value) {
    console.log("testing validator: start: ", value.start, " end: ", value.end, " value ", value)
    return true
}

  workingDaySchema.pre('validate', function (next) {
    
    console.log("testing validator: start: ", this.start, " end: ", this.end)
    //if (this.startDate > this.endDate) {
    //  this.invalidate('startDate', 'Start date must be less than end date.', this.startDate);
   // }
  
    next();
  });*/

  const breakSchema = new Schema({
    start: String,
    end:   String,
    days: [{ 
      type: String, 
      enum: Object.values(DAY_ABBREVIATIONS) 
    }],
  });

  const serviceDurationSchema = new Schema({
    duration: Number,
    service: {  type: Schema.Types.ObjectId, ref: 'Tag' }
  });

  const locationSchema = new Schema({
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
    workingPlan:      [workingDaySchema], 
    breaks:           [breakSchema],
    serviceDurations: [serviceDurationSchema],
    //user/appointment fk's
    owner: {  type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{  type: Schema.Types.ObjectId, ref: 'Tag' }]
  });

 

  const userSchema = new Schema({
    path:         String,
    name:         String,
    type:        { type: String, enum: Object.values(AUTH_USER_TYPES), required : true },
    login_name:  { type : String , unique : true, required : true, dropDups: true },
    password:    { type : String , required : true}
  });

  const tagTypeSchema = new Schema({
    tag_type_name:  String,
});

const tagSchema = new Schema({
    tag_name:  String,
    tag_type: {  type: Schema.Types.ObjectId, ref: 'TagType' },
});

module.exports = {
  TagType:          models.TagType         || model('TagType',         tagTypeSchema),
  Tag:              models.Tag             || model('Tag',             tagSchema),
  User:             models.User            || model('User',            userSchema),
  Location:         models.Location        || model('Location',        locationSchema),
  Appointment:      models.Appointment     || model('Appointment',     appointmentSchema),
  WorkingDay:       models.WorkingDay      || model('WorkingDay',      workingDaySchema),
  Break:            models.Break           || model('Break',           breakSchema),
  ServiceDuration:  models.ServiceDuration || model('ServiceDuration', serviceDurationSchema),
}
