const auth = require('./.././database/queries/auth.js')


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

module.exports = { validateLogin }