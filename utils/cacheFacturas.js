// utils/cacheFacturas.js
const fs = require("fs");
const path = require("path");
const { obtenerFacturas } = require("../services/facturas.service");

const cachePath = path.join(__dirname, "..", "cache", "facturas.json");

async function cachearFacturas() {
  try {
    const facturas = await obtenerFacturas();
    fs.writeFileSync(cachePath, JSON.stringify(facturas, null, 2), "utf-8");
    console.log(`✅ ${facturas.length} facturas cacheadas en facturas.json`);
  } catch (err) {
    console.error("❌ Error al cachear facturas:", err.message);
  }
}

cachearFacturas();
