const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");

const jar = new tough.CookieJar();
const axiosInstance = wrapper(axios.create({ jar, withCredentials: true }));

module.exports = axiosInstance;
