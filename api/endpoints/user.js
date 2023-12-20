const deleteAppointment             = require('../../database/delete/delete_appointments_user.js')
const fetchUserLocations            = require('../../database/read/get_locations_user.js')
const createAppointment             = require('../../database/create/post_appointments_user.js')

const fetchAppointmentAvailability = require('../../database/read/availability_appointments.js')
const fetchLocationAvailability = require('../../database/read/availability_location.js')

const { getAvailability, hourMinutesStringtoTotalMinutes } = require('../availability_builder.js')

const cancelAppointment = (req, res) => {

    console.log("/delete appointment")
    
    console.log("req body",req.body)

    const u_id = res.locals.session.auth.u_id

    if(!u_id){
        console.error("res.locals.u_id is undefined")
        res.status(500).send('Internal Server Error');
    }

    deleteAppointment(req.body.apt_id, u_id)
    .then( function(raw_db_result){

        const res_json = deleteAppointment_format(raw_db_result)

        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
    })
    .catch( (err)=>{

        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');

    });
}

const deleteAppointment_format = (db_result, apt_id) => {

    if(db_result.deletedCount !== 1){
        return {}
    }

    return {
        apt_id: apt_id
    }                         
}

////////////////////////////////////////////////////////////////////////////////////

const fetchLocations = (req,res) => {

    console.log("/posts/user")
    
    //const key = req.query.key;

    console.log("user session: ", res.locals.session)

    const key = res.locals.session.auth.u_id

    console.log("USER KEY: ", key)
  
    fetchUserLocations(key).then ( function(result){

        console.log(result)

        const res_json = fetchUserLocations_format(result)
        res.setHeader('Content-Type', 'application/json');
        res.send( JSON.stringify(res_json) );
        
    }).catch( (err)=>{

      console.log("err from database")
      console.error(err)
      res.status(500).send('Internal Server Error');

    }); 
}



const fetchUserLocations_format = (db_result) => {

    //console.log(db_result)

    const formatServiceDurations= (sds) => sds.map(sd => ({duration: sd.duration, service: sd.service.tag_name, id: sd._id}))

    return {
        
        posts: db_result.map( (loc) => {

                    return {
                        id: String(loc._id), 
                        address: loc.address, 
                        info: loc.info,
                        LatLng: { lat: loc.lat, lng: loc.lng},
                        country: loc.country,
                        city: loc.city,
                        province: loc.province,
                        postal_code: loc.postal_code,
                        phone: loc.phone,
                        email: loc.email,
                        title: loc.title,

                        serviceDurations: formatServiceDurations(loc.serviceDurations),
                        
                        appointments: loc.appointments.map( (apt) => {
                            apt.appointment_types = apt.tags.map(tag=>tag.tag_name)               
                            apt.id = String(apt._id)                  
                            delete apt._id
                            delete apt.tags
                            return apt
                        } ),
                        icons: loc.tags.map( (tag) => tag.tag_name )
                    }
                })
                
    }  
}

//////////////////////////////////////////////////////////////////////////////////////////

const addAppointment = (req, res) => {

    console.log("/post appointment")
        
        console.log("req body",req.body)
        
        const u_id = res.locals.session.auth.u_id

        if(!u_id){
            console.error("res.locals.u_id is undefined")
            res.status(500).send('Internal Server Error');
        }
        
        createAppointment (
          req.body.loc_id, 
          u_id,
          req.body.date,
          req.body.start_time, 
          req.body.end_time,
          req.body.apt_types).then(function(raw_db_result){
    
            const res_json = createAppointment_format(raw_db_result)
    
            res.setHeader('Content-Type', 'application/json');
            res.send( JSON.stringify(res_json) );
    
        }).catch( (err)=>{
    
            console.log("err from database")
            console.error(err)
            res.status(500).send('Internal Server Error');
    
        });
}
    
const createAppointment_format = (db_result) => {

        if(!db_result){
            return {}
        }

        return {                      
            appointment:{
                id:         String(db_result._id),
                loc_id:     String(db_result.location),
                date:       db_result.date,
                start:      db_result.start,
                end:        db_result.end,
                status:     db_result.status
            }               
        }      
}
    
    
const fetchWeekSchedule = async (req, res)=>{

    //?s_id=${service_id}&l_id=${location_id}&dt=${date_time}

    

    const user_id = res.locals.session.auth.u_id

    console.log(req.query.s_id, req.query.l_id, req.query.dt, user_id)

    const date = new Date(parseInt(req.query.dt))

    console.log(date.toString())

    const service_id = req.query.s_id
    const location_id = req.query.l_id

    

    //const location_id = "657f6325fd889192b66917c5"

    //const service_id = "657f6325fd889192b66917c4"
    

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
    
    Promise.all([fetchAppointmentAvailability(), fetchLocationAvailability(location_id, service_id)]).then((result)=>{

        const [ 
            appointments, 
            { working_plan, breaks, time_slots, duration }
        ] = result
 
        console.log(duration)

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

             continue;
           }

           const days_appointments = appointments_by_date[date_str] || []
           const days_breaks = breaks.filter(({days})=>days.includes(dotw))
           const days_time_slots = time_slots.filter(({days})=>days.includes(dotw))

           const _time_slots = days_time_slots[0].time_slots

           console.log()

           const time_slots_availability = 
                getAvailability(
                    days_breaks, 
                    days_appointments, //i could filter appointments here by todays time (or do it in the query?)
                    _time_slots,
                    //days_time_slots[0].time_slots, 
                    days_working_plan.start, 
                    days_working_plan.end, 
                    duration)

            const average_day_availability = Math.trunc( time_slots_availability.reduce((sum, ts)=>sum+ts.availability, 0)/time_slots_availability.length )


          console.log(JSON.stringify(time_slots_availability, null, 4));

            weeks_availability.push({
                date: date_str,
                dotw: dotw,
                day_availability: average_day_availability,
                sceduale: time_slots_availability
            })

        }

      //  console.log(JSON.stringify(weeks_availability, null, 4));

        res.setHeader('Content-Type', 'application/json');

        res.send( JSON.stringify({possible_bookings: weeks_availability}));

    }).catch( (err)=>{
        console.log("err from database")
        console.error(err)
        res.status(500).send('Internal Server Error');
    });



}



 

module.exports = { cancelAppointment, fetchLocations, addAppointment, fetchWeekSchedule }