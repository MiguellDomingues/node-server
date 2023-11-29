const mongoose = require('mongoose');
const uri      = "mongodb://127.0.0.1:27017/appointment_bookings";

//const { Schema } = mongoose

const {User, Location, TagType , Tag , Appointment, WorkingDay, Break, ServiceDuration } = require('./models.js');


const mockWorkingPlan = [
    {
        day: "Monday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Tuesday",
        start: "06:00",
        end:   "16:00",
    },
    {
        day: "Wednesday",
        start: "08:00",
        end:   "18:00",
    },
    {
        day: "Thursday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Friday",
        start: "12:15",
        end:   "14:30"
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]

const defaultWorkingPlan = [
    {
        day: "Monday",
        start: "",
        end:   "",
    },
    {
        day: "Tuesday",
        start: "",
        end:   "",
    },
    {
        day: "Wednesday",
        start: "0",
        end:   "",
    },
    {
        day: "Thursday",
        start: "",
        end:   "",
    },
    {
        day: "Friday",
        start: "",
        end:   ""
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]

let mockBreaks = [
    {
        days: ["Mon", "Tue", "Wed", "Thu","Fri"],
        start: "10:15",
        end: "10:30"
    },
    {
        days: ["Mon", "Tue", "Wed", "Thu",],
        start: "12:00",
        end: "13:00"
    },
    {
        days: ["Fri"],
        start: "11:00",
        end: "11:30"
    },
]

const mockDurations = [
    {
        duration: "25"
    },
    {
       duration: "45"
    },
     {
        duration: "30"
     }, 
]

function createWorkingDayDocuments(workingPlans){
    return workingPlans.map(wp=>new WorkingDay({...wp}))
}

function createBreakDocuments(breaks){
    return breaks.map(b=>new Break({...b}))
}

function createServiceDurations(tagIds, durations){
    return durations.map((d, i)=>new ServiceDuration({service: tagIds[i], duration: d.duration}))
}


module.exports.createDB = async function createDB() {
   
    /*
    appointment:
        apt_id, user_id, loc_id, date, start, end

    location:
        loc_id, address, lat, lng, info

    user:
        user_id, type, user_name, password

    location_tag:
        loc_tag_id, loc_id, tag_id

    tag:
        tag_id, tag_type_id, tag_name

    tag_type:
        tag_type_id, tag_type_name
     
    */

     


        try {  
            await mongoose.connect(uri);
            await mongoose.connection.db.dropDatabase().then( (res) => console.log("dropped appointment_bookings: ", res) ).catch( (err) => console.error(err) );
         } finally {
             // Close the connection to the MongoDB cluster
            // await client.close();
            await mongoose.connection.close();
         }


 
     try {
      
        await mongoose.connect(uri);

         // define some dummy data and save

         /////////////////////////// users ////////////////////////////////////////////

        const user_1 = new User({ type: "USER", login_name: "a" , password: "a", path: "/USER", name: "tom"});
        await user_1.save();

        const user_2 = new User({ type: "USER", login_name: "b" , password: "b", path: "/USER", name: "harry"});
        await user_2.save();

        const user_3 = new User({ type: "USER", login_name: "c" , password: "c", path: "/USER", name: "peter"});
        await user_3.save();

        const user_4 = new User({ type: "STOREOWNER", login_name: "d" , password: "d", path: "/STOREOWNER", name: "john"});
        await user_4.save();

        const user_5 = new User({ type: "STOREOWNER", login_name: "e" , password: "e", path: "/STOREOWNER", name: "dick"});
        await user_5.save();

         /////////////////////////// tag types ////////////////////////////////////////////

        const tag_type_1 = new TagType({ tag_type_name: "services"});
        await tag_type_1.save();

         /////////////////////////// tags ////////////////////////////////////////////

        const tag_1 = new Tag({ tag_name: "FaWrench", tag_type: tag_type_1._id});
        await tag_1.save();

        const tag_2 = new Tag({ tag_name: "MdOutlineCarRepair", tag_type: tag_type_1._id});
        await tag_2.save();

        const tag_3 = new Tag({ tag_name: "FaOilCan", tag_type: tag_type_1._id});
        await tag_3.save();

        const tag_4 = new Tag({ tag_name: "MdLocalCarWash", tag_type: tag_type_1._id});
        await tag_4.save();

        const tag_5 = new Tag({ tag_name: "GiMechanicGarage", tag_type: tag_type_1._id});
        await tag_5.save();

        const tag_6 = new Tag({ tag_name: "FaCarBattery", tag_type: tag_type_1._id});
        await tag_6.save();
        
        /////////////////////////////////// locations ///////////////////////////////////////

        const location_1 = new Location({  
            address: "13880 70th ave", 
            lat: 49.1277492, 
            lng: -122.8384156, 
            info: "We are the BMW, Volvo and Mercedes experts!",
            city:     "Surrey",
            province: "British Columbia",
            country: "Canada",
            postal_code: "V3W0T3",
            phone: "604-123-5678",
            email: "joesautomotive@gmail.com",
            title: "Joes Automotive",
            workingPlan:      createWorkingDayDocuments(mockWorkingPlan),
            breaks:           createBreakDocuments(mockBreaks),
            serviceDurations: createServiceDurations([tag_1._id, tag_3._id, tag_5._id], mockDurations),
            owner: user_4._id,
            tags: [tag_1._id, tag_3._id, tag_5._id]
        });
        await location_1.save();

        const location_3 = new Location({ 
            address: "13637 72 ave", 
            lat: 49.133807, 
            lng: -122.844349, 
            info: "We know brakes and transmissions like nobody else!",
            city:     "Surrey",
            province: "British Columbia",
            country: "Canada",
            postal_code: "V3W2P2",
            phone: "604-321-8765",
            email: "budgetbreaknmuffler@gmail.com",
            title: "Budget Break and Muffler",
            workingPlan: createWorkingDayDocuments(defaultWorkingPlan),
            breaks:           createBreakDocuments([]),
            serviceDurations: createServiceDurations([tag_4._id, tag_5._id, tag_6._id], mockDurations),
            owner: user_5._id,
            tags: [tag_4._id, tag_5._id, tag_6._id]
        });
        await location_3.save();

        /////////////////////////// location tags ////////////////////////////////////////////


        /////////////////////////// appointments ////////////////////////////////////////////

         let today = new Date();
         today.setDate(today.getDate());

        const appointment_1 = new Appointment({  date: (today.toISOString().split('T')[0]), start: "11:00", end: "12:00", status:'Approved', user: user_1._id, location: location_1._id, //1
            tags: [tag_1._id, tag_3._id]});
        await appointment_1.save();

        const appointment_2 = new Appointment({  date: (today.toISOString().split('T')[0]), start: "9:00", end: "10:00", status:'Approved', user: user_2._id, location: location_1._id, //1
            tags: [tag_3._id, tag_5._id]});
        await appointment_2.save();

        const appointment_3 = new Appointment({  date: (today.toISOString().split('T')[0]), start: "14:00", end: "15:00", status:'In Progress', user: user_2._id, location: location_1._id, //2
            tags: [tag_2._id, tag_6._id]});
        await appointment_3.save();

         let tommorow = new Date();
         tommorow.setDate(tommorow.getDate()+1);

        const appointment_4 = new Appointment({  date: (tommorow.toISOString().split('T')[0]), start: "14:00", end: "15:00", status:'Completed', user: user_1._id, location: location_1._id, //1
            tags: [tag_3._id]});
        await appointment_4.save();

        const appointment_5 = new Appointment({  date: (tommorow.toISOString().split('T')[0]), start: "15:00", end: "16:00", status:'Canceled', user: user_1._id, location: location_1._id, //2
            tags: [tag_2._id, tag_4._id, tag_6._id]});
        await appointment_5.save();

        let in2Days = new Date();
        in2Days.setDate(in2Days.getDate()+2);

        const appointment_6 = new Appointment({  date: (in2Days.toISOString().split('T')[0]), start: "10:00", end: "11:00", status:'Completed', user: user_1._id, location: location_1._id, //1
            tags: [tag_3._id]});
        await appointment_6.save();

        const appointment_7 = new Appointment({  date: (in2Days.toISOString().split('T')[0]), start: "6:00", end: "7:00", status:'Canceled', user: user_1._id, location: location_1._id, //2
            tags: [tag_2._id, tag_4._id, tag_6._id]});
        await appointment_7.save();

     } finally {
         // Close the connection to the MongoDB cluster
         await mongoose.connection.close();
     }
 }



