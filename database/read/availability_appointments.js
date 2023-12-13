const { Appointment } = require('../models.js');
let db = require('../database.js')

module.exports = async function fetchAppointmentAvailability() {   

    return new Promise( (resolve, reject) => {

        setTimeout(() => {
            resolve(appointments)
        }, 1000);
   
    })
 }

const appointments = [
/*
//mondays
{
    date: "2023-12-04",
    start: "10:30",
    end: "10:55" //B
},
{
    date: "2023-12-04",
    start: "14:00",
    end: "14:45" //C
},
{
    date: "2023-12-04",
    start: "15:25",
    end: "16:10" //C
},

//tuesdays
{
    date: "2023-12-05",
    start: "10:30",
    end: "10:55" //B
},
{
    date: "2023-12-05",
    start: "14:00",
    end: "14:45" //C
},
{
    date: "2023-12-05",
    start: "15:25",
    end: "16:10" //C
},

//wendsdays

{
    date: "2023-12-06",
    start: "10:30",
    end: "10:55" //B
},
{
    date: "2023-12-06",
    start: "14:00",
    end: "14:45" //C
},
{
    date: "2023-12-06",
    start: "15:25",
    end: "16:10" //C
},
*/

//thursdays

{
    date: "2023-12-07",
    start: "10:30",
    end: "10:55" //B
},
{
    date: "2023-12-07",
    start: "14:00",
    end: "14:45" //C
},
{
    date: "2023-12-07",
    start: "15:25",
    end: "16:10" //C
},
{
    date: "2023-12-07",
    start: "16:10",
    end: "16:55" //C
},


//fridays
{
    date: "2023-12-08",
    start: "9:00",
    end: "9:15" //A
},
{
    date: "2023-12-08",
    start: "10:30",
    end: "10:55" //B
},
{
    date: "2023-12-08",
    start: "13:00",
    end: "13:45" //C
},

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