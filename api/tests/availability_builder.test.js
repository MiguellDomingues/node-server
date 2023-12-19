const test  = require("node:test"); 
const { describe, it, beforeEach } = test
const  assert = require('node:assert/strict');

const { 
    Interval, 
    areTimeSlotsValid,
    getTimeSlotAvailabilities,
    getTimeSlotAvailabilityPercentages,
    MAX_MINUTES_IN_DAY,
    mergeIntervals,
    getOpenIntervals,
    getAvailability,
    sortIntervals
 } = require('../availability_builder.js')


describe("testing Interval class", () => {

    let interval;

    it("creates interval from time strings with valid conversion to total minutes", () => {       
        interval = new Interval("00:00","01:45")
        assert.deepStrictEqual(interval.start, 0 , "interval.start should be 0");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");
    });

    it("creates interval from ints with valid conversion to total minutes", () => {       
        interval = new Interval(0,105)
        assert.deepStrictEqual(interval.start, 0 , "interval.start should be 0");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");
    });

    it("creates interval from time string, int with valid conversion to total minutes", () => {       
        interval = new Interval(0,"01:45")
        assert.deepStrictEqual(interval.start, 0 , "interval.start should be 0");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");

        interval = new Interval("00:00",105)
        assert.deepStrictEqual(interval.start, 0 , "interval.start should be 0");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");

        interval = new Interval("01:45",105)
        assert.deepStrictEqual(interval.start, 105 , "interval.start should be 105");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");

        interval = new Interval("01:45",105)
        assert.deepStrictEqual(interval.start, 105 , "interval.start should be 105");
        assert.deepStrictEqual(interval.end, 105 , "interval.end should be 105");

        interval = new Interval("01:45","23:59")
        assert.deepStrictEqual(interval.start, 105 , "interval.start should be 105");
        assert.deepStrictEqual(interval.end, MAX_MINUTES_IN_DAY , "interval.end should be < 1439 (max mins in day)");
    });

    it("startToHoursMinutesString() endToHoursMinutesString() converts start/end to valid time strings", () => {       
        interval = new Interval(0,60)
        assert.deepStrictEqual(interval.startToHoursMinutesString(), "00:00" , "should be 00:00");
        assert.deepStrictEqual(interval.endToHoursMinutesString(), "01:00" , "should be 01:00");

        interval = new Interval("00:45","01:30")
        assert.deepStrictEqual(interval.startToHoursMinutesString(), "00:45" , "should be 00:45");
        assert.deepStrictEqual(interval.endToHoursMinutesString(), "01:30" , "should be 01:30");
    });

    it("throws assertion error when start time < end time", () => {
        try{interval = new Interval("01:46",105)}catch(err){}
        assert.equal(interval=== null, true, "start < end")   
    });

    it("throws assertion error when start time or end time are negative", () => {
        try{interval = new Interval("01:46",-1)}catch(err){}
        assert.equal(interval=== null, true, "end < 0")

        try{interval = new Interval(-1,-2)}catch(err){}
        assert.equal(interval=== null, true, "start, end < 0")

        try{interval = new Interval(-1, "01:46")}catch(err){}
        assert.equal(interval=== null, true, "end < 0")
    });

    it("throws assertion error when end time exceeds 23:59", () => {
        try{interval = new Interval("00:00","24:00")}catch(err){}
        assert.equal(interval === null, true, "start < end")
    });

    it("throws assertion error on invalid start, end strings", () => {
        try{interval = new Interval("000:00","00:01")}catch(err){}
        assert.equal(interval === null, true, "000:00 is invalid")

        try{interval = new Interval("00:00","25:00")}catch(err){}
        assert.equal(interval === null, true, "25:00 is invalid")

        try{interval = new Interval("0000","03:00")}catch(err){}
        assert.equal(interval === null, true, "0000 is invalid")

        try{interval = new Interval("ASssAaa","03:00")}catch(err){}
        assert.equal(interval === null, true, "ASssAaa is invalid")

        try{interval = new Interval("",60)}catch(err){}
        assert.equal(interval === null, true, "blank str is invalid")

    });

    it("init start, end to 0 when arguments are missing", () => {
       
        interval = new Interval(null,null)
        assert.deepStrictEqual(interval.start, 0 , "start should be 0");
        assert.deepStrictEqual(interval.end, 0 , "end should be 0");

        interval = new Interval(null,1)
        assert.deepStrictEqual(interval.start, 0 , "start should be 0");
        assert.deepStrictEqual(interval.end, 1 , "end should be 1");

    });


    beforeEach(() => {interval = null;});
  
});

describe("testing getOpenIntervals() edge cases", () => {

    let closed_intervals, min_max_interval, intervals;

    it("returns the min_max_interval when closed intervals are empty", () => {
        closed_intervals = []
        min_max_interval = new Interval(0, 60)
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [min_max_interval] , 
            "interval with no closed intervals should be the min_max_interval");
    });

    it("returns the min_max_interval when closed intervals are null", () => {
        closed_intervals = null
        min_max_interval = new Interval(0, 60)
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [min_max_interval] , 
            "interval with no closed intervals should be the min_max_interval");
    });

    it("returns empty when closed_intervals cover the entire min_max_interval", () => {
        closed_intervals = [new Interval(0, 30),new Interval(30, 60)]
        min_max_interval = new Interval(0, 60)
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [] , 
            "should be no open intervals");
    });

    it("returns empty when min_max_interval is null", () => {
        closed_intervals = [new Interval(0, 30),new Interval(30, 60)]
        min_max_interval = null
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [] , 
            "should be no open intervals");
    });

    it("throws assertion error when min time < start time of first interval", () => {
        closed_intervals = [new Interval(59, 60)]
        min_max_interval = new Interval(60, 120)

        try{intervals = getOpenIntervals(closed_intervals, min_max_interval)}catch(err){}
        assert.equal(intervals === null, true, "min time cant be < start of first interval")
        
    });

    it("throws assertion error when max time < end time of last interval", () => {
        closed_intervals = [new Interval(55, 60)]
        min_max_interval = new Interval(54, 59)

        try{intervals = getOpenIntervals(closed_intervals, min_max_interval)}catch(err){}
        assert.equal(intervals === null, true, "end of last interval cant be > max time")      
    });

    beforeEach(() => {
        closed_intervals = [];
        min_max_interval = null;
        intervals = null;
    });
});

describe("testing getOpenIntervals() main paths", () => {

    let closed_intervals, min_max_interval;

   
    it("(0,5)(1,7)(10,25)(10,55), mmi=(0,60), returns (7,10)(55,60)", () => {
        closed_intervals = [
            new Interval(0, 5),
            new Interval(1, 7),
            new Interval(10, 25),
            new Interval(10, 55)]


        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval),
             [new Interval(7, 10),new Interval(55, 60)] , 
            "");
    });

    it("(5,15)(15,35)(40,41)(41,55), mmi=(0,60), returns (0,5)(35,40)(55,60)", () => {
        closed_intervals = [

            new Interval(5, 15),
            new Interval(15, 35),
            new Interval(40, 41),
            new Interval(41, 55)]


        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval),
             [new Interval(0, 5),new Interval(35, 40), new Interval(55, 60)] , 
            "");
    });

    it("(0,20)(15,35)(34,53)(53,60), mmi=(0,60), returns []", () => {
        closed_intervals = [

            new Interval(0, 20),
            new Interval(15, 35),
            new Interval(34, 53),
            new Interval(53, 60)]

        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval),
             [] , "");
    });

   
    beforeEach(() => {
        closed_intervals = [];
        min_max_interval = min_max_interval = new Interval(0, 60);
    });
  
});

describe("testing getTimeSlotAvailabilityPercentages()", () => {

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

describe("testing areTimeSlotsValid()", () => {

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

describe("testing getTimeSlotAvailabilities(): main paths", () => {

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

describe("testing getTimeSlotAvailabilities(): edge cases", () => {

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

describe("testing sortIntervals", () => {

    let intervals;

    it("(0,30)(30,60)(60,90) to (0,30)(30,60)(60,90)", () => {
    
        intervals = [
            new Interval(0, 30), 
            new Interval(30, 60),
            new Interval(60, 90),
        ]

        assert.deepStrictEqual(sortIntervals(intervals), intervals, "");
    });

    it("(0,30)(60,90)(30,60) sorts to (0,30)(30,60)(60,90)", () => {
    
        intervals = [
            new Interval(0, 30), 
            new Interval(60, 90),
            new Interval(30, 60),        
        ]

        assert.deepStrictEqual(
            sortIntervals(intervals), 
            [new Interval(0, 30),new Interval(30, 60),new Interval(60, 90)], "");
    });

    it("(0,60)(0,20)(0,40) sorts to (0,20)(0,40)(0,60)", () => {
    
        intervals = [
            new Interval(0, 60), 
            new Interval(0, 20),
            new Interval(0, 40),        
        ]

        assert.deepStrictEqual(
            sortIntervals(intervals), 
            [new Interval(0, 20),new Interval(0, 40),new Interval(0, 60)], "");
    });

    it("(2,3)(0,5)(1,2)(0,6)(2,7)(1,3) sorts to (0,5)(0,6)(1,2)(1,3)(2,3)(2,7)", () => {
    
        intervals = [
            new Interval(2, 3),
            new Interval(0, 5),   
            new Interval(1, 2), 
            new Interval(0, 6),
            new Interval(2, 7),
            new Interval(1, 3),
        ]

        assert.deepStrictEqual(sortIntervals(intervals), 
            [new Interval(0,5),new Interval(0,6),new Interval(1,2),
            new Interval(1,3),new Interval(2,3),new Interval(2,7)], "");
    });

    beforeEach(() => {
        intervals = null
    });

});

describe("testing mergeIntervals", () => {

    let intervals;

    it("returns empty when the input is empty", () => { 
        intervals = []
        assert.deepStrictEqual(mergeIntervals(intervals), intervals, "");
    });

    it("returns the sorted input when the input has no overlaps but is unsorted", () => {
    
        intervals = [new Interval(4, 6),new Interval(8, 8),new Interval(0,3),]

        assert.deepStrictEqual(
            mergeIntervals(intervals), 
            [new Interval(0, 3),new Interval(4, 6),new Interval(8, 8)], "");
    });

    it("returns (5,7) when the input is (5,7)", () => {
    
        intervals = [new Interval(5, 7)]

        assert.deepStrictEqual(mergeIntervals(intervals), intervals, "");
    });

    it("merges consecutive overlaps into single interval", () => {
    
        intervals = [new Interval(0, 0),new Interval(1,1),new Interval(0,4)]
        assert.deepStrictEqual(mergeIntervals(intervals),[new Interval(0,4)] , "");
    });

    it("merges (0,0)(1,1)(0,4)(2,4)(5,6)(6,6) into (0,4)(5,6)", () => {
    
        intervals = [
            new Interval(0,0),
            new Interval(1,1),
            new Interval(0,4),
            new Interval(2,4),
            new Interval(5,6),
            new Interval(6,6)]

        assert.deepStrictEqual(
            mergeIntervals(intervals),[new Interval(0,4),new Interval(5,6)] , "");

        intervals = [
            new Interval(0, 5),
            new Interval(6,10),
            new Interval(6,11),    
            new Interval(6,12), 
            new Interval(8,11), 
            new Interval(9,14), 
            new Interval(11,12) ]

        assert.deepStrictEqual(mergeIntervals(intervals),[new Interval(0,5),new Interval(6,14)] , "");
    });

    it("merges (0,5)(6,11)(6,11)(6,12)(8,11)(9,14)(11,12) into (0,5)(6,12)", () => {
    
        intervals = [
            new Interval(0, 5),
            new Interval(6,10),
            new Interval(6,11),    
            new Interval(6,12), 
            new Interval(8,11), 
            new Interval(9,14), 
            new Interval(11,12)]

        assert.deepStrictEqual(mergeIntervals(intervals),[new Interval(0,5),new Interval(6,14)] , "");
    });

    beforeEach(() => {
        intervals = null
    });

});

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








