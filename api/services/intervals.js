
const assert = require('node:assert/strict');

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

  toObject(){
    return {start: this.start, end: this.end}
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
input:  arr of interval objects that may or may not overlap
return: the arr sorted by earliest start and if the starts overlap, the earliest ends
*/
function sortIntervals(intervals = []){
  return intervals.toSorted((interval1,interval2)=>
  interval1.start !== interval2.start ? interval1.start - interval2.start 
  : interval1.end - interval2.end
  )
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

function getOpenIntervals(intervals = [], min_max_interval){

    //add an open interval that has > 0 difference between the start/end time
    function addOpenInterval(start, end){
  
        const interval = new Interval(start, end)
        
        if(interval?.duration > 0){
          open_intervals.push(interval)
        }  
    }
  
    intervals = intervals ?? []
  
    const open_intervals = [] //store the open intervals between open_time->interval[0].start, (interval[i].end->interval[i+1].start) ... interval[n].end -> end_open
  
    if(!min_max_interval){
      return open_intervals
    }
  
    if(intervals.length === 0){ //if there are no breaks or appointments, the open/close time is the only open interval
        addOpenInterval(min_max_interval.start, min_max_interval.end)
        return open_intervals;
    }
  
    const merged_sorted_intervals = mergeIntervals( intervals ) //sort/merge the input arr
  
    addOpenInterval(min_max_interval.start, merged_sorted_intervals[0].start) //add the open time->first close interval
  
    //if there are more then 1 closed interval, get the times between intervals
    for(let i = 1; i < merged_sorted_intervals.length; i++)
      addOpenInterval(merged_sorted_intervals[i-1].end, merged_sorted_intervals[i].start)
  
    addOpenInterval(merged_sorted_intervals[merged_sorted_intervals.length-1].end, min_max_interval.end) //add the last time -> close time interval
  
    return  open_intervals
}
  
/*
merge 0-n overlapping Interval objects. overlap is when the start or end values of 
one interval are within the start/end values of another interval, including boundaries

inputs:
intervals: 0-n of Interval objects                  

returns: 
an array of new Intervals sorted in ascending order and overlaps merged (i1.end < i2.start)

runtime: nlogn+n
*/
function mergeIntervals(intervals){

intervals = intervals ?? []

if(intervals.length == 0 ) return []

intervals = sortIntervals(intervals)

const merged_intervals = []

let p1 = 0;
while(p1 < intervals.length){ 

    const outer_interval = intervals[p1]

    let maximum_end = outer_interval.end
    const start = outer_interval.start

    let p2 = p1+1 
    while(p2 < intervals.length){ //check the intervals after the outer interval for overlaps
        const inner_interval = intervals[p2]

        if(inner_interval.start > maximum_end){  //..if the inner intervals start is greater than the current max end value
        break; //it means it falls outside of the previous overlapping intervals
        }else{   //..otherwise the current inner interval is overlapping..
        maximum_end = Math.max(maximum_end, inner_interval.end)  // check if it's end point is greater then any previous end points
        p2++;  // and check the next inner interval
        } 
    }
    //when we 1) found a non-overlapping interval OR have done processing the input in the inner loop, add a single interval that merges all the overlaps
    merged_intervals.push(new Interval(start, maximum_end)) 
    
    p1 = p2 //update the outer pointer so its pointing back to the last interval processed by inner loop
}

return merged_intervals
}
  
//wrap an arr of {start: ##:## end: ##:##} objects into intervals
const toIntervals = (time_objs) => time_objs.map(({start, end})=>new Interval(start, end)) 


/*
generate the interval ranges + counts of every interval thats overlapping
with another interval in the input list. an interval may overlap with itself

intervals: a list of n sorted intervals
returns: 
a list of objects in the form:
{
    interval: an Interval obj where start/end is the range of the overlap, 
    overlap: a count of the intervals that overlaps this range
}
constraints: 
overlapping_intervals[n].overlap <= intervals.length (cant have more overlaps then intervals in the input)
overlapping_intervals[n].overlap >= 1                (an interval overlaps with itself)
overlapping_intervals.length <= (2*intervals.length)-1 
(the (2*intervals.length)-1 size only happens happens in the worst case when every interval needs to get split )

TC: 7n^2
*/
function splitCountOverlapIntervals(intervals){

intervals = intervals ?? []

if(intervals.length == 0 ) return []

//i also need to sort here
intervals = intervals.map(ji=>({interval: ji, overlap: 1}))

let overlapping_intervals = []

//2n
function splitOverlap(split_value, overlapping_interval_index){

    const overlapping_interval = overlapping_intervals[overlapping_interval_index]

    const left = overlapping_interval.interval.start
    const right= overlapping_interval.interval.end
    const overlap = overlapping_interval.overlap

    const left_split_interval = {
    interval: new Interval(left, split_value),
    overlap: overlap
    }

    const right_split_interval =  {
    interval: new Interval(split_value, right),
    overlap: overlap
    }

    overlapping_intervals.splice(overlapping_interval_index, 1 ,[left_split_interval,right_split_interval])
    overlapping_intervals = overlapping_intervals.flat()
}

const getMaxEnd = ()=> overlapping_intervals[overlapping_intervals.length-1].interval.end

//n
function splitStart(start){

    const size = overlapping_intervals.length
    let i = size-1

    while(i >= 0){

    const interval = overlapping_intervals[i]

    const left = interval.interval.start
    const right = interval.interval.end
        
    if(start === left){
        break
    }
    if(start < right && start > left){
        splitOverlap(start, i)
        i++
        break
    }
    i--
    }
    return i
}

//n
function splitEnd(end){

    const size = overlapping_intervals.length
    let i = size-1

    if(end > getMaxEnd()){
    overlapping_intervals.push({
        interval: new Interval(getMaxEnd(), end),
        overlap: 1 //gets incremented in increment step
    })
    return i
    }

    while(i >= 0){

    const interval = overlapping_intervals[i]

    const left = interval.interval.start
    const right = interval.interval.end

    if(end === right){
        return i
    }
    if(end > left){
        splitOverlap(end, i)
        return i
    }
    i--
    }
}

//add the first interval to the return list
overlapping_intervals.push(intervals[0])

for(let i = 1; i < intervals.length; i++){

    const interval = intervals[i].interval
    const interval_start = interval.start
    let interval_end = interval.end

    //if this interval is disjointed from the currently stored intervals, just add it to the tail and process next interval
    //(equal end/start points are considered disjointed because they dont overlap)
    if(interval_start >= getMaxEnd()){
    overlapping_intervals.push({interval: interval,overlap: 1})
    continue  
    }

    //split the start value and store the index of the split interval
    const split_interval_start_index = splitStart(interval_start) 

    //split the end value and store the index of the split interval
    const split_interval_end_index = splitEnd(interval_end)

    assert.equal(split_interval_start_index <= split_interval_end_index, true, 
    `split_interval_start_index ${split_interval_start_index} is always <= split_interval_end_index ${split_interval_end_index} `);

    //increment the overlap counts from split_interval_start_index to split_interval_end_index
    for(let i = split_interval_start_index ; i <= split_interval_end_index; i++){
    const overlap_interval = overlapping_intervals[i]
    overlap_interval.overlap =  overlap_interval.overlap+1
    assert.equal(overlap_interval.overlap <= intervals.length, true, "max # of interval overlaps must be <= the input size ");
    }

}

return overlapping_intervals
}

//given an arr of split intervals, 
//fill in the disjointed gaps between start time -> split_intervals -> close time with 0 overlap intervals
//intervals are disjointed when interval[i].end < interval[i+1].start
//dont think i need to use this
function fillDisjointedGaps(split_intervals, start_end_interval){

    function addOpenInterval(start, end){
  
        const interval = new Interval(start, end)
        
        if(interval?.duration > 0){
          split_jointed_intervals.push({interval: interval, overlap: 0})
        }  
    }
  
    split_intervals = split_intervals ?? []
  
   // assert.equal(start_end_interval && start_end_interval.start >= split_intervals[0])
  
    const split_jointed_intervals = [] //store the open intervals between open_time->interval[0].start, (interval[i].end->interval[i+1].start) ... interval[n].end -> end_open
  
    //if there are no intervals, then start -> end becomes a continuous 0 overlap interval
    if(split_intervals.length === 0){ 
        addOpenInterval(start_end_interval.start, start_end_interval.end)
        return split_jointed_intervals;
    }
  
    //add the interval between start time and the first appointment
    addOpenInterval(start_end_interval.start, split_intervals[0].interval.start) 
  
    //add the first interval
    split_jointed_intervals.push(split_intervals[0])
  
    //process the remaining appointments by first checking if theres a gap, and then adding the interval after the gap
    for(let i = 1; i < split_intervals.length; i++){
      addOpenInterval(split_intervals[i-1].interval.end, split_intervals[i].interval.start)
      split_jointed_intervals.push(split_intervals[i])   
    }
  
    //add the interval between the last appointment and the close time
    addOpenInterval(split_intervals[split_intervals.length-1].interval.end, start_end_interval.end) //add the last time -> close time interval
  
    return split_jointed_intervals
}

module.exports = { 
    toIntervals,
    sortIntervals, 
    getOpenIntervals,
    hourMinutesStringtoTotalMinutes,
    Interval,
    mergeIntervals,
    splitCountOverlapIntervals,
    MAX_MINUTES_IN_DAY,
   // fillDisjointedGaps,
}

