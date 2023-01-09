const _session                        = require('./session.js')
const routes                         = require('./routes')

const resolve = ( (_path) => {

    const path = _path

    return function(req, res, next) {

        const key = req.query.key

        const session = _session.getSession(key) 
        const user_type = session.auth.type

        res.locals.session = session

        console.log("resolving route()", req.method, path, session , user_type)

        //validate user type in acl here
        
        try{
            routes.JSON[path][req.method][user_type](req, res, next)
        }
        catch(err){
            console.error("error in resolver() function. path: ", path, " session: ", _session,  err)
            res.status(500).send('Internal Server Error');
        }
    }
})

module.exports = init = (app, router) => {

   console.log(Object.keys(routes.JSON))
   
   Object.keys(routes.JSON).forEach( (route) => app.use('/'+ route.toLowerCase(), resolve(route) ) )

}






