const DATABASE_DOMAIN   = '127.0.0.1:27017';          
const DATABASE_NAME     = 'appointment_bookings';     

const DATABASE_URI      = `mongodb://${DATABASE_DOMAIN}/${DATABASE_NAME}`;

const KEY_PARAM = '?key='

const DOMAIN = 'http://localhost:8080'
const ENDPOINT_URL_LOCATION = '/locations'
const ENDPOINT_URL_APPOINTMENT = '/appointment'
const ENDPOINT_URL_AUTH = '/auth'
const ENDPOINT_URL_REGISTER = '/register'

const ICONS = [
    'FaWrench',
    'MdOutlineCarRepair',
    'FaOilCan',
    'MdLocalCarWash',
    'GiMechanicGarage',  
    'FaCarBattery',
]

const STATUS = ['Approved', 'In Progress', 'Completed', 'Canceled']

const DAY_NAMES = ['Monday','Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DAY_ABBREVIATIONS = ['Mon','Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const AUTH_USER_TYPES = ['USER', 'STOREOWNER']
const NO_AUTH_USER_TYPE = ['GUEST']
const PORT = 8080

module.exports = {
    DAY_NAMES,
    DAY_ABBREVIATIONS,
    STATUS, 
    ICONS,
    AUTH_USER_TYPES, 
    NO_AUTH_USER_TYPE, 
    PORT, 
    DOMAIN,
    ENDPOINT_URL_LOCATION,
    ENDPOINT_URL_APPOINTMENT,
    ENDPOINT_URL_AUTH,
    ENDPOINT_URL_REGISTER,
    DATABASE_DOMAIN,
    DATABASE_NAME,
    DATABASE_URI 
}
