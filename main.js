
const express             = require('express');
var app                   = express();
var cors                  = require('cors');

const create_db                   = require('./database/create_db.js')
const delete_db                   = require('./database/delete_db.js')

const GET                         = require('./endpoints/GET.js')
const POST                        = require('./endpoints/POST.js')
const DELETE                      = require('./endpoints/DELETE.js')
const PATCH                       = require('./endpoints/PATCH.js')

app.use( cors() );          // allow react app communicate with server on same machine/diff port
app.use( express.json() );  // this is needed to access req.body in 'post' methods
const port = 8080;

app.listen(port, () => {
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

app.get('/posts/guest',      GET.guestLocations)
app.get('/posts/user',       GET.userLocations)
app.get('/posts/storeowner', GET.storeOwnerLocations)

app.post('/auth',           POST.validateLogin)
app.post('/register',       POST.registerNewUser)
app.post('/appointment',    POST.addUserAppointment)
app.post('/location',       POST.addStoreOwnerLocation)

app.patch('/location',      PATCH.editStoreOwnerLocation)

app.delete('/appointment',  DELETE.cancelUserAppointment)

// app.get('/config, GET.config)




