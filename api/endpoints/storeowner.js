const { v4: uuidv4 } = require('uuid');
const deleteStoreOwnerLocation  = require('../../database/delete/delete_location_storeowner.js')
const fetchStoreOwnerLocations  = require('../../database/read/storeowner_locations.js')

const editStoreOwnerLocation    = require('../../database/update/edit_locations_storeowner.js')
const editAppointment           = require('../../database/update/edit_appointment.js')

const createLocation            = require('../../database/create/post_locations_storeowner.js')

const mockWorkingPlan = [
    {
        day: "Monday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Tuesday",
        start: "06:00",
        end:   "16:00",
    },
    {
        day: "Wednesday",
        start: "08:00",
        end:   "18:00",
    },
    {
        day: "Thursday",
        start: "08:00",
        end:   "16:00",
    },
    {
        day: "Friday",
        start: "12:15",
        end:   "14:30"
    },
    {
        day: "Saturday",
        start: "",
        end:   ""
    },
    {
        day: "Sunday",
        start: "",
        end:   ""
    },
]

let mockBreaks = [
    {
        days: ["Mon", "Tue", "Wed", "Thu","Fri"],
        start: "10:15",
        end: "10:30"
    },
    {
        days: ["Mon", "Tue", "Wed", "Thu",],
        start: "12:00",
        end: "13:00"
    },
    {
        days: ["Fri"],
        start: "11:00",
        end: "11:30"
    },
]

const mockServiceDurations = [
    {
       type: "MdOutlineCarRepair",
       duration: "45"
    },
    {
        type: "FaWrench",
        duration: "25"
     },
     {
        type: "FaOilCan",
        duration: "30"
     }, 
]


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteLocation = (req, res) => {

    console.log("/delete location")
    
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    deleteStoreOwnerLocation(req.body.loc_id, u_id)
    .then( function(raw_db_result){

        const res_json = deleteStoreOwnerLocation_format(raw_db_result, req.body.loc_id)

       res.setHeader('Content-Type', 'application/json');
       res.send( JSON.stringify(res_json) );
    })
    .catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
    
}

const deleteStoreOwnerLocation_format = (db_result, loc_id) => {

    if(!db_result){
        return {}
    }

    return {
        id: loc_id
    }                         
}

////////////////////////////////////////////////////////////////////////////////////

const fetchLocations = (req,res) => {

    const storeOwnerLocations_format = (db_result) => {

        const formatAppointments = (apts) => apts.map(apt => {
            apt.appointment_types = apt.tags.map(tag=>tag.tag_name)   
            apt.id = String(apt._id)
            apt.appointee = apt.user[0].name 
            delete apt._id
            delete apt.tags
            delete apt.user
            return apt
        })
    
        const formatWorkingPlan = (wps) => wps.map(wp => {
            wp.id = String(wp._id)
            delete wp._id
            return {...wp}
        })
    
        const formatBreaks = (breaks) => breaks.map(b => {
            b.id = String(b._id)
            delete b._id
            return {...b}
        })
    
        const formatServiceDurations= (sds) => sds.map(sd => ({duration: sd.duration, service: sd.service.tag_name}))
    
        return { 
            posts: db_result.map( loc => {
                //console.log("///////////loc: ", loc)
               // console.log("loc: ", loc.serviceDurations)
                //console.log("loc: ", loc.results.input)
                return {
                    id:               String(loc._id), 
                    address:          loc.address, 
                    info:             loc.info,
                    LatLng:           { lat: loc.lat, lng: loc.lng},
                    city:             loc.city,
                    country:          loc.country,
                    province:         loc.province,
                    postal_code:      loc.postal_code,
                    phone:            loc.phone,
                    email:            loc.email,
                    title:            loc.title,
                    workingPlan:      formatWorkingPlan(loc.workingPlan),
                    breaks:           formatBreaks(loc.breaks),
                    serviceDurations: formatServiceDurations(loc.serviceDurations),
                    appointments:     formatAppointments(loc.appointments),
                    icons:            loc.tags.map( (tag) => tag.tag_name )
                }
            })        
        }  
    }

    console.log("/posts/storeowner")


    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    console.log("STOREOWNER KEY: ", u_id)
  
    fetchStoreOwnerLocations(u_id).then ( function(result){

        console.log(result)

        const res_json = storeOwnerLocations_format(result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
        
    }).catch( (err)=>{

      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');

    }); 
}

/////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////// editAppointmentStatus

const updateAppointmentStatus = (req, res) => {

    console.log("/patch appointment (storeowner)")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }

    const storeowner_id =  u_id
    const apt_id = req.body.apt_id
    const status = req.body.new_status

    //res.send( JSON.stringify(req.body) );

    editAppointment(storeowner_id, apt_id, status).then(function(raw_db_result){
  
          const res_json = updateAppointmentStatus_format(raw_db_result)

          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
      });
      
}

const updateAppointmentStatus_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {                      
        appointment:{
            id: String(db_result._id),
            status: db_result.status
        }               
    }      
}

//////////////////////////////////////////////////////////////////////////////////////

const editLocation = (req, res) => {

    console.log("/patch location")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
    
    const storeowner_id = u_id
    const location = req.body.location

    editStoreOwnerLocation (storeowner_id,location).then(function(raw_db_result){
  
          const res_json = editStoreOwnerLocation_format(raw_db_result)

          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
  
      });
}

const editStoreOwnerLocation_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {                      
        location:{
            id: String(db_result._id),
            LatLng: {
                lat: db_result.lat,
                lng: db_result.lng
            },
            address: db_result.address,
            info:    db_result.info,
            icons:   db_result.tags,
        }               
    }      
}

const addLocation = (req, res) => {

    console.log("/post location")
        
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
 
    createLocation (
        u_id,
        req.body.info,
        req.body.address, 
        req.body.LatLng.lat,
        req.body.LatLng.lng,  
        [...req.body.icons]
        ).then(function(raw_db_result){
  
          const res_json = createLocation_format(raw_db_result)

          console.log("CREATE LOCATION RESULT: ", res_json)
  
          res.setHeader('Content-Type', 'application/json');
          res.send( JSON.stringify(res_json) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
  
      });

}

const createLocation_format = (db_result) => {

    if(!db_result){
        return {}
    }

    return {                      
        location:{
            id: String(db_result._id),
            LatLng: {
                lat: db_result.lat,
                lng: db_result.lng
            },
            address: db_result.address,
            info:    db_result.info,
            icons:   db_result.tags,
            appointments: []
        }               
    }   
      
}

const fetchWorkingPlans = (req, res)=>{
    console.log(res.locals.session)
    res.send( JSON.stringify({ workingPlan: [...mockWorkingPlan]}) );
}

const fetchBreaks = (req, res)=>{
    console.log(res.locals.session)
    const  _mockBreaks = mockBreaks.map((b)=>( {...b, id: uuidv4() } )) //temp
    res.send( JSON.stringify({ breaks: [..._mockBreaks]}) );
}

const fetchServiceDurations = (req, res)=>{
    console.log(res.locals.session)
    res.send( JSON.stringify({ serviceDurations: [...mockServiceDurations ]}) );
}

//////////////////////////////////////////////////////////////////////////////////////////

module.exports = { deleteLocation, fetchLocations, updateAppointmentStatus, editLocation, addLocation, fetchWorkingPlans, fetchBreaks, fetchServiceDurations}