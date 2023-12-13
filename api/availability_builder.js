//import assert from "node:assert/strict";

/*
input:  arr of objcts in the form {start: ##:##, end: ##:## } where ##:## is a string representing a time in 24 hour format
return: a copy of the sorted array (toSorted)
*/
function sortIntervals(intervals = []){

    //turn a string representing a time ##:## (00:00)->(23:59) into an integer between 0-2359
    const timeStringToInteger = (time_str) =>{
      const split = time_str.split(":")
      return parseInt(`${split[0]}${split[1]}`)
    }
  
    return intervals.toSorted((interval1,interval2)=>timeStringToInteger(interval1.start) - timeStringToInteger(interval2.start))
  
}
  
function getMinutesBetweenStringTimes (start, end) {

diff = hourMinutesStringtoTotalMinutes(end) - hourMinutesStringtoTotalMinutes(start)

if(diff < 0) throw new Error(`${start} > ${end}`)

// const diff = Math.abs(hourMinutesStringtoTotalMinutes(lhs) - hourMinutesStringtoTotalMinutes(rhs))
return diff;
}
  
//const timeStrToHoursMinutes = (timeStr) => ({h: parseInt(timeStr.split(":")[0]), m: parseInt(timeStr.split(":")[1])})

const hourMinutesStringtoTotalMinutes = timeString => parseInt(timeString.split(":")[0])*60 + parseInt(timeString.split(":")[1])

//const totalMinutesToHoursMinutes = totalMins => ({h: Math.floor(totalMins/60) , m: totalMins%60})

/*
find the available appointment slots for each time slot

  open_intervals:    a list of sorted intervals {start: ##:##, end: ##:##}
  service_duration:  length of appointment service in minutes
  time_slots:        a list of sorted intervals, {start: ##:##, end: ##:##, availability: 0}

constaints: 
  time_slots[0].start <= open_intervals[0].start
  time_slots[time_slots.length-1].end >= open_intervals[open_intervals.length-1].end

return: 
  a copy of time_slots where each time_slot may have 0->n availabile slots to fit an appointment

do more testing on this; fixed a bug to distribute availability across several buckets when intervals cross 2 or more buckets
*/
function getTimeSlotAvailabilities(open_intervals = [], service_duration, time_slots = []){

    open_intervals = open_intervals.filter((oi)=> getMinutesBetweenStringTimes(oi.start, oi.end) >= service_duration) //remove open intervals that are shoter than the service_duration
    
    const copied_sorted_time_slots =  sortIntervals(time_slots).map(b=>({...b, availability: 0})) //sort and hard copy the time slots with an availability prop
  
    if(open_intervals?.length === 0){ //if there are no open intervals, just return the time_slots with no availability
      return copied_sorted_time_slots;
    }
  
    const getAvailabilitySlots = (minutes) => Math.trunc( minutes/service_duration)
  
    let open_intervals_index = 0;
    let overflow = 0;
  
    let open_interval, open_interval_start, open_interval_end
  
    //there will always be at least ONE BUCKET: open time to close time
    copied_sorted_time_slots.forEach(bucket=>{
  
      const b_start = bucket.start;
      const b_end = bucket.end;
  
      //console.log("///////bucket: ", bucket, "///////////////////////")
  
      let bucket_total = 0
  
      if(overflow > 0){ //any intervals that overran the last buckets end time will have the difference place in this bucket
        //console.log("overflow ", overflow)
        const overflow_for_this_bucket = Math.min( overflow, getMinutesBetweenStringTimes(b_start, b_end)) //the most overflow we can take would be the bucket capacity 
  
       //?? do i need to add extra time for service durations in case of overflows that overrun bucket capacity?
  
        //console.log("overflow for this bucket", overflow_for_this_bucket)
  
        bucket_total = getAvailabilitySlots ( overflow_for_this_bucket ) //get the availability from the overflow
        overflow = overflow - overflow_for_this_bucket //and decrement the overflow
        //console.log("added overflow to total ", bucket_total)
      }
  
        while(overflow === 0 &&                               //if there is still overflow after the above op, it means an open interval overflowed this bucket. continue processing at the next bucket
              open_intervals_index < open_intervals.length){  //when the overflow is empty, walk the intervals to fill the current bucket until the interval falls outside the bucket or there are no intervals
  
          open_interval = open_intervals[open_intervals_index]
          open_interval_start = open_interval.start
          open_interval_end = open_interval.end
  
         // console.log("***checking interval ", open_interval)
  
          //when the interval is 0% inside this bucket,then we are done processing this bucket
          if(hourMinutesStringtoTotalMinutes(open_interval_start) > hourMinutesStringtoTotalMinutes(b_end)){//if the interval needs to be placed into the next bucket
           // console.log("***current interval needs to be checked in the next bucket")
            break;
          }
  
  
          //interval begins in this bucket and ends in some other bucket; 
          if(hourMinutesStringtoTotalMinutes(open_interval_end) > hourMinutesStringtoTotalMinutes(b_end)){ 
            //console.log("***the open interval overflows the bucket")
            const non_overflow =  getMinutesBetweenStringTimes(open_interval_start, b_end)// find the section of the interval that lies within this bucket
  
            //when the interval overruns the end of a time slot boundary, we add at most service_duration extra time to the end to ensure appointments can still be booked
            // this is for the edge case where the open interval has time to fit a service but when the time gets split up there isnt time in either time slot
            //this algo needs to be adjusted as right now it confurs availability for long appointments on busy sceduales; there should be a threshold
            const reserve = Math.min( service_duration, getMinutesBetweenStringTimes(b_end, open_interval_end)) // only overrun the minimum time needed to count as a slot
            bucket_total = bucket_total + getAvailabilitySlots ( non_overflow + reserve )
  
            overflow = getMinutesBetweenStringTimes(b_end, open_interval_end ) //getAvailabilitySlots (getMinutesBetweenStringTimes(b_end, open_interval_end ) )// and put the section overflowing into the overflow bucket
           // console.log("***overflow: ", overflow, " non-overflow: ", non_overflow, "reserve: ", reserve)
  
          }else{ //interval is 100% inside this bucket
           // console.log("***this interval fits within the bucket")
            bucket_total = bucket_total + getAvailabilitySlots (getMinutesBetweenStringTimes(open_interval_start, open_interval_end  ) )//otherwise put the open interval into this bucket and check the next one
          }
  
          open_intervals_index++
  
         // console.log("***checking next interval")
  
      //  }
  
      }
  
      bucket.availability = bucket_total
     // console.log("/// processed current bucket: ", bucket)
  
    })
  
    //console.log("processed buckets: ", copied_sorted_time_slots)
  
    return copied_sorted_time_slots
  
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
a copy of each time_slot where each time slot availability is an int 0-100 inclusive
*/
function getTimeSlotAvailabilityPercentages(total_availability_time_slots = [], adjusted_availability_time_slots = []){

if(total_availability_time_slots.length !== adjusted_availability_time_slots.length){
    throw new Error(`both time slot arrays shoould contain same number of elements ${total_availability_time_slots} , ${adjusted_availability_time_slots}`)
}

const availability_time_slots = []

for(let i = 0; i < total_availability_time_slots.length; i++){

    const total_availability_time_slot = total_availability_time_slots[i];
    const adjusted_availability_time_slot = adjusted_availability_time_slots[i];

    if( !(total_availability_time_slot.availability !== 0 && adjusted_availability_time_slot.availability !== 0 )){ //if either the total availability or adjusted availability was 0
    availability_time_slots.push({...total_availability_time_slot, availability: 0}) //just add a zero availability time slot
    }else{ //otherwise get the percentage between adjusted and total availability
    const time_slot_availability =  Math.trunc( (adjusted_availability_time_slot.availability/total_availability_time_slot.availability)*100 )
    availability_time_slots.push({...total_availability_time_slot, availability: time_slot_availability})
    }
}

return availability_time_slots

}
  
/*

find the open intervals between the open/close times and an array of close intervals

intervals: arr of intervals {start: ##:## end: ##:##}
service_duration: time in minutes of a service
open_time: open time of store
close_time close_time of store

constraints: 
open_time < close_time
close_time >= intervals[intervals.length-1].end, open_time <= intervals[0].start
intervals[i].start < intervals[i].end
intervals[i].end < intervals[i+1].end (no overlapping intervals)

returns: 1 or more open intervals (open/close time counts as an interval)

runtime: 0(nlogn + n)
*/
function getOpenIntervals(intervals = [], open_time, close_time){

    const open_intervals = [] //store the open intervals between open_time->interval[0].start, (interval[i].end->interval[i+1].start) ... interval[n].end -> end_open

    //add an open interval that has > 0 difference between the start/end time
    function addOpenInterval(start, end){

        const diff = getMinutesBetweenStringTimes(start, end)

        if(diff > 0){
        open_intervals.push({
            //duration: diff,
            start: start,
            end: end
        })
        }  
    }

    if(intervals.length === 0){ //if there are no breaks or appointments, the open/close time is the only open interval
        addOpenInterval(open_time, close_time)
        return open_intervals;
    }

    const copied_sorted_intervals = sortIntervals( intervals ) //sort/copy the input arr

    addOpenInterval(open_time, copied_sorted_intervals[0].start) //add the open time->first close interval

    let i = 1;
    //if there are more then 1 closed interval, get the times between intervals
    while(i < copied_sorted_intervals.length){ 
        addOpenInterval(copied_sorted_intervals[i-1].end, copied_sorted_intervals[i].start)
        i++;
    }

    addOpenInterval(copied_sorted_intervals[copied_sorted_intervals.length-1].end, close_time) //add the last time -> close time interval

    return  open_intervals
}
  
  
function getAvailability(break_intervals, appointment_intervals, time_slots, start_time, end_time, requested_service_duration){

    if(time_slots?.length === 0) throw new Error()

    console.log("service_duration ", requested_service_duration);
    console.log("start_time ", start_time);
    console.log("end_time ", end_time);
    console.log("break_intervals ", break_intervals);
    console.log("appointment_intervals ", appointment_intervals);
    console.log("time_slots ", time_slots);

    //first get the slots with only the breaks to find the max slots
    const intervalsBetweenBreaks = getOpenIntervals(break_intervals, start_time, end_time);

    //console.log("intervalsBetweenBreaks ", intervalsBetweenBreaks );

    const totalTimeSlotAvailabilities = getTimeSlotAvailabilities(intervalsBetweenBreaks, requested_service_duration, time_slots);

    //console.log("total: ", totalTimeSlotAvailabilities);

    //then merge the break slots with the confirmed, requested appointments for today to get the adjusted number of slots
    const intervalsBetweenApts =  getOpenIntervals(break_intervals.concat(appointment_intervals),  start_time, end_time);

   // console.log("intervalsBetweenApts ", intervalsBetweenApts );

    const adjustedTimeSlotAvailabilities = getTimeSlotAvailabilities(intervalsBetweenApts, requested_service_duration, time_slots);

   // console.log("adjusted: ", adjustedTimeSlotAvailabilities);

    const availabilityTimeSlots = getTimeSlotAvailabilityPercentages(totalTimeSlotAvailabilities, adjustedTimeSlotAvailabilities);

   // console.log("availabilityTimeSlots: ", availabilityTimeSlots);

    return availabilityTimeSlots;
}

module.exports = { getAvailability }
  

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
