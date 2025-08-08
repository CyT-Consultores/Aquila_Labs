const fs = require("fs");
const path = require("path");
const { buscarPacientes } = require("../services/pacientes.service");
const { descargarPDF } = require("../services/descarga.service");
const { uploadToAzure } = require("../services/azure.service");

const handleConsultaPacientes = async (req, res) => {
  try {
    const cachePath = path.join(__dirname, "..", "cache", "facturas.json");

    if (!fs.existsSync(cachePath)) {
      return res.status(404).json({ error: "Archivo de facturas no encontrado" });
    }

    const facturas = JSON.parse(fs.readFileSync(cachePath, "utf-8"));

    for (const factura of facturas) {
      const document = factura.identificacion;
      const dateInit = factura.fecha_egreso;
      const dateEnd = factura.fecha_ingreso;
      const numeroFactura = factura.numero_factura;

      console.log(`Procesando factura: ${numeroFactura}`);

      const uuids = await buscarPacientes(document, dateInit, dateEnd);
      if (uuids.length === 0) {
        console.log(`Sin resultados para factura: ${numeroFactura}`);
        continue;
      }

      for (let i = 0; i < uuids.length; i++) {
        const uuid = uuids[i];
        const archivoLocal = await descargarPDF(uuid);

        const nombreRemoto = i === 0 ? "PDX.pdf" : `PDX${i}.pdf`;
        const carpetaRemota = numeroFactura;

        await uploadToAzure(carpetaRemota, archivoLocal, nombreRemoto);
        fs.unlinkSync(archivoLocal);
      }
    }

    res.json({ mensaje: "Facturas procesadas correctamente" });
  } catch (err) {
    console.error("❌ Error en procesamiento:", err);
    res.status(500).json({ error: "Error al procesar facturas" });
  }
};

module.exports = { handleConsultaPacientes };
