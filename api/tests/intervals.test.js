const test  = require("node:test"); 
const { describe, it, beforeEach } = test
const  assert = require('node:assert/strict');

const { 
    Interval, 
    MAX_MINUTES_IN_DAY,
    mergeIntervals,
    getOpenIntervals,
    sortIntervals,
    splitCountOverlapIntervals
} = require('../services/intervals.js')

function toObjects(overlap_intervals){
    return overlap_intervals.map(({interval, overlap})=>{
        const o = interval.toObject()
        delete interval
        return {...o,overlap:overlap }
    })
}

describe("testing Interval class", {skip: false}, () => {

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

describe("testing getOpenIntervals() edge cases", {skip: false}, () => {

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

describe("testing getOpenIntervals() main paths", {skip: false},() => {

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

describe("testing sortIntervals", {skip: false},() => {

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

describe("testing mergeIntervals", {skip: false},() => {

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

describe("testing splitOverlapIntervals", () => {

    let intervals;

    it("returns empty if the input is empty or null", () => { 

        intervals = []
        assert.deepStrictEqual( splitCountOverlapIntervals(intervals), [],"");     
    });

    it("returns the input with overlap: 1 if the input is a single interval", () => { 

        intervals = [new Interval(1,5)]
        assert.deepStrictEqual( 
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,5), overlap: 1}],"");     
    });

    it("testing each combination of 2 jointed intervals", () => { 

        //case 1:
        intervals = [new Interval(1,5),new Interval(3,7),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,3) , overlap: 1},
            {interval: new Interval(3,5) , overlap: 2},
            {interval: new Interval(5,7) , overlap: 1}], 
        "");

        //case 2:
        intervals = [new Interval(1,5),new Interval(3,4),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,3) , overlap: 1},
            {interval: new Interval(3,4) , overlap: 2},
            {interval: new Interval(4,5) , overlap: 1}], 
        "");

        //case 3:
        intervals = [new Interval(1,5),new Interval(1,4),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,4) , overlap: 2},
            {interval: new Interval(4,5) , overlap: 1}], 
        "");

        //case 4:
        intervals = [new Interval(1,5),new Interval(2,5),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,2) , overlap: 1},
            {interval: new Interval(2,5) , overlap: 2}], 
        "");

        //case 5:
        intervals = [new Interval(1,5),new Interval(1,5),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,5) , overlap: 2}], 
        "");

        //case 6:
        intervals = [new Interval(1,5), new Interval(1,6),]

        assert.deepStrictEqual(
            splitCountOverlapIntervals(intervals), 
            [{interval: new Interval(1,5) , overlap: 2},
            {interval: new Interval(5,6) , overlap: 1}], 
        "");
    });

    it("testing (1,7)(3,9) with new jointed interval (3,(4,5,6,7,8,9,10,11))", () => { 

        intervals.push(new Interval(3,4))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 4, overlap: 3 },
            { start: 4, end: 7, overlap: 2 },
            { start: 7, end: 9, overlap: 1 }],``);

        intervals.pop()

        intervals.push(new Interval(3,5))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 5, overlap: 3 },
            { start: 5, end: 7, overlap: 2 },
            { start: 7, end: 9, overlap: 1 }],``);
        
        intervals.pop()

        intervals.push(new Interval(3,6))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 6, overlap: 3 },
            { start: 6, end: 7, overlap: 2 },
            { start: 7, end: 9, overlap: 1 }],``);
        
        intervals.pop()

        intervals.push(new Interval(3,7))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 7, overlap: 3 },
            { start: 7, end: 9, overlap: 1 }],``);
        
        intervals.pop()

        intervals.push(new Interval(3,8))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 7, overlap: 3 },
            { start: 7, end: 8, overlap: 2 },
            { start: 8, end: 9, overlap: 1 },],``);
        
        intervals.pop()

        intervals.push(new Interval(3,9))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 7, overlap: 3 },
            { start: 7, end: 9, overlap: 2 }],``);
        
        intervals.pop()

        intervals.push(new Interval(3,10))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 7, overlap: 3 },
            { start: 7, end: 9, overlap: 2 },
            { start: 9, end: 10, overlap: 1 }],``);
        
        intervals.pop()

        intervals.push(new Interval(3,11))

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
            [{ start: 1, end: 3, overlap: 1 },
            { start: 3, end: 7, overlap: 3 },
            { start: 7, end: 9, overlap: 2 },
            { start: 9, end: 11, overlap: 1 }],``);
        
    });

    it("testing (1,7)(3,9)(4,6) with various cases", () => { 

        intervals.push(new Interval(4,6))

        intervals.push(new Interval(5,8))

       // console.log(toObjects(splitOverlaps(intervals) ) )

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
          [ { start: 1, end: 3 , overlap: 1 },
            { start: 3, end: 4 , overlap: 2 },
            { start: 4, end: 5 , overlap: 3 },
            { start: 5, end: 6 , overlap: 4 },
            { start: 6, end: 7 , overlap: 3 },
            { start: 7, end: 8 , overlap: 2 },
            { start: 8, end: 9 , overlap: 1 }],``);

        intervals.pop()

        intervals.push(new Interval(7,11))

        console.log(toObjects(splitCountOverlapIntervals(intervals) ) )

        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
          [ { start: 1, end: 3 , overlap: 1 },
            { start: 3, end: 4 , overlap: 2 },
            { start: 4, end: 6 , overlap: 3 },
            { start: 6, end: 7 , overlap: 2 },
            { start: 7, end: 9 , overlap: 2 },
            { start: 9, end: 11 , overlap: 1 }],``);

        intervals.pop()     
    });

    it("testing input with disjointed intervals", () => { 

        intervals = [new Interval(1,5),new Interval(5,7),]
 
        assert.deepStrictEqual(
            toObjects(splitCountOverlapIntervals(intervals)), 
          [ { start: 1, end: 5, overlap: 1 }, { start: 5, end: 7, overlap: 1 } ],``);
         
         intervals = [new Interval(1,5),new Interval(6,7),]
 
         assert.deepStrictEqual(
             toObjects(splitCountOverlapIntervals(intervals)), 
         [ { start: 1, end: 5, overlap: 1 }, { start: 6, end: 7, overlap: 1 } ],``);
 
         intervals = [new Interval(1,5),new Interval(3,7),new Interval(7,8)]
 
         assert.deepStrictEqual(
             toObjects(splitCountOverlapIntervals(intervals)), 
         [{ start: 1, end: 3, overlap: 1 },
          { start: 3, end: 5, overlap: 2 },
          { start: 5, end: 7, overlap: 1 },
          { start: 7, end: 8, overlap: 1 } ],``);
 
          intervals = [
             new Interval(1,5),
             new Interval(3,7),
             new Interval(7,11),
             new Interval(8,9),
         ]
 
          assert.deepStrictEqual(
              toObjects(splitCountOverlapIntervals(intervals)), 
          [  { start: 1, end: 3, overlap: 1 },
             { start: 3, end: 5, overlap: 2 },
             { start: 5, end: 7, overlap: 1 },
             { start: 7, end: 8, overlap: 1 },
             { start: 8, end: 9, overlap: 2 },
             { start: 9, end: 11, overlap: 1 } ],``);
 
         intervals = [
             new Interval(1,5),
             new Interval(3,7),
             new Interval(8,13),
             new Interval(8,14),
         ]
 
         //console.log(toObjects(splitOverlaps(intervals) ) )
 
         assert.deepStrictEqual(
             toObjects(splitCountOverlapIntervals(intervals)), 
         [ { start: 1, end: 3, overlap: 1 },
             { start: 3, end: 5, overlap: 2 },
             { start: 5, end: 7, overlap: 1 },
             { start: 8, end: 13, overlap: 2 },
             { start: 13, end: 14, overlap: 1 }],``);
    });

    /*
    it("performance testing for ", () => { 

        function getRandom(min, max) {
            return Math.floor(Math.random() * ((max-min)+1) + min);
        }

        const max = MAX_MINUTES_IN_DAY
        let start = 1

        let i = 0
        const max_size = 5000
        const arr = []

        while(i < max_size && start < max){
            const end = getRandom(start, max)

           // console.log("s:" , start, " end: ", end) //add to list
            arr.push(new Interval(start, end))
            
            start = Math.min( getRandom(start+1, max), start + 1 )

            i++
           
        }
        const a = sortIntervals(arr)
        console.log(a[a.length-1])
        console.log(a.length)
        console.log(i)
        
        
    });
    */

     

    beforeEach(() => {
        intervals= [new Interval(1,7), new Interval(3,9)]
    });

});





