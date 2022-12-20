const { User } = require('../models.js');
let db = require('../database.js')

module.exports = async function auth(login_name, password) {

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{

            User.
            findOne({login_name: login_name, password: password},
                'login_name password type path')
                .then( (result) => { resolve(result)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });

    })
}