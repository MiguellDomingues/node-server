const auth                          = require('./.././database/queries/auth.js')
const register                      = require('./.././database/queries/register.js')
const createAppointment             = require('./.././database/queries/post_appointments_user.js')

const addUserAppointment = (req, res) => {

console.log("/post appointment")
    
    console.log("req body",req.body)

    createAppointment (
      req.body.loc_id, 
      req.body.user_id, 
      req.body.date,
      req.body.start_time, 
      req.body.end_time).then(function(raw_db_result){

        const res_json = createAppointment_format(raw_db_result)

        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const createAppointment_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            appointment:{
                id:         String(db_result._id),
                loc_id:     String(db_result.location),
                date:       db_result.date,
                start:      db_result.start,
                end:        db_result.end, 
            }               
        }      
}


/////////////////////////////////////////////////////////////

const validateLogin = (req,res) => {

    console.log("/auth")
    
    console.log("req body",req.body)

    auth(req.body.user_name, req.body.password).then ( function(raw_db_result){

            const res_json = valiadateLogin_format(raw_db_result)
            res.setHeader('Content-Type', 'application/json');
            res.send( JSON.stringify(res_json) );

        }).catch( (err)=>{

            console.log("err from database")
            console.error(err)
            res.status(500).send('Internal Server Error');

    });
}

const valiadateLogin_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

////////////////////////////////////////////////////////////

const registerNewUser = (req,res) => {

    console.log("/register")
    
    console.log("req body",req.body)

    register(req.body.user_name, req.body.password, req.body.type)
    .then( function(raw_db_result){

        const res_json = registerNewUser_format(raw_db_result)     
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const registerNewUser_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            type: db_result.type,
            key:  String(db_result._id),
            path: db_result.path      
        }      
}

////////////////////////////////////////////////////////////////////////////////////////

module.exports = { validateLogin, registerNewUser, addUserAppointment, }