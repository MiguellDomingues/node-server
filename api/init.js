const session                        = require('./session.js')
const routes                         = require('./routes')

const resolve = ( (_path) => {

    const path = _path

    return function(req, res, next) {

        const _session = session.getSession(req.query.key)
        const user_type = _session.type
        res.locals.u_id = _session.u_id
        

        console.log(req.method, path, _session.u_id, user_type)
        
        try{
            routes[path][req.method][user_type](req, res, next)
        }
        catch(err){
            console.error("error in resolver() function. path: ", path, " session: ", _session,  err)
            res.status(500).send('Internal Server Error');
        }
    }
})

module.exports = init = (app, router) => {

   console.log(Object.keys(routes))

   Object.keys(routes).forEach( (route) => app.use('/'+ route.toLowerCase(), resolve(route) ) )

}






