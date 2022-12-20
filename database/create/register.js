const { User } = require('../models.js');
let db = require('../database.js')

module.exports = async function register(login_name, password, type) {
   
    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{

            User.create({ 
                login_name: login_name, 
                password:   password,
                type:       type,
                path:       '/' + type})
                .then( (result) => { resolve(result)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
}