const _session                        = require('./session.js')
const routes                         = require('./routes')

//given a path string, traverse the route JSON object 

/*
params: 
    stringifiedRoute: a route string containing 0 or more nested routes (routeA) or (routeB/routeC)


*/
function getRootObject(stringifiedRoute, rootJSON){

    let rootObject = rootJSON
    console.log("stringifiedRoute: ", stringifiedRoute)

   // stringifiedRoute.split("/").slice(1).forEach(path=>{
    stringifiedRoute.split("/").forEach(path=>{
        console.log("// ",path)
        rootObject = rootObject[path]
        
    })

    return rootObject
}

/*
return a closure which 
*/
const resolve = ( (_path, routesJSON) => {

    const path = _path

    return function(req, res, next) {

        const key = req.query.key

        const session = _session.getSession(key) 
        const user_type = session.auth.type

        res.locals.session = session

        console.log("session", session)

        console.log("resolving route()", path, req.method, user_type)

        const invokedObj = getRootObject(path, routesJSON)

        console.log("///the object that we are invoking [req.method][user_type] ", invokedObj)

        //validate user type in acl here

        //turns the path, method, user_type into strings that dereference the JSON object on the endpoint function
        //the 'path' string must resolve to the object with the method
        try{
            //routes.JSON[path][req.method][user_type](req, res, next)
            invokedObj[req.method][user_type](req, res, next)
        }
        catch(err){
            console.error("error in resolver() function. path: ", path, " session: ", _session,  err)
            res.status(500).send('Internal Server Error');
        }
    }
})

module.exports = init = (app, router) => {

//getStringRoutes(routes.JSON)

  // console.log(Object.keys(routes.JSON))

  console.log("new")
  getStringRoutes(routes.JSON).forEach( (route) => {
    //console.log("route: ", '/' + route.toLowerCase())
    //console.log("param: ", route.toLowerCase())
    app.use('/'+ route.toLowerCase(), resolve(route, routes.JSON) )

    //app.use(route.toLowerCase(), resolve(route, routes.JSON) )
    })

     /*
    console.log("old")
    Object.keys(routes.JSON).forEach( (route) => {
        console.log('/'+ route.toLowerCase())
        app.use('/'+ route.toLowerCase(), resolve(route) )
        })
 */
 
}

function getStringRoutes(JSON){

    function f(rootStr, routeObjs){
        const METHODS = [`POST`, `PATCH`, `GET`, `DELETE`]
        let addedMethod = false;
        let routes = [];

        for(routeStr in routeObjs){
            if(!METHODS.includes(routeStr)){
                routes = routes.concat ( f(`${rootStr}/${routeStr}`, routeObjs[routeStr]) );
            }else if(!addedMethod){
                //routes.push(`/${rootStr}`);
                routes.push(`${rootStr}`);
                addedMethod = !addedMethod;
            }           
        }
        return routes;         
    }

    let stringifiedRoutes = []

    Object.keys(JSON).forEach((rootStr)=>stringifiedRoutes = stringifiedRoutes.concat(f(rootStr, JSON[rootStr])))

   
   // console.log("stringifiedRoutes: ", getRootObject(stringifiedRoutes, JSON))

  //  console.log("stringifiedRoutes: ", getRootObject(stringifiedRoutes, JSON))


    return stringifiedRoutes

}






