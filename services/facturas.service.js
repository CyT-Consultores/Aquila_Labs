// services/facturas.service.js
const axios = require("axios");

const obtenerFacturas = async () => {
  const response = await axios.get(process.env.ZENTRIA_API_URL, {
    headers: {
      "X-API-Key": process.env.ZENTRIA_API_KEY,
    },
  });

  return response.data; // devuelve lista de facturas
};

module.exports = { obtenerFacturas };
