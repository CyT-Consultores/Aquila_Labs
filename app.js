require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const app = express();

const zentriaRoutes = require("./routes/zentria.routes");
const { obtenerFacturas } = require("./services/facturas.service");
const { loginZentria } = require("./services/auth.service");
const { buscarPacientes } = require("./services/pacientes.service");
const { descargarPDF } = require("./services/descarga.service");
const { uploadToAzure } = require("./services/azure.service");
const { descargarSoportesDesdeJson } = require("./utils/descargarSoportes");

app.use(express.json());
app.use("/zentria", zentriaRoutes);

const cachePath = path.join(__dirname, "cache", "facturas.json");

// 🧩 Cachear facturas
async function cachearFacturas() {
  try {
    const facturas = await obtenerFacturas();
    fs.writeFileSync(cachePath, JSON.stringify(facturas, null, 2), "utf-8");
    console.log(`✅ ${facturas.length} facturas cacheadas`);
    return facturas;
  } catch (err) {
    console.error("❌ Error al cachear facturas:", err.message);
    return [];
  }
}

// 🧩 Procesar facturas
async function procesarFacturas(facturas) {
  try {
    await loginZentria();

    for (const factura of facturas) {
      const {
        numero_factura,
        identificacion,
        fecha_egreso,
        fecha_ingreso,
      } = factura;

      console.log(`📦 Procesando factura: ${numero_factura}`);

      try {
        const uuids = await buscarPacientes(identificacion, fecha_ingreso, fecha_egreso);

        let index = 0;
        for (const uuid of uuids) {
          try {
            const archivoLocal = await descargarPDF(uuid);
            const remoteFileName = index === 0 ? "PDX.pdf" : `PDX${index}.pdf`;
            const remoteFolder = numero_factura;

            await uploadToAzure(remoteFolder, archivoLocal, remoteFileName);
            fs.unlinkSync(archivoLocal);
            index++;
          } catch (err) {
            console.error(`❌ Error UUID ${uuid}: ${err.message}`);
            fs.appendFileSync("errores.log", `Factura ${numero_factura}, UUID ${uuid} -> ${err.message}\n`);
          }
        }
      } catch (err) {
        console.error(`❌ Error en factura ${numero_factura}: ${err.message}`);
        fs.appendFileSync("errores.log", `Factura ${numero_factura} -> ${err.message}\n`);
      }

      await new Promise((r) => setTimeout(r, 1000)); // opcional
    }

    console.log("✅ Proceso de facturas completo");
  } catch (err) {
    console.error("❌ Error general en procesamiento:", err.message);
  }
}

// 🧩 Flujo principal
async function flujoPrincipal() {
  const facturas = await cachearFacturas();

  if (facturas.length > 0) {
    // Eliminar duplicados por número de factura
    const facturasUnicas = Array.from(
      new Map(facturas.map(f => [f.numero_factura, f])).values()
    );

    await procesarFacturas(facturasUnicas);
    await descargarSoportesDesdeJson();
  } else {
    console.log("⚠️ No hay facturas para procesar");
  }
}

// ▶️ Ejecutar al iniciar
flujoPrincipal();

// 🕒 Ejecutar cada hora
cron.schedule("0 * * * *", async () => {
  console.log("🔁 Ejecución automática iniciada...");
  await flujoPrincipal();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
