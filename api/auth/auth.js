
const auth                          = require('../../database/read/auth.js')
const register                      = require('../../database/create/register.js')
const session                       = require('../session.js')

const log = require('../../utils/logger.js')

/////////////////////////////////////////////////////////////

const validateLogin = (req,res, next) => {

    console.log("/auth")
    
    console.log("req body",req.body)

    log("validateLogin", "validateLogin", req.body)

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
            key: session.startSession(String(db_result._id), db_result.type),
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
            key: session.startSession(String(db_result._id), db_result.type),
            path: db_result.path      
        }      
}

////////////////////////////////////////////////////////////////////////////////////////



module.exports = { validateLogin, registerNewUser }