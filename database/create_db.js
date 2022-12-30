const mongoose = require('mongoose');
const uri      = "mongodb://127.0.0.1:27017/appointment_bookings";

//const { Schema } = mongoose

const {User, Location, TagType , Tag , LocationTag , Appointment } = require('./models.js');

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

        const user_1 = new User({ type: "user", login_name: "a" , password: "a", path: "/user", name: "tom"});
        await user_1.save();

        const user_2 = new User({ type: "user", login_name: "b" , password: "b", path: "/user", name: "harry"});
        await user_2.save();

        const user_3 = new User({ type: "user", login_name: "c" , password: "c", path: "/user", name: "peter"});
        await user_3.save();

        const user_4 = new User({ type: "storeowner", login_name: "d" , password: "d", path: "/storeowner", name: "john"});
        await user_4.save();

        const user_5 = new User({ type: "storeowner", login_name: "e" , password: "e", path: "/storeowner", name: "dick"});
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

        const location_1 = new Location({  address: "abc ave 123456", lat: 43.919617760254686, lng: -0.8844604492, info: "some info stuffs 0",
            owner: user_4._id,
            tags: [tag_1._id, tag_3._id, tag_5._id]
        });
        await location_1.save();

        const location_2 = new Location({  address: "abc ave 7891011", lat: 47.919617760254686, lng: -0.7844604492, info: "some info stuffs 1",
            owner: user_4._id,
            tags: [tag_2._id, tag_4._id, tag_6._id]
        });
        await location_2.save();

        const location_3 = new Location({ address: "abcdef ave 12131415", lat: 50.919617760254686, lng: -0.7844604492, info: "some info stuffs 2",
            owner: user_5._id,
            tags: [tag_4._id, tag_5._id, tag_6._id]
        });
        await location_3.save();

        /////////////////////////// location tags ////////////////////////////////////////////

        /*

        const location_tag_10 = new LocationTag({ location: location_1._id, tag: tag_1._id});
        await location_tag_10.save();

        const location_tag_11 = new LocationTag({ location: location_1._id, tag: tag_2._id});
        await location_tag_11.save();

        const location_tag_12 = new LocationTag({ location: location_1._id, tag: tag_3._id});
        await location_tag_12.save();


        const location_tag_20 = new LocationTag({ location: location_2._id, tag: tag_2._id});
        await location_tag_20.save();

        const location_tag_21 = new LocationTag({ location: location_2._id, tag: tag_4._id});
        await location_tag_21.save();

        const location_tag_22 = new LocationTag({ location: location_2._id, tag: tag_6._id});
        await location_tag_22.save();


        const location_tag_30 = new LocationTag({ location: location_3._id, tag: tag_1._id});
        await location_tag_30.save();

        const location_tag_31 = new LocationTag({ location: location_3._id, tag: tag_3._id});
        await location_tag_31.save();

        const location_tag_32 = new LocationTag({ location: location_3._id, tag: tag_5._id});
        await location_tag_32.save();

        */

         /////////////////////////// appointments ////////////////////////////////////////////

         //['Pending', 'In Progress', 'Completed', 'Canceled']

        const appointment_1 = new Appointment({  date: "10/10/22", start: "9:00", end: "10:00", status:'Pending', user: user_1._id, location: location_1._id});
        await appointment_1.save();

        const appointment_2 = new Appointment({  date: "10/11/22", start: "11:00", end: "12:00", status:'Pending', user: user_1._id, location: location_1._id});
        await appointment_2.save();

        const appointment_3 = new Appointment({  date: "10/11/22", start: "8:00", end: "9:00", status:'In Progress', user: user_1._id, location: location_2._id});
        await appointment_3.save();

        const appointment_4 = new Appointment({  date: "1/1/22", start: "2:00", end: "5:00", status:'Completed', user: user_2._id, location: location_1._id});
        await appointment_4.save();

        const appointment_5 = new Appointment({  date: "8/2/22", start: "2:00", end: "5:00", status:'Canceled', user: user_2._id, location: location_2._id});
        await appointment_5.save();

     } finally {
         // Close the connection to the MongoDB cluster
         await mongoose.connection.close();
     }
 }



