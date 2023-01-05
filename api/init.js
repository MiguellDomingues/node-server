const _session                        = require('./session.js')
const routes                         = require('./routes')



const resolve = ( (_path) => {

    const path = _path

   // change guest to NO_AUTH
    return function(req, res, next) {

        const key = req.query.key

        const session = key && _session.getSession(key) 

        console.log("session: ", session)

        let user_type = undefined

        if (session && session.auth.u_id){
            res.locals.session = session
            user_type = session.auth.type
        }else{
            user_type = _session.getNoAuth().auth.type
        }

        console.log("ut: ", user_type)
        
        //const user_type = session.type
        //res.locals.u_id = session.u_id
    
        console.log("resolving route()", req.method, path, session , user_type)
        
        try{
            //routes[path][req.method][user_type](req, res, next)
            routes.resolve(path, req.method, user_type)(req, res, next)
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






