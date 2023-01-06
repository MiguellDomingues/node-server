const context_map = new Set()
context_map.add("validateLogin")

module.exports = function log(func_name,info_str, ...obj  ){

   if(!context_map.has(func_name)) return

    console.log("//////////////////////////////")
    console.log("context: ", info_str)
    console.log("//////////////////////////////")
  
    for (const [key, value] of Object.entries(obj[0])) {
  	    console.log(`${key}: ${value} `);
    }

    console.log("//////////////////////////////")
  

}