const _session                        = require('./session.js')
const routes                         = require('./routes')

/*
return a list of distinct string routes that resolve to a method on the rootJSON object

params: 
    routesJSON: the object definition for the endpoint routes. see routes.js
return:
    an Array of Strings representing routes consumable by Express.js ie: ["/routeA", "/routeA/routeAA", "/routeB"...]
*/
function getStringRoutes(routesJSON){

    /*
    recursively traverse the routesJSON and generate the string routes (delimited with /) that are consumable by express.js
    edgecase: each starting route has a //, so I just clean them up with replace("//", "/")
    params:
        rootStr: the running name of the route
        routeObjs: the array of key names for the current object
    return:
        all routes from the current level, appending it to the previous levels list  
    */
    function f(rootStr, routeObjs){

        const METHODS = [`POST`, `PATCH`, `GET`, `DELETE`, 'PUT'];
        let addedMethod = false;
        let routes = [];

        for(routeStr in routeObjs){
            if(!METHODS.includes(routeStr)){ //if the current level has a nested route, recourse to the next level
                routes = routes.concat ( f(`${rootStr}/${routeStr}`, routeObjs[routeStr]) );
            }else if(!addedMethod){ //when we encounter a method, we only need to add it once to the routes
                routes.push(`${rootStr}`);
                addedMethod = !addedMethod;
            }           
        }
        return routes;      
    }

    let stringifiedRoutes = [];

    stringifiedRoutes = f(`/`, routesJSON).map(s=>s.replace("//", "/"));

    console.log("stringifiedRoutes: ", stringifiedRoutes);

    return stringifiedRoutes;
}

/*
get a nested object reference from the routes definition JSON

params: 
    stringifiedRoute: a route string containing 0 or more nested routes (/route or /routeB/routeC)
    routesJSON: the object definition for the endpoint routes. see routes.js
return:
    the nested object reference from rootJSON that can be invoked with object[method][user_type]
*/
function getRootObject(stringifiedRoute, rootJSON){

    if(stringifiedRoute.length === 0){
        throw new Error("getRootObject: stringifiedRoute can not be an empty string")
    }

    stringifiedRoute = stringifiedRoute.slice(1) //REMOVE THE LEADING "/" 

    let rootObject = rootJSON
    console.log("stringifiedRoute: ", stringifiedRoute)

    stringifiedRoute.split("/").forEach(path=>{
        console.log("// ",path)
        rootObject = rootObject[path]     
    })

    return rootObject
}

/*
implements dynamic routing based on the contents of the routesJSON object

returns a closure which gets invoked when the corresponding route in express.js gets invoked
the closure then resolves the method/user_type to invoke the matching function in the routesJSON object
*/
const routeResolver = ( (path, routesJSON) => {
    return function(req, res, next) {


        console.log("header key",req.headers.key);

        const key = req.headers.key//req.query.key

        //console.log("query key: ", req.query.key);

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
  getStringRoutes(routes.JSON).forEach( (route) => {app.use(route.toLowerCase(), routeResolver(route, routes.JSON))})
}
 /*

 console.log("old")
    Object.keys(routes.JSON).forEach( (route) => {
        console.log('/'+ route.toLowerCase())
        app.use('/'+ route.toLowerCase(), resolve(route) )
        })

function getStringRoutesOLD(routesJSON){

    function f(rootStr, routeObjs){
        const METHODS = [`POST`, `PATCH`, `GET`, `DELETE`, 'PUT']
        let addedMethod = false;
        let routes = [];

        for(routeStr in routeObjs){
            if(!METHODS.includes(routeStr)){
                routes = routes.concat ( f(`${rootStr}/${routeStr}`, routeObjs[routeStr]) );
            }else if(!addedMethod){
                routes.push(`/${rootStr}`); // all a leading / to all routes
                //routes.push(`${rootStr}`);
                addedMethod = !addedMethod;
            }           
        }
        return routes;         
    }

    let stringifiedRoutes = []

    Object.keys(routesJSON).forEach((rootStr)=>stringifiedRoutes = stringifiedRoutes.concat(f(rootStr, routesJSON[rootStr])))

    console.log("stringifiedRoutes: ", stringifiedRoutes)

    return stringifiedRoutes
}

*/
