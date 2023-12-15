const  assert = require('node:assert/strict');

const MAX_MINUTES_IN_DAY = 60*23 + 59

class Interval {

  constructor(start, end){

    if(typeof start === "string")this.start = hourMinutesStringtoTotalMinutes(start);
    else this.start = start || 0
    

    if(typeof end === "string")this.end =   hourMinutesStringtoTotalMinutes(end);
    else this.end = end || 0
    
    
    assert.equal(this.end >= 0 && this.start >= 0 , true, `start ${this.start} end ${this.end } must be > 0`)
    assert.equal(this.start <= this.end, true, `start ${this.start} must be < end ${this.end }`)
    assert.equal(this.end <= MAX_MINUTES_IN_DAY , true, `end ${this.end} must be <= ${MAX_MINUTES_IN_DAY}`)
  }

  get duration(){
    return this.end-this.start;
  }

  startToHoursMinutesString(){
    return Interval.totalMinutesToHoursMinutesString(this.start)
  }

  endToHoursMinutesString(){
    return Interval.totalMinutesToHoursMinutesString(this.end)
  }

  static totalMinutesToHoursMinutesString(totalMins){
    return `${new String(Math.floor(totalMins/60)).padStart(2, '0')}:${new String(totalMins%60).padStart(2, '0') }`
  }

  toString(){
    return `start: ${this.startToHoursMinutesString()} end: ${this.endToHoursMinutesString()}`
  }


}

/*

input:  arr of Intervals in the form {start: int, end: int}
return: a sorted copy of the array (toSorted)
*/
function sortIntervals(intervals = []){
  return intervals.toSorted((interval1,interval2)=>interval1.start - interval2.start)
}
  
/*
validate and convert a string into total minutes
input: a string representing a time in 24 hour format: 00:00->23:59 WITH a leading zero on single digits
*/
function hourMinutesStringtoTotalMinutes(timeString){
  const regex = new RegExp(`^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$`);
  assert.equal(regex.test(timeString), true, ` time string ${timeString} must be 00:00->23:59 format`)

  return parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])
} 



/*
find the available appointment slots for each time slot

  open_intervals:    a list of sorted intervals 
  service_duration:  length of appointment service in minutes
  time_slots:        a list of sorted intervals

constaints: 
  time_slots.length > 0
  time_slots[0].start <= open_intervals[0].start
  time_slots[time_slots.length-1].end >= open_intervals[open_intervals.length-1].end

return: 
  an array with 0-n integers, each index representing availability for the matching index for time_slots

*/
function getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals){

  open_intervals = open_intervals ?? [];
  time_slot_intervals = time_slot_intervals ?? [];

  //assert.equal(time_slot_intervals && time_slot_intervals.length > 0, true, "time slots cant be empty");
  assert.equal(service_duration > 0, true, "service_duration must be greater then 0");
  
  open_intervals = open_intervals.filter((interval)=> interval.duration >= service_duration) //remove open intervals that are shoter than the service_duration
  
  if(open_intervals.length === 0){ //if there are no open intervals, just return an array of 0's 
    return new Array(time_slot_intervals.length).fill(0)
  }
//validate timeslots by converting to open intervals and checking for open intervals; should be empty
  const time_slot_availabilities = []
  
  const getAvailabilitySlots = (minutes) => Math.trunc( minutes/service_duration)

  let open_intervals_index = 0;
  let overflow = 0;

  time_slot_intervals.forEach(time_slot=>{

    //const b_start = bucket.start;
    const time_slot_end = time_slot.end;
  
    //console.log("bucket: ", time_slot, "///////////////////////")

    let bucket_total = 0

    if(overflow > 0){ //any intervals that overran the last buckets end time will have the difference place in this bucket
     // console.log("overflow ", overflow)
      const overflow_for_this_bucket = Math.min( overflow, time_slot.duration) //the most overflow we can take would be the bucket capacity 

      //?? do i need to add extra time for service durations in case of overflows that overrun bucket capacity?
    //  console.log("overflow for this bucket", overflow_for_this_bucket)

      bucket_total = getAvailabilitySlots ( overflow_for_this_bucket ) //get the availability from the overflow
      overflow = overflow - overflow_for_this_bucket //and decrement the overflow
    //  console.log("added overflow to total ", bucket_total)
    }

    //if there is still overflow after the above op, it means an open interval extends past this bucket boundary and the bucket is filled. go to the next bucket
    //when the overflow is empty, walk the intervals to fill the current bucket until the interval falls outside the bucket or there are no intervals
    while(overflow === 0 && open_intervals_index < open_intervals.length){  

      const open_interval = open_intervals[open_intervals_index]
      const open_interval_start = open_interval.start
      const open_interval_end = open_interval.end

     // console.log("***current interval :", open_interval)
    //  console.log("***open_interval_start:",  open_interval_start  , "time_slot_end: ", time_slot_end)

      //when the interval is 0% inside this bucket, including edges, then we are done processing this bucket
      if(open_interval_start >= time_slot_end){//if the interval needs to be placed into the next bucket
       // console.log("***current interval needs to be checked in the next bucket")
        break;
      }

     // console.log("***open_interval_end:",  open_interval_end  , "time_slot_end: ", time_slot_end)

      //interval begins in this bucket and ends in some other bucket; 
      if(open_interval_end > time_slot_end){ 
       // console.log("***the open interval overflows the bucket")
        const non_overflow =  time_slot_end - open_interval_start // find the section of the interval that lies within this bucket
        overflow = open_interval_end - time_slot_end // find the section of the interval that lies outside this bucket
        
        //if the part of the interval overflowing into next bucket is too small to fit an apt..
        // AND the part of the interval within this bucket is too small to fit an apt..
        if(overflow < service_duration && non_overflow < service_duration){ 
          //still allow the user to book into THIS bucket (because we have enough time on this interval)
          //otherwise user would be denied booking, even though this interval has time
          bucket_total = bucket_total + getAvailabilitySlots ( service_duration )
        }else{
          //if the overflow exeeds service duration (book within next bucket)
          //or the non-overflow is large enough to fit at least one apt into this bucket
          bucket_total = bucket_total + getAvailabilitySlots ( non_overflow ) //should always be >= 1
        }

       // console.log("***overflow: ", overflow, " non-overflow: ", non_overflow) //"reserve: ", reserv

      }else{ //interval is 100% inside this bucket
      //  console.log("***this interval fits within the bucket")
        bucket_total = bucket_total + getAvailabilitySlots ( open_interval_end - open_interval_start )//otherwise put the open interval into this bucket and check the next one
       // console.log("total", bucket_total)
      }

      open_intervals_index++

        // console.log("***checking next interval")
    }

    //console.log("///processed current bucket: ", bucket_total)
    time_slot_availabilities.push(bucket_total)
  })

  return time_slot_availabilities
}
  
  
/*
find the availability percentages for each time slot

inputs:
total_availability_time_slots:    time slots containing total availability
adjusted_availability_time_slots: time slots containing adjusted availability

contraints:
total_availability_time_slots[i].availability >= adjusted_availability_time_slots[i].availability
total_availability_time_slots.length === adjusted_availability_time_slots.length

return: 
an arr of ints 0-100 inclusive of the same length of input arrs
*/
function getTimeSlotAvailabilityPercentages(total_availabilities = [], adjusted_availabilities = []){

  assert.equal(total_availabilities.length === adjusted_availabilities.length, true, `all input should be the same size`)

  const availability_time_slots = []

  for(let i = 0; i < total_availabilities.length; i++){

      //const time_slot_interval = time_slots[i]
      const total_availability = total_availabilities[i];
      const adjusted_availability = adjusted_availabilities[i];

      //const availability_time_slot = {
      //  availability: 0,
      //  start: time_slot_interval.startToHoursMinutesString(),
      //  end:   time_slot_interval.endToHoursMinutesString(),
     // }

      assert.equal(total_availability >= 0 && adjusted_availability >= 0, true, `total/adjusted availability can't be negative`)
      assert.equal(adjusted_availability <= total_availability, true, ` adjusted availability <= total_availability`)

      if( total_availability !== 0 && adjusted_availability !== 0 ){ //if neither the total availability or adjusted availability was 0
        availability_time_slots.push(Math.trunc( (adjusted_availability/total_availability)*100 ) )
      }else{
        availability_time_slots.push(0)
      }
  
  }

  return availability_time_slots

}
  

/*
find the open times between the open/close time and an array of close intervals

input:
  intervals:        arr of closed intervals {start: ##:## end: ##:##}
  min_max_interval: represents the open time->close time of a store

constraints: 

  open_time <= intervals[0].start
  min_max_interval.end >= intervals[intervals.length-1].end, 
  intervals[i].end < intervals[i+1].end (no overlapping intervals)

returns: 
  1 or more open intervals (open/close time counts as an interval)

runtime: 0(nlogn + n)
*/
function getOpenIntervals(intervals = [], min_max_interval){

  const open_intervals = [] //store the open intervals between open_time->interval[0].start, (interval[i].end->interval[i+1].start) ... interval[n].end -> end_open

  if(!min_max_interval){
    return open_intervals
  }

  //add an open interval that has > 0 difference between the start/end time
  function addOpenInterval(start, end){

    //if there is exclusive overlap in any break/apt intervals, the assert will trigger
      const interval = new Interval(start, end) 
      //i may change this to try/catch and if theres overlap, just ignore it without adding new interval

      if(interval.duration > 0){
        open_intervals.push(interval)
      }  
  }

  if(!intervals || intervals.length === 0){ //if there are no breaks or appointments, the open/close time is the only open interval
      addOpenInterval(min_max_interval.start, min_max_interval.end)
      return open_intervals;
  }

  const copied_sorted_intervals = sortIntervals( intervals ) //sort/copy the input arr

  addOpenInterval(min_max_interval.start, copied_sorted_intervals[0].start) //add the open time->first close interval

  let i = 1;
  //if there are more then 1 closed interval, get the times between intervals
  while(i < copied_sorted_intervals.length){ 
      addOpenInterval(copied_sorted_intervals[i-1].end, copied_sorted_intervals[i].start)
      i++;
  }

  //console.log(copied_sorted_intervals[copied_sorted_intervals.length-1].end, min_max_interval.end)
  addOpenInterval(copied_sorted_intervals[copied_sorted_intervals.length-1].end, min_max_interval.end) //add the last time -> close time interval

  return  open_intervals
}

/*
valid times slots are in the form:
(store_open_time, A)(A, B)(B,C)..(Tn, store_close_time) 
ie (0, 60)(60, 120), (0, 120)
this should return an empty arr for getOpenIntervals()
*/
function areTimeSlotsValid(time_slot_intervals, min_max_interval){

return(
  time_slot_intervals 
  && //validate non-null/non-enpty arr
  time_slot_intervals.length > 0 
  &&  //validate store open/close = first/last times in time slots
  time_slot_intervals[0].start === min_max_interval.start 
  &&
  time_slot_intervals[time_slot_intervals.length-1].end === min_max_interval.end 
  && //validate no open gaps between time slot intervals
  getOpenIntervals(time_slot_intervals, min_max_interval).length === 0
)

}

//const toSortedIntervals = (time_objs) => sortIntervals( time_objs.map(({start, end})=>new Interval(start, end)) )

const toIntervals = (time_objs) => time_objs.map(({start, end})=>new Interval(start, end)) 

//const puts = (...any) => console.log(...any.map(String));
  
function getAvailability(breaks, appointments, time_slots, start_time, end_time, requested_service_duration){

    //convert and validate inputs
    const time_slot_intervals = sortIntervals( toIntervals(time_slots) )
    const store_open_to_close = new Interval(start_time, end_time)

    assert.equal(areTimeSlotsValid(time_slot_intervals, store_open_to_close), true, 
      "time slots must be an arr of intervals (s1, e1)(s2, e2)...(sn, en) where s1 = store open time and en = store close time");
    
    const break_intervals =       toIntervals(breaks)
    const appointment_intervals = toIntervals(appointments)
    
    //first get the slots with only the breaks to find the max slots
    const time_between_breaks =        getOpenIntervals(break_intervals, store_open_to_close);

    // ..then get the total availabilities for each time slot
    const total_availability =         getTimeSlotAvailabilities(time_between_breaks, requested_service_duration, time_slot_intervals);

    //..then merge the break slots with the confirmed, requested appointments for today to get the adjusted number of slots
    const time_between_appointments =  getOpenIntervals(break_intervals.concat(appointment_intervals),  store_open_to_close);

    //..then get the adjusted availabilities with both breaks and appointments
    const adjusted_availabilities =    getTimeSlotAvailabilities(time_between_appointments, requested_service_duration, time_slot_intervals);

    // compare/validate total w/ adjusted to get the availability percentages for each time slot
    const availability_percentages =   getTimeSlotAvailabilityPercentages(total_availability, adjusted_availabilities);

    return availability_percentages;
    //return null;

    /*
    return getTimeSlotAvailabilityPercentages(
      getTimeSlotAvailabilities(
          getOpenIntervals(break_intervals,store_open_to_close), 
            requested_service_duration, 
              time_slot_intervals
          ),
        getTimeSlotAvailabilities(
          getOpenIntervals(break_intervals.concat(appointment_intervals), store_open_to_close), 
            requested_service_duration, 
              time_slot_intervals)
    )
    */
}


module.exports = { 
    getAvailability, 
    getTimeSlotAvailabilityPercentages,
    sortIntervals, 
    getOpenIntervals, 
    getTimeSlotAvailabilities,
    hourMinutesStringtoTotalMinutes,
    sortIntervals,
    Interval,
    //toSortedIntervals,
    areTimeSlotsValid,
    MAX_MINUTES_IN_DAY
  }
  

/*







    //i need to ensure no overlapping overvals (overlap becomes merged)

  function getAvailability(open_intervals = [], service_duration){

    //if(open_intervals.length === 0){
     // return 0
   // }

    if(service_duration <= 0){
      throw new Error("service_durations can not be negative or 0")
    }

    const possible_service_intervals =  open_intervals.filter(chunk=>chunk.duration >= service_duration)

    //console.log("filtered intervals", possible_service_intervals)

    const availability = possible_service_intervals.reduce((sum, interval)=>sum + Math.trunc(interval.duration/service_duration), 0)

    return availability

  } 

  if(totalAvailability === 0 || adjustedAvailability === 0){
    console.log("no availability")
    //return from the loop thats processing a days scedule
    return;
  }

  //console.log( Math.trunc( (adjustedAvailability/totalAvailability)*100 ), "% availability" )

  const appointmentRanges = intervalsBetweenApts.map(apt=>{ //i need the appointments AFTER they are filtered

    const HHMM = totalMinutesToHoursMinutes (hourMinutesStringtoTotalMinutes(apt.end) - requested_service_duration)

    return{
    start: apt.start,
    end:  `${HHMM.h}:${HHMM.m}`
    }
  })
 */
