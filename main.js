
const express             = require('express');
var app                   = express();
var cors                  = require('cors');

const create_db                   = require('./database/create_db.js')
const delete_db                   = require('./database/delete_db.js')

const GET = require('./endpoints/GET.js')
const POST = require('./endpoints/POST.js')
const DELETE = require('./endpoints/DELETE.js')

const delete_appointments_user    = require('./database/queries/delete_appointments_user.js')

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

app.get('/posts/guest', GET.guestLocations)

app.get('/posts/user', GET.userLocations)

app.post('/auth', POST.validateLogin)

app.post('/register', POST.registerNewUser)

app.post('/appointment', POST.addUserAppointment)

/*
app.post('/appointment',
function(req,res){

    console.log("/post appointment")
    
    console.log("req body",req.body)

    post_appointments_user.postAppointment(
      req.body.loc_id, 
      req.body.user_id, 
      req.body.date,
      req.body.start_time, 
      req.body.end_time,
      function(result){

        console.log("result from post /appointment: ", result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(result) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
});
*/

app.delete('/appointment',
function(req,res){

    console.log("/delete appointment")
    
    console.log("req body",req.body)

  try{

    delete_appointments_user.deleteAppointment(
      req.body.apt_id, 
      req.body.user_id, 
      function(result){

        console.log("result from post /delete appointment: ", result)

        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(result) );
    })

  }catch(err){
    console.log("database err from deleteAppointment")
    console.error(err)
    res.status(500).send('Internal Server Error');
  }

});



