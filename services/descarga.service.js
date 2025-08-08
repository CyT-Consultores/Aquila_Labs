require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axiosInstance = require("../utils/axiosInstance");

const extractUUIDs = (data) => {
  const htmlString = data?.data || "";
  const regex = /\/report\/reading\/([a-f0-9-]{36})/g;
  const matches = [];
  let match;

  while ((match = regex.exec(htmlString)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};

const descargarPDF = async (uuid) => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const url = `${process.env.IMEXHS_BASE_URL}/report/reading/${uuid}`;
  const filePath = path.join(uploadsDir, `${uuid}.pdf`);

  console.log(`⬇️  Descargando PDF UUID: ${uuid}`);

  const response = await axiosInstance.get(url, {
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", () => {
      console.log(`✅ PDF guardado en: ${filePath}`);
      resolve(filePath);
    });
    writer.on("error", (err) => {
      console.error(`❌ Error escribiendo archivo PDF UUID ${uuid}: ${err.message}`);
      reject(err);
    });
  });
};

module.exports = { extractUUIDs, descargarPDF };
