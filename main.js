
const express             = require('express');
const router              = express.Router()
var app                   = express();
var cors                  = require('cors');

const create_db                   = require('./database/create_db.js')
const delete_db                   = require('./database/delete_db.js')

const init                        = require('./api/init.js')

app.use( cors() );          // allow react app communicate with server on same machine/diff port
app.use( express.json() );  // this is needed to access req.body in 'post' methods
const port = 8080;

//app.use('/', router)

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

init(app, router)





