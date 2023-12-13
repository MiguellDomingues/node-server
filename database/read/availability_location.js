const { Location } = require('../models.js');
let db = require('../database.js')


module.exports = async function fetchLocationAvailability() {   

    return new Promise( (resolve, reject) => {

        setTimeout(() => {
            resolve({
                working_plan: working_plan,
                breaks: breaks,
                time_slots: time_slots,
            })
        }, 1000);
   
    })
 }

 //const DAY_NAMES = ['Monday','Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
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


//break intervals CAN NOT overlap
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

 /*
 module.exports = async function fetchLocationsGuest(key) {   

    return new Promise( (resolve, reject) => {

        db.connect().then( ()=>{
            Location.
            find({})
            .populate('tags')
                .then( (locations) => { resolve(locations)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }
 */