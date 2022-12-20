
const express             = require('express');
var app                   = express();
var cors                  = require('cors');

const create_db           = require('./create_db.js')
const delete_db           = require('./delete_db.js')

const fetchGuestLocations        = require('./queries/get_locations_guest.js')
const fetchUserLocations         = require('./queries/get_locations_user.js')

const auth                        = require('./queries/auth.js')
const register                    = require('./queries/register.js')
const post_appointments_user      = require('./queries/post_appointments_user.js')
const delete_appointments_user    = require('./queries/delete_appointments_user.js')

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts/guest', function(req,res){

  console.log("/posts/guest")
  const key = "123"

  fetchGuestLocations(key).then( function(db_result){

    const res_json = formatDBResult(db_result)
    res.setHeader('Content-Type', 'application/json');
    res.send( JSON.stringify(res_json) );

  }).catch( (err)=>{

    console.log("err from database")
    console.error(err)
    res.status(500).send('Internal Server Error');

  }); 

});

const formatDBResult = (db_result) => {

  //console.log("raw db query: ", db_result)

  return {
      posts: db_result.map( (apt) => {

                  return {
                      id: String(apt._id),
                      address: apt.address, 
                      info: apt.info,
                      LatLng: { lat: apt.lat, lng: apt.lng},
                      icons: apt.tags.map( (tag) => tag.tag_name )
                  }
              })
  }  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts/user',
function(req,res){

    console.log("/posts/user")
    const key = req.query.key;

    fetchUserLocations(key, 
      function(result){

        console.log("result from /posts/user: ", result)
        res.setHeader('Content-Type', 'application/json');

        res.send( JSON.stringify(result) );

    }).catch( (err)=>{

      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');

    }); 
});


app.post('/auth',
function(req,res){

    console.log("/auth")
    
    console.log("req body",req.body)

    auth.authUser(req.body.user_name, req.body.password,
      function(result){

        console.log("result from /auth: ", result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(result) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
});

app.post('/register',
function(req,res){

    console.log("/register")
    
    console.log("req body",req.body)

    register.registerUser(
      req.body.user_name, 
      req.body.password, 
      req.body.type,
      function(result){

        console.log("result from /register: ", result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(result) );

    }).catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
});

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

/*
app.get('/query',
function(req,res){

   // db.create().catch(console.error);
   query_db.queryDB().catch(console.error).finally( (result) => res.send(result));
      console.log("1")
   // res.send(result);
});
*/


