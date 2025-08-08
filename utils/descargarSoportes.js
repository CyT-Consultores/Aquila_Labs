const fs = require("fs");
const path = require("path");
const axios = require("axios");

const cachePath = path.join(__dirname, "..", "cache", "facturas.json");
const SOPORTE_API_URL = process.env.SOPORTE_API_URL;

async function descargarSoportesDesdeJson() {
  let data;

  try {
    data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  } catch (err) {
    console.error("❌ Error leyendo facturas cacheadas:", err.message);
    return;
  }

  for (const item of data) {
    const idIngressFilter = item.no_atencion;
    const invoiceNumber = item.numero_factura;

    const body = {
      idIngressFilter: String(idIngressFilter),
      invoiceNumber,
      invoiceStartDate: "",
      invoiceEndtDate: "",
    };

    try {
      const res = await axios.post(SOPORTE_API_URL, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        console.log(`📤 Soporte enviado: Factura ${invoiceNumber}`);
      } else {
        console.warn(`⚠️ Error factura ${invoiceNumber}: Status ${res.status}`);
        fs.appendFileSync("errores.log", `Factura ${invoiceNumber} -> ${res.status} ${res.data}\n`);
      }
    } catch (err) {
      console.error(`❌ Error al enviar soporte factura ${invoiceNumber}: ${err.message}`);
      fs.appendFileSync("errores.log", `Factura ${invoiceNumber} -> ${err.message}\n`);
    }
  }
}

module.exports = { descargarSoportesDesdeJson };
