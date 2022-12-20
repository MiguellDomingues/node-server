const { User } = require('../models.js');
var mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

const buildResponse = (db_result) => {

    console.log("register: raw db result: ", db_result)

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

module.exports.registerUser = async function registerUser(
    login_name, 
    password,
    type,
    callback) {
   
    await mongoose.connect(uri);

    try {  

        console.log(login_name, "//",
            password, "//",
            type,)

        User.create({ 
            login_name: login_name, 
            password:   password,
            type:       type,
            path:       '/' + type
         }, function (err, new_user) {
            if (err){
                console.log("create err", err)         
            }

            mongoose.connection.close();
            callback( buildResponse(new_user) )  
                        
        });

     } catch(err) { throw err } 
 }