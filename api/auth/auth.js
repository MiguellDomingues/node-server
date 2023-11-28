
const auth                          = require('../../database/read/auth.js')
const register                      = require('../../database/create/register.js')
const session                       = require('../session.js')


/////////////////////////////////////////////////////////////

const validateLogin = (req,res, next) => {

    console.log("/auth")
    
    console.log("req body",req.body)

    const {user_name, password} = req.body

    auth(user_name, password).then (function(raw_db_result){

        const res_json = valiadateLogin_format(raw_db_result)
        console.log("auth response", res_json)

        if(Object.keys(res_json).length === 0){
            console.log("bad creds", res_json)
            res.status(403).send(JSON.stringify({ error: 'Provided Credentials Not Found'}))
        }else{
            console.log("OK", res_json)
            res.setHeader('Content-Type', 'application/json');
            res.send( JSON.stringify(res_json) );
        }


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

const LogOutSession = (req,res) =>{

    console.log("logout session")

    const key = req.headers.key

    if(session.endSession(key)){
        res.send(JSON.stringify('session successfully ended'));
    }else{
        res.send(JSON.stringify('session key not found. end session anyways'));
    }

}

////////////////////////////////////////////////////////////////////////////////////////



module.exports = { validateLogin, registerNewUser,LogOutSession }