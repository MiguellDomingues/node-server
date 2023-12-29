const  assert = require('node:assert/strict');
const _ = require('lodash');

const { 
    Interval, 
    //areTimeSlotsValid,
    toIntervals,
    mergeIntervals,
    getOpenIntervals,
    sortIntervals,
    splitCountOverlapIntervals,
} = require('./intervals.js')


class AvailabilityService {

    sorted_merged_break_intervals = [];
    sorted_appointment_intervals = [];
    sorted_time_slot_intervals = [];
    start_end_interval = null;
    service_duration = 0;
    service_capacity = 0;

    constructor(
        breaks, 
        appointments, 
        time_slots, 
        start_time, 
        end_time, 
        service_duration,
        service_capacity){

            assert.equal(_.isInteger(service_duration) && service_duration > 0, true, `service_duration ${service_duration} must be integer > 0`)
            assert.equal(_.isInteger(service_capacity) && service_capacity > 0, true, `service_capacity ${service_capacity} must be integer > 0`)

            this.service_duration =               service_duration;
            this.service_capacity =               service_capacity;
            this.sorted_appointment_intervals =   sortIntervals(toIntervals(appointments));
            this.sorted_merged_break_intervals =  sortIntervals(toIntervals(breaks));
            this.sorted_time_slot_intervals =     sortIntervals(toIntervals(time_slots));
            this.start_end_interval =             new Interval(start_time, end_time);

            assert.equal(this.#areTimeSlotsValid(), true, 
            `time slots must be an arr of intervals (s1, e1)(s2, e2)...(sN, eN)
             where e(N) = s(N+1) and s1 = store open time and eN = store close time`);

    }

    #areTimeSlotsValid(){

        return(
          this.sorted_time_slot_intervals 
          && //validate non-null/non-enpty arr
          this.sorted_time_slot_intervals.length > 0 
          &&  //validate store open time = first start time
          this.sorted_time_slot_intervals[0].start === this.start_end_interval.start 
          && //validate store close time = last end time
          this.sorted_time_slot_intervals[this.sorted_time_slot_intervals.length-1].end === this.start_end_interval.end 
          && //check in between intervals for i1.end == 12.start
          (() => { 
            for(let i = 1; i < this.sorted_time_slot_intervals.length; i++)
              if (this.sorted_time_slot_intervals[i-1].end !== this.sorted_time_slot_intervals[i].start) return false 
            return true
          })())        
    }

}


/*
finds the availability % for each time slot object in time_slots

inputs:
  breaks:           arr of objects {start: "##:##", end: "##:##"}                    
  appointments:     arr of objects {start: "##:##", end: "##:##"} 
  time_slots:       arr of objects {start: "##:##", end: "##:##"}
  start_time:       a time in the form "##:##"
  end_time:         a time in the form "##:##"
  service_duration: a time in minutes

constraints:
  "##:##" is a string representing a time in the day in 24 hr format
  time_slots is an arr
  start_time >= end_time
  service_duration > 0
  service_duration <= time_slots[n]

returns: 
  an arr of the original time slot objects, sorted, with each time slot object appended with:
  open_times: arr of 0-n ascending ints representing a time that may be booked for appointment
  availability: an int 0-100 representing how much appointment capacity is on the time_slot
*/
function getAvailability(breaks, appointments, time_slots, start_time, end_time, service_duration){

    const getArrLength = (arr) => arr ? arr.length : 0
  
    //convert and validate inputs
    const time_slot_intervals = toIntervals(sortIntervals( time_slots ))
    const store_open_to_close = new Interval(start_time, end_time)
  
    assert.equal(areTimeSlotsValid(time_slot_intervals, store_open_to_close), true, 
      "time slots must be an arr of intervals (s1, e1)(s2, e2)...(sn, en) where s1 = store open time and en = store close time");
    
    const break_intervals =       toIntervals(breaks)
    const appointment_intervals = toIntervals(appointments)
    
    //first get the slots with only the breaks to find the max slots
    const time_between_breaks =        getOpenIntervals(break_intervals, store_open_to_close);
  
    console.log(" time_between_breaks",time_between_breaks)
    // ..then get the total availabilities for each time slot
    const total_availability =         getTimeSlotAvailabilities(time_between_breaks, service_duration, time_slot_intervals);
  
    console.log(" total_availability", total_availability)
  
    
    //..then merge the break slots with the confirmed, requested appointments for today to get the adjusted number of slots
    const time_between_appointments =  getOpenIntervals(break_intervals.concat(appointment_intervals),  store_open_to_close);
  
    console.log(" time_between_appointments",time_between_appointments)
    //..then get the adjusted availabilities with both breaks and appointments
    const adjusted_availabilities =    getTimeSlotAvailabilities(time_between_appointments, service_duration, time_slot_intervals);
  
    console.log(" adjusted_availabilities",adjusted_availabilities)
    // compare/validate total w/ adjusted to get the availability percentages for each time slot
  
    const availability_percentages =  getTimeSlotAvailabilityPercentages(total_availability.map(getArrLength), adjusted_availabilities.map(getArrLength));
  
    console.log(" availability_percentages",availability_percentages)
  
    //NOTE: THIS WILL BREAK IF THE ORIGINAL INPUT TIME SLOTS ARE NOT ALREADY SORTED; the wrong data will get appended for each time slot
    const return_object = time_slot_intervals.map((ts,i)=>({
      start: ts.start, end: ts.end, desc: time_slots[i].desc , open_times: adjusted_availabilities[i], availability: availability_percentages[i]}))
  
    console.log(" return_object",return_object)
  
    return return_object
  
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
  
/*
get the max number of possible appointments of service_duration length for each passed in time slot
*/
function getTotalAvailability(break_intervals, time_slot_intervals, start_end_interval, service_duration, service_capacity){

    const getTimeSlotCapacity = (arr) => arr ? arr.length*service_capacity : 0

    //get the open spans of time between breaks and open/close times
    const open_intervals = getOpenIntervals(break_intervals, start_end_interval);

    // ..get the availabilities for each time slot
    const time_slot_availabilities = getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals);

    // console.log(" total_availability", time_slot_availabilities)

    // for each time slot, count the availability and * by the service capacity
    const time_slot_capacities = time_slot_availabilities.map(getTimeSlotCapacity)

    return time_slot_capacities
}

/*
get the possible appointment times for each time slot
remove the gettimeslotavailability() and rename to getAvailableTimeIntervals or something
appointment_intervals, break_intervals, start_end_interval, service_capacity
*/
function getAdjustedAvailability(appointment_intervals, break_intervals, time_slot_intervals, start_end_interval, service_duration, service_capacity){

    //1) sort the appointment intervals
    const sorted_apts = sortIntervals(appointment_intervals)//this should be sorted from caller

    //2) split and count the overlapping intervals 
    const split_apts = splitCountOverlapIntervals(sorted_apts)

    //3) get the intervals without capacity for an appointment and normalize into interval objs
    const intervals_without_capacity = split_apts.filter(({overlap})=>overlap >= service_capacity).map(iwc=>iwc.interval)

    //4) get the open spans of time between the no-capacity intervals and the open/close times
    const open_intervals = getOpenIntervals(intervals_without_capacity, start_end_interval)

    //5) now we need to consider the breaks
    //combine/sort the open intervals with the breaks
    const open_intervals_breaks = sortIntervals(open_intervals.concat(break_intervals))

    //6) split these combined intervals to reveal overlaps 
    const split_breaks_open_intervals = splitCountOverlapIntervals(open_intervals_breaks)

    //7) remove the spans of time which overlap with a break and normalize into interval objs
    const intervals_without_breaks = split_breaks_open_intervals.filter(({overlap})=>overlap < 2).map(i=>i.interval)

    //we are left with spans of time that cover the entire work day that both dont have breaks and dont overlap over the capacity
    //8) get the availabilities for each time_slot
    const time_slot_availabilities = getTimeSlotAvailabilities(intervals_without_breaks, service_duration, time_slot_intervals);

    return time_slot_availabilities;

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
find the available appointment slots for each time slot

  open_intervals:    a list of sorted intervals 
  service_duration:  length of appointment service in minutes
  time_slots:        a list of sorted intervals

constaints: 
  time_slots.length > 0
  time_slots[0].start <= open_intervals[0].start
  time_slots[time_slots.length-1].end >= open_intervals[open_intervals.length-1].end

return: 
  an array of time_slots length, each containing an array with 0-n integers, each index representing a time where an apt may be booked

*/
function getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals){

    //console.log("*****************START*********************")
    open_intervals = open_intervals ?? [];
    time_slot_intervals = time_slot_intervals ?? [];
    service_duration = service_duration ?? 0
  
    assert.equal(service_duration > 0, true, "service_duration must be greater then 0");
    assert.equal(service_duration <= time_slot_intervals[0].duration, true, "service_duration can not exceed the duration of a time slot");
   
    open_intervals = open_intervals.filter((interval)=> interval.duration >= service_duration) //remove open intervals that are shoter than the service_duration
    
    if(open_intervals.length === 0){ //if there are no open intervals, just return an array of empty arrays for each time slot 
      return new Array(time_slot_intervals.length).fill([])
    }
  
    
  //validate timeslots by converting to open intervals and checking for open intervals; should be empty
    const time_slot_availabilities = []
    
    //const getAvailabilitySlots = (minutes) => Math.trunc( minutes/service_duration)
  
    const getAvailabilitySlots = (interval_start, interval_end) => {
  
      //console.log("gas start:  ", interval_start, " end:", interval_end)
      //console.log("datatypes:  ", typeof interval_start, " ", typeof interval_end)
  
      const slots = []
  
      while(interval_start + service_duration <= interval_end)
      {
       // console.log("loop s:  ", interval_start)
        slots.push( interval_start )
        interval_start+=service_duration 
       // console.log("loop e:  ", interval_start)   
      }
     
      
      
     // console.log("gas end:  ", slots)
      return slots
    }
  
    let open_intervals_index = 0;
    let overflow = 0;
  
    time_slot_intervals.forEach(time_slot=>{
  
      //const b_start = bucket.start;
      const time_slot_end = time_slot.end;
    
      //console.log("bucket: ", time_slot, "///////////////////////")
  
      let bucket_total = []
  
      if(overflow > 0){ //any intervals that overran the last buckets end time will have the difference place in this bucket
       // console.log("overflow ", overflow)
        const overflow_for_this_bucket = Math.min( overflow, time_slot.duration) //the most overflow we can take would be the bucket capacity 
  
        //?? do i need to add extra time for service durations in case of overflows that overrun bucket capacity?
      //  console.log("overflow for this bucket", overflow_for_this_bucket)
        bucket_total = getAvailabilitySlots (  time_slot.start, time_slot.start + overflow_for_this_bucket ) 
  
       // bucket_total = getAvailabilitySlots ( overflow_for_this_bucket ) //get the availability from the overflow
        overflow = overflow - overflow_for_this_bucket //and decrement the overflow
       // console.log("added overflow to total ", bucket_total)
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
        //  console.log("***overflow: ", overflow, " non-overflow: ", non_overflow) 
          //if the part of the interval overflowing into next bucket is too small to fit an apt..
          // AND the part of the interval within this bucket is too small to fit an apt..
          if(overflow < service_duration && non_overflow < service_duration){ 
            //still allow the user to book into THIS bucket (because we have enough time on this interval)
            //otherwise user would be denied booking, even though this interval has time
            bucket_total = bucket_total.concat( getAvailabilitySlots (open_interval_start, open_interval_start + service_duration ) )
          }else{
            //if the overflow exeeds service duration (book within next bucket)
            //or the non-overflow is large enough to fit at least one apt into this bucket
            bucket_total = bucket_total.concat( getAvailabilitySlots ( open_interval_start, non_overflow + open_interval_start ) )//should always be >= 1
          }
  
         // console.log("***overflow: ", overflow, " non-overflow: ", non_overflow) 
  
        }else{ //interval is 100% inside this bucket
         // console.log("***this interval fits within the bucket: s", open_interval_start, "e: ",open_interval_end)// - open_interval_start
          bucket_total = bucket_total.concat( getAvailabilitySlots (open_interval_start, open_interval_end ) )//otherwise put the open interval into this bucket and check the next one
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
valid times slots are in the form:
(store_open_time, A)(A, B)(B,C)..(Tn, store_close_time) 
ie (0, 60)(60, 120), (0, 120)

function areTimeSlotsValid(time_slot_intervals, min_max_interval){

    return(
      time_slot_intervals 
      && //validate non-null/non-enpty arr
      time_slot_intervals.length > 0 
      &&  //validate store open time = first start time
      time_slot_intervals[0].start === min_max_interval.start 
      && //validate store close time = last end time
      time_slot_intervals[time_slot_intervals.length-1].end === min_max_interval.end 
      && //check in between intervals for i1.end == 12.start
      (() => { 
        for(let i = 1; i < time_slot_intervals.length; i++)
          if (time_slot_intervals[i-1].end !== time_slot_intervals[i].start) return false 
        return true
      })())
      
}
*/

module.exports = { 
    getTimeSlotAvailabilityPercentages,
    getTimeSlotAvailabilities,
    getAvailability,
    getTotalAvailability,
    getAdjustedAvailability,
    AvailabilityService,
   // areTimeSlotsValid,
}