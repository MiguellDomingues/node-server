const test  = require("node:test"); 
const { describe, it, beforeEach } = test
const  assert = require('node:assert/strict');

const { 
    Interval, 
    getOpenIntervals, 
    getTimeSlotAvailabilities, 
    getTimeSlotAvailabilityPercentages,
    MAX_MINUTES_IN_DAY,
    areTimeSlotsValid,
    getAvailability
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

describe("testing getOpenIntervals()", () => {

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

    it("returns (29,30) for f([(0,29),(30,60)], (0-60))", () => {
        closed_intervals = [new Interval(0, 29),new Interval(30, 60)]
        min_max_interval = new Interval(0, 60)
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [new Interval(29, 30)] , 
            "output should be (29, 30)");
    });

    it("correctly sorts the closed_intervals before processing", () => {
        closed_intervals = [new Interval(30, 60),new Interval(0, 29),]
        min_max_interval = new Interval(0, 60)
        assert.deepStrictEqual(
            getOpenIntervals(closed_intervals, min_max_interval), [new Interval(29, 30)] , 
            "output should be (29, 30)");
    });

    it("throws assertion error on overlapping intervals ( [(30,60),(0,31)], (0-60) )", () => {
        closed_intervals = [new Interval(30, 60),new Interval(0, 31),]
        min_max_interval = new Interval(0, 60)
       
        try{intervals = getOpenIntervals(closed_intervals, min_max_interval)}catch(err){}
        assert.equal(intervals === null, true, "intervals shouldnt be overlapping")
        
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

describe("testing getTimeSlotAvailabilities()", () => {

    let open_intervals, service_duration, time_slot_intervals;

    it("3 buckets, 1 slot per bucket without overflow ", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]

        open_intervals =      [new Interval(3, 19), new Interval(24,39), new Interval(40, 55)]

        service_duration = 15

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,1,1] , 
            "output should be [1,1,1]");
     });

     it("3 buckets, 1 slot per bucket without overflow, filtering too short intervals", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(3, 19), new Interval(20, 34), new Interval(24,39), new Interval(25, 39), new Interval(45, 60)]
        service_duration = 15

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,1,1] , 
            "output should be [1,1,1]");

     });

     it("3 buckets, 2 slots into b1 , 1 slot into b2, no overflow", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(3, 8), new Interval(10, 15), new Interval(21, 30)]
        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [2,1,0] , 
            "output should be [2,1,0]");
     });

     it("3 buckets, 3 slots into b1 , no overflow", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(3, 8), new Interval(9, 15), new Interval(15, 20)]
        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [3,0,0] , 
            "output should be [3,0,0]");
     });

     it("3 buckets with i2 overlapping b1,b2 and overflow/non overflow being too small", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]

        open_intervals =      [new Interval( 1, 11), new Interval(15, 27), new Interval(28, 39)]

        service_duration = 10

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [2,1,0] , 
            "output should be [2,1,0]");
     });

     it("3 buckets with i2 overlapping b2,b3 and non overflow can fit the apt into b2", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]

        open_intervals =      [new Interval(1, 7), new Interval(34, 41), new Interval(48, 58)]

        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,1,2] , 
            "output should be [2,1,0]");
     });

     it("3 buckets with i2 overlapping b2,b3 and overflow can fit the app into b3", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(1, 7), new Interval(36, 45), new Interval(48, 58)]
        service_duration = 5

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,0,3] , 
            "output should be [1,0,3]");
     });

     it("3 buckets with i1 overrunning b1, non-overflows into b1, overflows into b2", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(1, 39), new Interval(40, 60)]
        service_duration = 10

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,1,2] , 
            "output should be [1,1,2]");
     });

     it("3 buckets with interval.start = b1.start, interval.end = b3.end", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(0, 60)]
        service_duration = 10

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [2,2,2] , 
            "output should be [2,2,2]");
     });

     it("3 buckets with too small overflow/nonoverflow still providing space for an apt", () => {
       
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals =      [new Interval(15, 25),new Interval(36, 46),new Interval(50, 60)]
        service_duration = 10

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [1,1,1] , 
            "output should be [1,1,1]");
     });
 
     it("returns arr of 0's equal to # of time slots if all the open intervals are shorter then service duration", () => {

        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals = [new Interval(0, 14), new Interval(15, 29), new Interval(31, 42)]
        service_duration = 15

        assert.deepStrictEqual(
            getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals), 
            [0,0,0] , 
            "output should be [0,0,0]");

     });

     it("throws assertion error if the service_duration is <= 0", () => {
        
        time_slot_intervals = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        open_intervals = [new Interval(0, 14), new Interval(15, 29), new Interval(31, 42)]
        service_duration = 0
        let output

        try{output = getTimeSlotAvailabilities(open_intervals, service_duration, time_slot_intervals)}catch(err){}
        assert.equal(output === undefined, true, "service_duration <= 0 ")   
        
    });

    beforeEach(() => {
        open_intervals = null
        service_duration = null
        time_slot_intervals = null
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

     it("returns true on valid time slots arr", () => {
       
        time_slots = [new Interval(0, 20), new Interval(20, 40),new Interval(40, 60)]
        min_max_interval = new Interval(0,60)
               
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

     it("returns false when timeslot1.end != timeslot2.start", () => {
       
        time_slots = [new Interval(0, 19), new Interval(20, 40),new Interval(40, 60)]
        min_max_interval = new Interval(0,60)
     
        assert.equal( areTimeSlotsValid(time_slots, min_max_interval), false, "should be valid time slots")

     });

    beforeEach(() => {
        time_slots = null
        min_max_interval = null
    });

});

describe("testing getAvailability()", () => {

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
     });

     it(" throws assertion error on improper appointments ", () => {
       
        let output

        appointments = [{start: 0, end: -60}]

        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "appointments is improper")
     });

     it(" throws assertion error on improper service durations ", () => {
       
        let output

        requested_service_duration = -1

        try{output = getAvailability(breaks, appointments,time_slots,start_time,end_time,requested_service_duration) }catch(err){}
        assert.equal(output === undefined, true, "requested_service_duration is improper") 
     });
    
     it("returns no availability on service duration 15/25/45 for fully booked days", () => {
       
        appointments = [
            {start: "08:10", end: "08:55"},
            {start: "09:25", end: "09:50"},
            {start: "10:00", end: "10:45"},
            {start: "10:45", end: "11:00"},  
            {start: "11:20", end: "11:35"},
            {start: "11:40", end: "11:55"}
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
            [0,0,0,0] , 
            "output should be [0,0,0,0]"); 

        appointments = [
            {start: "08:20", end: "08:45"},
            {start: "09:15", end: "10:00"},
            {start: "10:00", end: "10:25"},
            {start: "10:45", end: "11:00"},  
            {start: "11:15", end: "11:40"},
        ]

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
            [0,0,0,0] , 
            "output should be [0,0,0,0]");
            
            appointments = [
                {start: "08:00", end: "08:45"},
                {start: "09:25", end: "9:50"},
                {start: "10:00", end: "10:25"},
                {start: "10:45", end: "11:00"},  
                {start: "11:15", end: "11:30"},
            ]
    
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
                [0,0,0,0] , 
                "output should be [0,0,0,0]"); 
     });

     it("returns correct availabilities on service duration 15 as appointments fill the day, getting confirmed or canceled", () => {
       
        appointments = [{start: "09:25", end: "09:40"},{start: "09:55", end: "10:40"}, {start: "10:45", end: "11:00"}], 
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
            [100,33,0,100] , 
            "output should be [100,33,0,100]"); 

        appointments = [{start: "09:25", end: "09:40"},{start: "09:45", end: "10:10"}, {start: "10:45", end: "11:00"},{start: "11:25", end: "11:50"}], 
            
        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [100,0,50,0] , 
            "output should be [100,0,50,0]");
            
        appointments = [
            {start: "08:15", end: "08:40"},
            {start: "09:25", end: "09:40"},
            {start: "09:45", end: "10:10"}, 
            {start: "10:45", end: "11:00"},
            {start: "11:15", end: "12:00"}
        ], 
        
        assert.deepStrictEqual(
            getAvailability(
                breaks, 
                appointments,
                time_slots,
                start_time,
                end_time,
                requested_service_duration
            ), 
            [50,0,50,0] , 
            "output should be [100,0,50,0]");       
     });

     it("returns 100% availability on service duration 15/25/45 for each time slot when there are no appoitnments for the day", () => {
       
        appointments = [], 
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
            [100,100,100,100] , 
            "output should be [100,100,100,100]"); 
            
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
                [100,100,100,100] , 
                "output should be [100,100,100,100]");  

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
                [100,100,100,100] , 
                "output should be [100,100,100,100]");  
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





