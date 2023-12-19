const { Location } = require('../models.js');
let db = require('../database.js')


module.exports = async function fetchLocationAvailability(location_id, service_id) {   

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{

            Location.
            findOne({"_id": location_id},'workingPlan breaks serviceDurations').lean()
                .then( (result) => { 
                    if(!result) throw new Error(`location_id ${location_id} not found`)
                    const duration = result.serviceDurations.find(sd=>sd._id.toString() === service_id)?.duration
                    if(!duration) throw new Error(`service_id ${service_id} not found`)
                    resolve({
                        working_plan: result.workingPlan,
                        breaks: result.breaks,
                        time_slots: time_slots,
                        duration: duration 
                    })
                })
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }


const working_plan = [
{
    day: "Mon",
    start: "08:00",
    end: "17:00"
},
{
    day: "Tue",
    start: "08:00",
    end: "17:00"
}, {
    day: "Wed",
    start: "08:00",
    end: "17:00"
},
{
    day: "Thu",
    start: "08:00",
    end: "17:00"
}, {
    day: "Fri",
    start: "09:00",
    end: "14:00"
},
{
    day: "Sat",
    start: "",
    end: ""
},
{
    day: "Sun",
    start: "",
    end: ""
}
]

const breaks = [
{
    days: ["Mon","Tue","Wed","Thu"],
    start: "09:00",
    end: "09:15"
},
{
    days: ["Mon","Tue","Wed","Thu"],
    start: "12:00",
    end: "13:00"
},
{
    days: ["Fri"],
    start: "11:00",
    end: "11:30"
},
]

const time_slots = [ //assume buckets are sorted start->end

{ 
days: ["Mon", "Tue", "Wed", "Thu"],
time_slots: [  
    {desc: "late morning",   start: "10:00", end:"12:00"}, 
    {desc: "late afternoon", start: "14:00", end:"17:00"},
    {desc: "early afternoon",start: "12:00", end:"14:00"}, 
    {desc: "early morning",  start: "08:00", end:"10:00"}
]
},
{ 
days: ["Fri"],
time_slots: [  
    {desc: "morning",   start: "9:00", end:"12:00"}, 
    {desc: "afternoon", start: "12:00", end:"14:00"},
]
}

]