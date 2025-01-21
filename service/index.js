const axios = require("axios");
const customLogger = require("../config/customLogger");

const instance = axios.create({
    baseURL: 'http://ekpress-salary.itdevs.uz'
});

instance.interceptors.request.use(function (config) {
    let token = null;
    if (token) {
        config.headers.common['Access-Control-Allow-Origin'] = '*'
        config.headers.common['Authorization'] = 'Bearer ' + token
    }

    return config;
})

instance.interceptors.response.use(
    response => response,
    error => {
        // if(error.response.status==401){
            
        // }
        customLogger.log({
            level: 'error',
            message: error
        });
        return Promise.reject(error)
    }
);

module.exports = instance