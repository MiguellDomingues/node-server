const configs = require('../../utils/constants.js')

const fetchConfigs = (req,res) => {

    const key = null
    
    try
    {
      const res_json =  { 
        DOMAIN:                   configs.DOMAIN,
        ENDPOINT_URL_LOCATION:    configs.ENDPOINT_URL_LOCATION,
        ENDPOINT_URL_APPOINTMENT: configs.ENDPOINT_URL_APPOINTMENT,
        ENDPOINT_URL_AUTH:        configs.ENDPOINT_URL_AUTH,
        ENDPOINT_URL_REGISTER:    configs.ENDPOINT_URL_REGISTER,
        STATUS:                   configs.STATUS,
        ICONS:                    configs.ICONS
    }
      

    console.log("/config ", res_json )
      
      res.setHeader('Content-Type', 'application/json');
      res.send( JSON.stringify(res_json) );
  
    }catch(err){
  
      console.log("err fetching configs")
      console.error(err)
      res.status(500).send('Internal Server Error');
  
    }; 
}

  //////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { fetchConfigs }