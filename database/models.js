const { Schema, model, models } = require('mongoose');

const { STATUS , AUTH_USER_TYPES, DAY_NAMES, DAY_ABBREVIATIONS } = require('../utils/constants.js');
const { validateInterval } = require('../utils/functions.js');

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
      enum: Object.values(DAY_ABBREVIATIONS),         
    },
  }); 
  
  /*

  workingDaySchema.pre('findOneAndUpdate', function() {

      console.log("rttytyvalidate start/end", this.get("start"), this.get("end"))

      validateInterval(this.get("start"), this.get("end"))
      
  });

    
  const workingDaySchema = new Schema({
    start: {type: String, validate:  {
      validator: (value) => {console.log("start validate ", value, this); return true},
      

    }},
    end:   {type: String, validate: {
      validator: (value) => {console.log("end validate ", value, this); return true},
      
    }
    },
    day: { 
      type: String, 
      enum: Object.values(DAY_NAMES),         
    },

  workingDaySchema.pre('validate', function() {

    //console.log("validate start/end", this.get("start"), this.get("end"))

    console.log("workingDaySchema validate", this.start, this.end, )

    //validateInterval(this.get("start"), this.get("end"))
    
});*/

  const breakSchema = new Schema({
    start: String,
    end:   String,
    days: [{ 
      type: String, 
      enum: Object.values(DAY_ABBREVIATIONS),
      required: true
    }],
  });

/*

breakSchema.pre('validate', function() {

  console.log("break validate", this.start, this.end, this.days)

  //validateInterval(this.get("start"), this.get("end"))
  
});

breakSchema.pre('save', function() {

  console.log("break save", this.start, this.end, this.days)

  //validateInterval(this.get("start"), this.get("end"))
  
});
*/

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
   
    workingPlan:[workingDaySchema],

   //workingPlan: {
     // type: [workingDaySchema], 
     // validate: (value)=>console.log("validate wp", value)
   // }, 
    breaks:           [breakSchema],
    serviceDurations: [serviceDurationSchema],
    //user/appointment fk's
    owner: {  type: Schema.Types.ObjectId, ref: 'User' },
    tags: [{  type: Schema.Types.ObjectId, ref: 'Tag' }]
  });

  locationSchema.pre('findOneAndUpdate', function() {

    const isWorkingPlanUpdate = (context) => context.get("workingPlan.$.start") && context.get("workingPlan.$.end")
    const isNewBreak = (context) => context._update['$push']?.breaks?.start && context._update['$push']?.breaks?.end && context._update['$push']?.breaks?.days


    console.log("findOneAndUpdate location",  this.getUpdate())

    if(isWorkingPlanUpdate(this)){
      console.log("validate  workingPlan start/end")
    }

    if(isNewBreak(this)){
      console.log("validate  breaks start/end")
    }
  });


    //console.log(this.get("workingPlan.$.start")); // { name: 'John' }
    //console.log(this.getFilter()); // { name: 'John' }
   // console.log(this.getUpdate()); // { age: 30 }

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
