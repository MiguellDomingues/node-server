const test  = require("node:test"); 
const { describe, it, beforeEach } = test
const  assert = require('node:assert/strict');

const { Interval } = require('../services/intervals.js')

const { 
    getTimeSlotAvailabilities,
    getTimeSlotAvailabilityPercentages,
    getAvailability,
    getTotalAvailability,
    getAdjustedAvailability,
    areTimeSlotsValid,
    AvailabilityService,
} = require('../services/availabilityService.js')

function toObjects(overlap_intervals){
    return overlap_intervals.map(({interval, overlap})=>{
        const o = interval.toObject()
        delete interval
        return {...o,overlap:overlap }
    })
}

describe("testing getTimeSlotAvailabilityPercentages()", {skip: false},() => {

    let adjusted_availabilities, total_availabities;

    it(" throws assertion error when total_availabities/adjusted_availabilities are not all same length ", () => {
       
        total_availabities = [0,0,0]
        adjusted_availabilities = [0,0]  
        let output

        try{output = getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities)}catch(err){}
        assert.equal(output === undefined, true, "total_availabities size > adjusted_availabilities size")         
     });

     it(" throws assertion error when total or adjusted availability is negative ", () => {
       
        total_availabities = [-2]
        adjusted_availabilities = [1]  
        let output

        try{output = getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities)}catch(err){}
        assert.equal(output === undefined, true, "total_availabities has a negative number") 
        
        total_availabities = [2]
        adjusted_availabilities = [-1]  
        
        try{output = getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities)}catch(err){}
        assert.equal(output === undefined, true, "adjusted_availabilities has a negative number")  
     });

     it(" throws assertion error when adjusted availability > total availability", () => {
       
        total_availabities = [2]
        adjusted_availabilities = [3]  
        let output

        try{output = getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities)}catch(err){}
        assert.equal(output === undefined, true, "total_availabities has a negative number") 
         
     });

     it("gets the correct percentages for each non-zero array index", () => {
       
        total_availabities = [4,3,2]
        adjusted_availabilities = [2,1,1]
          
        assert.deepStrictEqual(
            getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities), 
            [50,33,50] , 
            "output should be [50,33,50] ");
            
        total_availabities = [4]
        adjusted_availabilities = [4]
            
        assert.deepStrictEqual(
            getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities), 
            [100] , 
            "output should be [100] ");   
     });

     it("fills in zero on indexes where adjusted/total availability is 0", () => {
       
        total_availabities = [4,0,2]
        adjusted_availabilities = [2,0,0]
          
        assert.deepStrictEqual(
            getTimeSlotAvailabilityPercentages(total_availabities, adjusted_availabilities), 
            [50,0,0] , 
            "output should be [50,0,0] ");     
     });

    beforeEach(() => {
        adjusted_availabilities = null
        total_availabities = null
    });

});

/*
describe("testing areTimeSlotsValid()", {skip: false},() => {

    let time_slots, min_max_interval

     it("returns true on valid time slots", () => {
       
        time_slots = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        min_max_interval = new Interval(0,60)
               
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), true, "should be valid time slots")

        time_slots = [new Interval(0, 60)]
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), true, "should be valid time slots")

     });

     it("returns false when end time on last time slot is not equal to min_max_interval end", () => {
       
        time_slots = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 59)]
        min_max_interval = new Interval(0,60)
     
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), false, "should be valid time slots")
     });

     it("returns false when start time on first time slot is not equal to min_max_interval start", () => {
       
        time_slots = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        min_max_interval = new Interval(1,60)
     
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), false, "should be valid time slots")

     });

     it("returns false when timeslot.end != timeslot.start", () => {
       
        time_slots = [new Interval(0, 19), new Interval(20, 40),new Interval(40, 60)]
        min_max_interval = new Interval(0,60)
     
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), false, "should be invalid time slots")

        time_slots = [new Interval(0, 36), new Interval(35, 60)]
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), false, "should be invalid time slots")

     });

    beforeEach(() => {
        time_slots = null
        min_max_interval = null
    });

});
*/

describe("testing getTimeSlotAvailabilities(): main paths", {skip: false},() => {

    let open_intervals, service_duration, time_slot_intervals;

    it("fills each time slot (0,30)(0,60)(60,90) to capacity for oi=(0,90), sd=5", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90)]

        open_intervals = [new Interval(0, 90)]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[0,5,10,15,20,25],
             [30,35,40,45,50,55],
             [60,65,70,75,80,85]], 
            "");
    });

     it("adds a single availability to each bucket for sd=23 ts=(0,30)(0,60)(60,90) oi=(0,90)", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90)]

        open_intervals = [new Interval(0, 90)]

        service_duration = 23

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[0],[30],[60]]);
     });

     it("adds availabilities to current timeslot across multiple intervals", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]

        open_intervals = [
            new Interval(0, 10),
            new Interval(15, 25),
            new Interval(35, 40),
            new Interval(50, 55)
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[0,5,15,20],
             [35,50]], 
            "");
     });

     it("adds the availability to current timeslot when interval (24,34) overlaps (0,30)(30-60)", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]

        open_intervals = [
            new Interval(0, 10),
            new Interval(25, 34),
            
            new Interval(50, 55),
            new Interval(55, 60)
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[0,5,25],
             [50,55]], 
            "");
     });

     it("adds the availability to second timeslot as overflow when interval (26,35) overlaps (0,30)(30-60)", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]

        open_intervals = [
            new Interval(7, 16),
            new Interval(26, 35),
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[7],[30]], 
            "");
     });

     it("adds the availability to current timeslot when interval (26,31) overlaps (0,30)(30-60)", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]

        open_intervals = [
            new Interval(7, 22),
            new Interval(26, 31),
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[7,12,17,26],[]], 
            "");
     });

     it("adds the availability to both timeslots when interval (25,36) overlaps (0,30)(30-60)", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]

        open_intervals = [
            new Interval(7, 22),
            new Interval(25, 36),
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[7,12,17,25],[30]], 
            "");
     });

     it("skips buckets that have no open intervals for time slots", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90),
        ]

        open_intervals = [
            new Interval(7, 22),
            new Interval(26, 31),
            new Interval(62, 85),
            new Interval(86, 91),
            
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[7,12,17,26],
            [],
            [62,67,72,77,86]], 
            "");
     });

     it("filters open intervals that cant fit a single time slot", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90),
        ]

        open_intervals = [
            new Interval(7, 22),
            new Interval(26, 31),
            new Interval(32, 36),
            new Interval(62, 85),
            new Interval(86, 91),       
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[7,12,17,26],
            [],
            [62,67,72,77,86]], 
            "");
     });

    beforeEach(() => {
        open_intervals = null
        service_duration = null
        time_slot_intervals = null
    });

});

describe("testing getTimeSlotAvailabilities(): edge cases",{skip: false}, () => {

    let open_intervals, service_duration, time_slot_intervals;

     it("returns empty availabilities for each time slot when there are no open intervals", () => {
       
        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90),
        ]

        open_intervals = [
            new Interval(32, 36),
            new Interval(86, 90),       
        ]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [[],[],[]], 
            "");
     });

     it("throws assertion error if the service_duration is <= 0", () => {
        
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals = [new Interval(0, 14), new Interval(15, 29), new Interval(31, 42)]
        service_duration = 0
        let output

        try{output = getTimeSlotAvailabilitie_test(open_intervals, service_duration, time_slot_intervals)}catch(err){}
        assert.equal(output === undefined, true, "service_duration <= 0 ")   
        
    });

    it("throws assertion error if the service_duration exceeds the duration of a time slot", () => {
        
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals = [new Interval(0, 60)]
        service_duration = 21
        let output
      
        try{ output = getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals)}catch(err){}
        assert.equal(output === undefined, true, "service duration exceeds duration of time slot")         
    });
  
    beforeEach(() => {
        open_intervals = null
        service_duration = null
        time_slot_intervals = null
    });

});

describe("testing getTotalAvailability()", () => {

    let breaks, service_duration, capacity, open_close_interval, time_slot_intervals

    it("returns [10,10] when each time slot can fit 5 appointments with capacity = 2", () => { 

        breaks = [new Interval(25,30), new Interval(45,50)]

        assert.deepStrictEqual(
            getTotalAvailability(breaks, time_slot_intervals, open_close_interval, 
                                 service_duration, capacity), 
            [10,10],  "");
    });
    
    it("returns [2,0] when ts 1/2 can fit 1/0 apts respectively, capacity = 2", () => { 

        breaks = [new Interval(20,30), new Interval(40,50)]
        service_duration = 20

        let ta = getTotalAvailability(breaks, time_slot_intervals, open_close_interval, service_duration, capacity)

        assert.deepStrictEqual(ta, [2,0], "");       
    });

    it("returns [0,0] when ts 1/2 can't fit any appointments", () => { 

        breaks = [new Interval(20,30), new Interval(40,50)]
        service_duration = 21

        let ta = getTotalAvailability(breaks, time_slot_intervals, open_close_interval, service_duration, capacity)

        assert.deepStrictEqual(ta, [0,0], "");       
    });

    it("returns [2,4] when ts can fit 1/2 apts respectively, capacity = 2", () => { 

        breaks = [new Interval(0,15)]
        service_duration = 15

        let ta = getTotalAvailability(breaks, time_slot_intervals, open_close_interval, service_duration, capacity)

        assert.deepStrictEqual(ta, [2,4], "");       
    });

    beforeEach(() => {
        breaks = []
        service_duration = 5
        capacity = 2
        open_close_interval = new Interval(0,60)

        time_slot_intervals = [
            new Interval(0, 30), 
            new Interval(30, 60)]
    });

});

describe("testing getAdjustedAvailability() edge cases", () => {

    let appointments, service_duration, capacity, time_slot_intervals, start_end_interval, breaks

    it(" testing no breaks and no appointments", () => { 

        breaks = []

        appointments = []

        service_duration = 15

        let aa = getAdjustedAvailability(
                    appointments, 
                    breaks, 
                    time_slot_intervals, 
                    start_end_interval, 
                    service_duration, 
                    capacity)

        assert.deepStrictEqual(aa, [[0,15],[30,45]], "");  
    });

    it(" testing 2 breaks (15,20)(30,35) and no appointments", () => { 

        appointments = []

        service_duration = 15

        let aa = getAdjustedAvailability(
                    appointments, 
                    breaks, 
                    time_slot_intervals, 
                    start_end_interval, 
                    service_duration, 
                    capacity)

        assert.deepStrictEqual(aa, [[0],[35]], "");  
  
    });

    it(" testing no breaks and appointments (0,15),(10,25),(20,35),(40,55)", () => { 

        breaks = []

        service_duration = 15

        let aa = getAdjustedAvailability(
                    appointments, 
                    breaks, 
                    time_slot_intervals, 
                    start_end_interval, 
                    service_duration, 
                    capacity)

        assert.deepStrictEqual(aa, [[], [ 30, 45 ] ], "");  
    });

    beforeEach(() => {

        time_slot_intervals = [new Interval(0, 30), new Interval(30, 60)]

        breaks = [new Interval(15,20), new Interval(30,35)]

        appointments = [ 
            new Interval(40,55), 
            new Interval(0,15), 
            new Interval(10,25),
            new Interval(20,35)]

        start_end_interval = new Interval(0, 60)
        service_duration = 15
        capacity = 2
    });

});

describe("testing getAdjustedAvailability() main paths", () => {

    let appointments, service_duration, capacity, time_slot_intervals, start_end_interval, breaks

    /*
    it("testing main path ", () => { 

        //1) sort the appointment intervals
        let sorted_apts = sortIntervals(appointments)

        assert.deepStrictEqual(
            sorted_apts, 
            [new Interval(0,15),new Interval(10,25),new Interval(20,35),new Interval(40,55)], 
        "appointments should be sorted");

         //2) split and count the overlapping intervals 
        let split_apts = splitCountOverlapIntervals(sorted_apts)

        assert.deepStrictEqual(
            toObjects(split_apts), 
            [{ start: 0, end: 10, overlap: 1 },
             { start: 10, end: 15, overlap: 2 },
             { start: 15, end: 20, overlap: 1 },
             { start: 20, end: 25, overlap: 2 },
             { start: 25, end: 35, overlap: 1 },
             { start: 40, end: 55, overlap: 1 }], 
        "");

        //3) get the intervals without capacity for an appointment
        const intervals_without_capacity = split_apts.filter(({overlap})=>overlap >= capacity)

        assert.deepStrictEqual(
            toObjects(intervals_without_capacity), 
            [{ start: 10,  end: 15, overlap: 2 },
             { start: 20, end: 25, overlap: 2 },
            ], 
        "split_intervals with overlap < 2 should be removed");

        //4) get the open spans of time between the no-capacity intervals and the open/close times
        const open_intervals = getOpenIntervals(
            intervals_without_capacity.map(iwc=>iwc.interval), 
            start_end_interval)

        assert.deepStrictEqual(
            open_intervals, 
            [new Interval(0,10), new Interval(15,20), new Interval(25,60)], 
        "");

        //we are left with the intervals with capacity to book at least 1 appointment

        //5) now we need to consider the breaks
        //combine/sort the open intervals with the breaks
        const open_intervals_breaks = sortIntervals(open_intervals.concat(breaks))

        assert.deepStrictEqual(
            open_intervals_breaks, 
            [new Interval(0,10), new Interval(15,20),new Interval(15,20), new Interval(25,60),new Interval(30,35)], 
        "");

        //6) split these combined intervals to find any overlaps 
        const split_breaks_open_intervals = splitCountOverlapIntervals(open_intervals_breaks)

        assert.deepStrictEqual(
            toObjects(split_breaks_open_intervals), 
            [{ start: 0, end: 10, overlap: 1 },
                { start: 15, end: 20, overlap: 2 },
                { start: 25, end: 30, overlap: 1 },
                { start: 30, end: 35, overlap: 2 },
                { start: 35, end: 60, overlap: 1 }], 
        "");
        //overlaps of 2 (or more; breaks may overlap with other breaks) means we cant book apts on these intervals

        //7) remove the spans of time which overlap with a break
        const intervals_without_breaks = split_breaks_open_intervals
            .filter(({overlap})=>overlap < 2) //filter out the overlapping breaks
                .map(i=>i.interval) //convert back to interval

        assert.deepStrictEqual(
            intervals_without_breaks, 
            [new Interval(0,10), new Interval(25,30), new Interval(35,60)], 
        "");

        //we are left with spans of time that cover the entire work day that both:
        //dont have breaks 
        //and dont overlap over the capacity



        const aa = getAdjustedAvailability(
                    appointments, 
                    breaks, 
                    time_slot_intervals, 
                    start_end_interval, 
                    service_duration, 
                    capacity)

        console.log(aa)
    });
    */

    it("testing main path with 4 appointments, 2 breaks and sd: 15,10,5", () => { 

        service_duration = 15

        let aa = getAdjustedAvailability(
                    appointments, 
                    breaks, 
                    time_slot_intervals, 
                    start_end_interval, 
                    service_duration, 
                    capacity)

        assert.deepStrictEqual(aa, [[],[35]], "");

        service_duration = 10

        aa = getAdjustedAvailability(
            appointments, 
            breaks, 
            time_slot_intervals, 
            start_end_interval, 
            service_duration, 
            capacity)

        assert.deepStrictEqual(aa, [[0],[35,45]],"");
 
        service_duration = 5

        aa = getAdjustedAvailability(
            appointments, 
            breaks, 
            time_slot_intervals, 
            start_end_interval, 
            service_duration, 
            capacity)

        assert.deepStrictEqual(aa, [[0,5,25], [35,40,45,50,55] ], "");    
    });


    beforeEach(() => {

        time_slot_intervals = [new Interval(0, 30), new Interval(30, 60)]

        breaks = [new Interval(15,20), new Interval(30,35)]

        appointments = [ 
            new Interval(40,55), 
            new Interval(0,15), 
            new Interval(10,25),
            new Interval(20,35)]

        start_end_interval = new Interval(0, 60)
        service_duration = 15
        capacity = 2
    });

});


describe("testing AvailabilityService constructor", {skip: false},() => {

    let  breaks, appointments, time_slots, start_time, end_time, service_duration,service_capacity

    describe("testing correct inputs",() => {

        it("creates an instance of the class without throwing an exception", () => {

        let obj
        let _err

        try{
            obj = 
            new AvailabilityService(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                service_duration,
                service_capacity) 
        }catch(err){_err = err}

        assert.equal(obj instanceof AvailabilityService, true, `instance creation failed. err: ${_err}`) 

        });

        beforeEach(() => {
            breaks = [{start: "01:00", end: "01:15"}]

            appointments = [{start: "00:00", end: "00:15"},{start: 5, end: 15}]

            time_slots = [
                {start: "00:00", end: "01:00"}, 
                {start: "01:00", end: "02:00"},
            ] 

            start_time = "00:00"
            end_time = "02:00" 

            service_duration = 15
            service_capacity = 2
        });
 
    });

    describe("testing correct inputs",() => {

        it("creates an instance of the class without throwing an exception", () => {

        let obj
        let _err

        try{
            obj = 
            new AvailabilityService(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                service_duration,
                service_capacity) 
        }catch(err){_err = err}

        assert.equal(obj instanceof AvailabilityService, true, `instance creation failed. err: ${_err}`) 

        });

        beforeEach(() => {
            breaks = [{start: "01:00", end: "01:15"}]

            appointments = [{start: "00:00", end: "00:15"},{start: 5, end: 15}]

            time_slots = [
                {start: "00:00", end: "01:00"}, 
                {start: "01:00", end: "02:00"},
            ] 

            start_time = "00:00"
            end_time = "02:00" 

            service_duration = 15
            service_capacity = 2
        });
 
    });

    /*
    beforeEach(() => {
        time_slots = null
        min_max_interval = null
    });*/

});


/*
describe("testing getAvailability() assertions, edge cases", () => {

    let breaks, appointments, time_slots, start_time, end_time, requested_service_duration;

    it(" throws assertion error on improper start/end times ", () => {
       
        let output

        start_time = "12:89"
        
        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "start_time is improper") 
        
        end_time = "24:03"
        
        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "end_time is improper")  
  
    });

    it(" throws assertion error on improper breaks ", () => {
       
        let output

        breaks = [{start: "0a:00", end: "09:15"}]
        
        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "breaks arr is improper") 
    });

    it(" throws assertion error on improper timeslots ", () => {
    
        let output

        time_slots = [{start: "08:00", end: "09:00"}, {start: "09:a", end: "10:00"},{start: "10:00", end: "11:00"}, {start: "11:00", end: "12:00"}]

        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "time_slots is improper") 

        time_slots = [{start: "08:00", end: "09:00"}, {start: "09:00", end: "10:01"},{start: "10:00", end: "11:00"}, {start: "11:00", end: "12:00"}]

        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "time_slots is improper")
    });

    it(" throws assertion error on improper appointments ", () => {
    
        let output
        appointments = [{start: 0, end: -60}]

    try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
    assert.equal(output === undefined, true, "appointments is improper")
    });

    it(" throws assertion error when service duration < 0 or > than time slot length ", () => {
    
        let output

        requested_service_duration = -1

        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "requested_service_duration is negative") 

        requested_service_duration = 61

       // try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
       // assert.equal(output === undefined, true, "requested_service_duration is > then time slot duration") 
    });

    beforeEach(() => {

        breaks = [{start: "09:00", end: "09:15"}, {start: "11:00", end: "11:15"}]
        start_time = "08:00"
        end_time = "12:00"
        time_slots = [
            {start: "08:00", end: "09:00"}, 
            {start: "09:00", end: "10:00"},
            {start: "10:00", end: "11:00"}, 
            {start: "11:00", end: "12:00"}
        ]
        appointments = [], 
        requested_service_duration = null     
    });

});

describe("testing getAvailability() main paths ts=(0,60)(60,120) b=(60,75)", () => {

    let breaks, appointments, time_slots, start_time, end_time, requested_service_duration;

     it("returns 100% capacity for each time slot when there are no appointments d=15,30", () => {
       
        requested_service_duration = 15

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [0,15,30,45], availability: 100}, 
                {start: 60, end: 120,  open_times: [75,90,105], availability: 100}
            ], 
            ""); 

        requested_service_duration = 30
          
        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [0,30], availability: 100}, 
                {start: 60, end: 120, open_times: [75], availability: 100}
            ], 
            ""); 
            
     });

     it("returns correct slots for a=(15,30)(75,100) across sd=15,25,45", () => {
       
        appointments = [
          {start: "00:15", end: "00:30"},
          {start: "01:15", end: "01:40"},
        ]

        requested_service_duration = 15

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60,open_times: [0,30,45], availability: 75}, 
                {start: 60, end: 120, open_times: [100], availability: 33}
            ], 
            ""); 

        requested_service_duration = 25

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [30], availability: 50}, 
                {start: 60, end: 120, open_times: [], availability: 0}
            ], 
            ""); 

            requested_service_duration = 45

            assert.deepStrictEqual(
                getAvailability(
                    breaks, 
                    appointments,
                    time_slots,
                    start_time,
                    end_time,
                    requested_service_duration
                ), 
                [
                    {start: 0, end: 60,open_times: [], availability: 0}, 
                    {start: 60, end: 120, open_times: [], availability: 0}
                ], 
                ""); 
            
    
     });

     it("returns correct slots for overlapping appointments a=(5,15)(5,25)(30,40)(100,120) across sd=10,20,30", () => {
       
        appointments = [
          {start: "00:05", end: "00:15"},
          {start: "00:05", end: "00:25"},
          {start: "00:30", end: "00:40"},
          {start: "01:40", end: "02:00"},
        ]

        requested_service_duration = 10

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [40,50], availability: 33}, 
                {start: 60, end: 120, open_times: [75,85], availability: 50}
            ], 
            "");
            
        requested_service_duration = 20

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [40], availability: 33}, 
                {start: 60, end: 120, open_times: [75], availability: 50}
            ], 
            ""); 

        requested_service_duration = 30

        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [
                {start: 0, end: 60, open_times: [], availability: 0}, 
                {start: 60, end: 120, open_times: [], availability: 0}
            ], 
            ""); 

     });


    beforeEach(() => {

        breaks = [{start: "01:00", end: "01:15"}]
        start_time = "00:00"
        end_time = "02:00"
        time_slots = [
            {start: "00:00", end: "01:00"}, 
            {start: "01:00", end: "02:00"},
        ]
        appointments = [], 
        requested_service_duration = null     
    });

});

*/

/*
describe("testing fillDisjointedGaps", () => {

    let split_intervals, start_end_interval

    it("returns {intervals: 0,60, overlaps: 0} when input list is empty", () => { 

        split_intervals = []

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [{interval: new Interval(0,60) , overlap: 0}], 
        "should be {interval: (0,60), overlap: 0}");


    });

    it("fills in gaps between start and/or end times", () => { 
        //start and end
        split_intervals = [
            {interval: new Interval(5,30) , overlap: 1},
            {interval: new Interval(30,55) , overlap: 1},
        ]

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [{interval: new Interval(0,5) , overlap: 0},
             {interval: new Interval(5,30) , overlap: 1},
             {interval: new Interval(30,55) , overlap: 1},
             {interval: new Interval(55,60) , overlap: 0} ], 
        "");

         //start
         split_intervals = [
            {interval: new Interval(5,30) , overlap: 1},
            {interval: new Interval(30,60) , overlap: 1},
        ]

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [{interval: new Interval(0,5) , overlap: 0},
             {interval: new Interval(5,30) , overlap: 1},
             {interval: new Interval(30,60) , overlap: 1}, ], 
        "");

         //end
         split_intervals = [
            {interval: new Interval(0,30) , overlap: 1},
            {interval: new Interval(30,55) , overlap: 1},
        ]

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [{interval: new Interval(0,30) , overlap: 1},
             {interval: new Interval(30,55) , overlap: 1},
             {interval: new Interval(55,60) , overlap: 0}], 
        "");
    });

    it("fills in gaps between 3 consecutive disjointed intervals", () => { 
  
        //3 gaps
        split_intervals = [
            {interval: new Interval(0,15) , overlap: 1},
            {interval: new Interval(25,30) , overlap: 1},
            {interval: new Interval(35,40) , overlap: 1},
            {interval: new Interval(45,60) , overlap: 1},
        ]

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [ {interval: new Interval(0,15) , overlap: 1},
              {interval: new Interval(15,25) , overlap: 0},
              {interval: new Interval(25,30) , overlap: 1},
              {interval: new Interval(30,35) , overlap: 0},
              {interval: new Interval(35,40) , overlap: 1},
              {interval: new Interval(40,45) , overlap: 0},
              {interval: new Interval(45,60) , overlap: 1}], 
        "");
    });

    it("fills in gaps between 3 consecutive disjointed intervals, including start/end", () => { 
  
        //3 gaps between 
        split_intervals = [
            {interval: new Interval(5,15) , overlap: 1},
            {interval: new Interval(25,30) , overlap: 1},
            {interval: new Interval(35,40) , overlap: 1},
            {interval: new Interval(45,55) , overlap: 1},
        ]

        assert.deepStrictEqual(
            fillDisjointedGaps(split_intervals, start_end_interval), 
            [ {interval: new Interval(0,5) , overlap: 0},
              {interval: new Interval(5,15) , overlap: 1},
              {interval: new Interval(15,25) , overlap: 0},
              {interval: new Interval(25,30) , overlap: 1},
              {interval: new Interval(30,35) , overlap: 0},
              {interval: new Interval(35,40) , overlap: 1},
              {interval: new Interval(40,45) , overlap: 0},
              {interval: new Interval(45,55) , overlap: 1},
              {interval: new Interval(55,60) , overlap: 0}], 
        "");
    });

    beforeEach(() => {
        split_intervals = []
        start_end_interval = new Interval(0, 60)
    });

});
*/
