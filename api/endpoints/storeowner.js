
const deleteStoreOwnerLocation  = require('../../database/delete/delete_location_storeowner.js')
const fetchStoreOwnerLocations  = require('../../database/read/storeowner_locations.js')

const editStoreOwnerLocation    = require('../../database/update/edit_locations_storeowner.js')
const editAppointment           = require('../../database/update/edit_appointment.js')

const createLocation            = require('../../database/create/post_locations_storeowner.js')

const editLocationWorkingDay = require('../../database/update/location_workingplan.js')

const addLocationBreak = require('../../database/create/location_break.js')

const deleteLocationBreak = require('../../database/delete/location_break.js')

const editLocationServiceDuration = require('../../database/update/location_serviceduration.js')

const fetchAppointmentAvailability = require('../../database/read/availability_appointments.js')
const fetchLocationAvailability = require('../../database/read/availability_location.js')
const { getAvailability } = require('../availability_builder.js')

const deleteLocation = (req, res) => {

    const deleteStoreOwnerLocation_format = (db_result, loc_id) => {

        if(!db_result){
            return {}
        }
    
        return {
            id: loc_id
        }                         
    }
    

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
    
        const formatServiceDurations= (sds) => sds.map(sd => ({duration: sd.duration, service: sd.service.tag_name, id: sd._id}))
    
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

const updateAppointmentStatus = (req, res) => {

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

const editLocation = (req, res) => {

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
                address:     db_result.address,
                info:        db_result.info,
                icons:       db_result.tags,
                city:        db_result.city,
                country:     db_result.country,
                email:       db_result.email,
                phone:       db_result.phone,
                postal_code: db_result.postal_code,
                province:    db_result.province,
                title:       db_result.title
            }               
        }      
    }

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

const addLocation = (req, res) => {

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

const updateWorkingPlan = (req, res)=>{
    console.log("/////////updateworkingPlan",req.body)

    const u_id = res.locals.session.auth.u_id

    if(!u_id){
        console.error("res.locals.u_id is undefined")
        res.status(500).send('Internal Server Error');
    }

    const { wp_id, start, end, location_id } = req.body

    editLocationWorkingDay(wp_id, start, end, location_id).then(function(raw_db_result){
  
          console.log("editLocation RESULT: ", raw_db_result)
  
          res.setHeader('Content-Type', 'application/json');
          //res.send( JSON.stringify({...req.body}) );
          res.send( JSON.stringify({...raw_db_result}) );
  
      }).catch( (err)=>{
  
          console.log("err from database")
          console.error(err)
          res.status(500).send('Internal Server Error');
  
      });

    
}

const addNewBreak = (req, res)=>{

    const formatResponseBody = ({_id, start, end, days}) => ({ break_id: _id, start, end, days}) 
    
    console.log("/////////addNewBreak",req.body)

    const { days, start, end, location_id } = req.body
    
    addLocationBreak(days, start, end, location_id).then(function(raw_db_result){
        //console.log("addLocationBreak RESULT: ", raw_db_result)
        res.setHeader('Content-Type', 'application/json');
        console.log("formated: ",formatResponseBody(raw_db_result))
        res.send( JSON.stringify(formatResponseBody(raw_db_result)));
    }).catch( (err)=>{
        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');
    }); 
}

const deleteBreak = (req, res)=>{

    const formatResponseBody = (raw_db_result) => ({ break_id: raw_db_result}) 

    console.log("/////////deleteBreak",req.body)

    const { break_id, location_id } = req.body

    deleteLocationBreak(location_id, break_id).then(function(raw_db_result){
        console.log("deleteLocationBreak RESULT: ", raw_db_result)
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(formatResponseBody(raw_db_result)));
    }).catch( (err)=>{
        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');
    }); 

}

const updateServiceDuration = (req, res)=>{

    const formatResponseBody = ({sd_id, duration}) => ({ sd_id, new_duration: duration}) 

    const { sd_id, new_duration } = req.body

    console.log("/////////updateServiceDuration",req.body)

    editLocationServiceDuration(sd_id, new_duration).then(function(raw_db_result){
        console.log("editLocationServiceDuration RESULT: ", raw_db_result)
        res.setHeader('Content-Type', 'application/json');

        console.log("editLocationServiceDuration format RESULT: ", formatResponseBody(raw_db_result))

        res.send(JSON.stringify(formatResponseBody(raw_db_result)));

    }).catch( (err)=>{
        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');
    }); 

}

const fetchWeekSchedule = async (req, res)=>{

    //const formatResponseBody = ({sd_id, duration}) => ({ sd_id, new_duration: duration}) 

    //const { service_duration_id, location_id, user_date, user_time } = req.body 

    // deal with time zones later; the user date and time will be in the same time zone as the store

    /*
        I ALSO NEED TO CONSIDER WORKING DAYS THAT A STORE MIGHT BE CLOSED OR HAVE MODIFIED HOURS (HOLIDAYS ETC)

      do a promise.all for:
        1: locations where location.id == loc_id for breaks, week working plan, week time slots,
        2: appointments where location.id == loc_id  that fall under today -> next 6 days where status = confirmed or requested (how to filter by date ranges on queries)
        requested appointments: should requested appointments count as closed intervals? they should but, requested appointments are meant to be moved around and rescedualed by the store owner

      3: group the appointments by date, create an empty array to hold return objects
      4: for each grouping:
        4.1: get the day of the week by creating a new date with the stores timezone (all GMT for now)
        4.2: use the dotw to check the working plan for this day to get the start/end times
            EDGE CASE: if the working plan contains no start/end date, it means the owner closed the store on that day AFTER apts were booked (or just an input error)
            when the start/end times for a store are changed, i need to check for any appointments on that day and cancel appointments that fall outside the new range OR cancel all appointmetns if store becomes closed
        4.3: use the dotw week to get the timeslots for that day
        4.4  use the dotw week to get the breaks for that day
        4.5  invoke getAvailability(...) to get an array of timeslots describing the days availability
            4.6: if the availability for all time slots is 0, it means there is no time on that day for the requested service. set timeslots to null
        4.7  add a new object to return arr: { date: ####-##-##, dotw: ###, timeslots }

      5: when all the candiate appointment days have been processed, loop the return arr and fill in the days where the store is closed with timeslots: null
    

*/

    function getNext7Days(today){
        const milliseconds_in_day = 60 * 60 * 24 * 1000;
        return [0,1,2,3,4,5,6].map(days_since_today=>new Date(today.getTime() + milliseconds_in_day*days_since_today))
    }

 
    console.log("/////////fetchWeekSchedule",req.body)


    const today = new Date(2023, 11, 4, 0) //a monday that matches the breaks/apts dummy data
    
    Promise.all([fetchAppointmentAvailability(), fetchLocationAvailability()]).then((result)=>{

        const appointments = result[0]
        const working_plan = result[1].working_plan
        const breaks = result[1].breaks
        const time_slots = result[1].time_slots

        const weeks_availability = []

        const appointments_by_date = Object.groupBy(appointments, ({date}) => date) 

        //generate the dates for the next 7 days 
        const week_dates = getNext7Days(today)

        for (const date of week_dates) {

            const date_str = date.toLocaleString().split(',')[0]
            const dotw = date.toString().split(' ')[0]
            //console.log(date.toString());

           // console.log(date.getDate());
           // console.log(date.getDay());
           // console.log(date.getMonth());
           // console.log(date.getFullYear());
           console.log(date_str);
           console.log(dotw);

           const days_working_plan = working_plan.find(({day})=>day === dotw)

           if( !days_working_plan?.start || !days_working_plan?.end ){
             console.log(dotw , " has no working plan");

             weeks_availability.push({
                date: date_str,
                dotw: dotw,
                day_availability: 0,
                sceduale: null
             })

             continue
           }

           const days_appointments = appointments_by_date[date_str] || []
           const days_breaks = breaks.filter(({days})=>days.includes(dotw))
           const days_time_slots = time_slots.filter(({days})=>days.includes(dotw))

           const sceduale = 
                getAvailability(
                    days_breaks, 
                    days_appointments, //i could filter appointments here by todays time (or do it in the query?)
                    days_time_slots[0].time_slots, 
                    days_working_plan.start, 
                    days_working_plan.end, 
                    45)

            console.log("sceduale for ", dotw)
            //console.log(sceduale)

            let average_day_availability = 0;

            if(sceduale?.length > 0){ //find the average availability for the day, or 0 (apt cant be booked on that day) 
                average_day_availability = Math.trunc( sceduale.reduce((sum, time_slot)=>sum+time_slot.availability, 0)/sceduale.length )
            }

            weeks_availability.push({
                date: date_str,
                dotw: dotw,
                day_availability: average_day_availability,
                sceduale: sceduale
            })

        }

        console.log(JSON.stringify(weeks_availability, null, 4));

    }).catch( (err)=>{
        console.log("err from database")
        console.error(err)
        //res.status(500).send('Internal Server Error');
    });



}





/*


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
*/

// fetchWorkingPlans, fetchBreaks, fetchServiceDurations, 
//////////////////////////////////////////////////////////////////////////////////////////

module.exports = { 
    deleteLocation, 
    fetchLocations, 
    updateAppointmentStatus, 
    editLocation, 
    addLocation, 
    updateWorkingPlan, 
    addNewBreak, 
    deleteBreak, 
    updateServiceDuration , 
    fetchWeekSchedule
}

  /*
        Object.keys(appointments_by_date).forEach((date)=>{

            const apts = appointments_by_date[date]

            console.log("apt////////////////////", apts)

            const dotw = getDayOfTheWeek(date)

            console.log("dotw//", dotw)

            //get the working plan, breaks, and time slots for this day
            const dotw_breaks = breaks.filter(({days})=>days.includes(dotw))

            //console.log("dotw_breaks//", dotw_breaks)

            const dotw_working_plan = working_plan.filter(({day})=>day === dotw)

            // console.log("dotw_working_plan//", dotw_working_plan)

            const dotw_time_slots = time_slots.filter(({days})=>days.includes(dotw))
            
            // console.log("dotw_time_slots//", dotw_time_slots)

            const sceduale = 
                getAvailability(
                    dotw_breaks, 
                    apts, 
                    dotw_time_slots[0].time_slots, 
                    dotw_working_plan[0].start, 
                    dotw_working_plan[0].end, 
                    45)

            console.log("sceduale for ", dotw)
            //console.log(sceduale)

            let average_day_availability = 0;

            if(sceduale?.length > 0){ //find the average availability for the day, or 0 (apt cant be booked on that day) 
                average_day_availability = Math.trunc( sceduale.reduce((sum, time_slot)=>sum+time_slot.availability, 0)/sceduale.length )
            }

            weeks_availability.push({
                date: date,
                dotw: dotw,
                day_availability: average_day_availability,
                sceduale: sceduale
            })

            console.log("////////////////////////////////////////////////")
        //console.log("weeks_availability: ", weeks_availability)
        })
        */
        //fill in the remaining days of the week where the store is closed with 0 availability

       // console.log(JSON.stringify(weeks_availability, null, 4));