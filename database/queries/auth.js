const { User } = require('../models.js');
var mongoose = require('mongoose');

const uri = "mongodb://127.0.0.1:27017/appointment_bookings";

const buildResponse = (db_result) => {

    console.log("auth: raw db result: ", db_result)

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

module.exports.authUser = async function authUser(login_name, password, callback) {
   
    await mongoose.connect(uri);

    try {  

        User.
            findOne({login_name: login_name, password: password},
                'login_name password type path').
                    exec(function (err, user) {
                            if (err) console.error(err);

                            console.log('user: ', user);
                            
                            mongoose.connection.close();
                            callback( buildResponse(user) )                  
                    });

     } catch(err) { 
        //console.log("err")
        throw err 
    }
 }