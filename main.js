
const express             = require('express');
const router              = express.Router()
var app                   = express();
var cors                  = require('cors');

const create_db                   = require('./database/create_db.js')
const delete_db                   = require('./database/delete_db.js')

const init                        = require('./api/init.js')

app.use( cors() );          // allow react app communicate with server on same machine/diff port
app.use( express.json() );  // this is needed to access req.body in 'post' methods
const { PORT } = require('./utils/constants.js');

app.listen(PORT, () => {
  console.log("server running")
});

app.get('/create',
function(req,res){
    create_db.createDB().catch(console.error);
    res.send('created');
});

app.get('/delete',
function(req,res){
    delete_db.deleteDB().catch(console.error);
    res.send('deleted');
});

init(app, router)

/*

  const AuthTypes = {
    StoreOwner: 'STOREOWNER',
    User:       'USER',
    NoAuth:     'GUEST'
  }

  //private/   authuser(key) / (locations/a/b/c/d/e/(params) ) /get

  const routes = {

        locations:{
          get: [
            { 
              params: [':param1'], 
              auth: {acl: [ [AuthTypes.StoreOwner] }
              controller: { b } 
            },
          ],
          
        },  
}


const public = {

  locations:{
    get: [
      { params: [':param1'], controller: c
      },],

    
    
  },  

}


const private = {

post: [
            { params: [], controller: c, auth:  [AuthTypes.StoreOwner]  },       
          ],
          patch: [
            { params: [], controller: d, auth:  [AuthTypes.StoreOwner]  },
          ],
          delete: [
            { params: [], controller: e, auth:  [AuthTypes.StoreOwner]  },
          ],

    
      STOREOWNER:{
        locations:{
          get: {params: ['param1'], controller: a, auth: {} },
          post: b,
          patch: c,
          delete: d,
        }

      },
      USER:{
        locations:{
          get: {params: ['param2'], controller: e},
        }
      }
}
*/














