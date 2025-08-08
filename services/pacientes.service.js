const axiosInstance = require("../utils/axiosInstance");
const cheerio = require("cheerio");

const buscarPacientes = async (document, dateInit, dateEnd) => {
  const url = `${process.env.IMEXHS_BASE_URL}/common/patient/SearchDataPatient/grid`;

  const form = new URLSearchParams();
  form.append("document", document);
  form.append("dateInit", dateInit);
  form.append("dateEnd", dateEnd);

  const response = await axiosInstance.post(url, form);
  const data = response.data;

  const reportIds = [];

  // Recorremos todas las propiedades del objeto por si hay varias partes con HTML
  for (const key in data) {
    if (typeof data[key] === "string" && data[key].includes("/report/reading/")) {
      const $ = cheerio.load(data[key]);

      $("a[href^='/report/reading/']").each((_, el) => {
        const href = $(el).attr("href");
        const uuid = href.split("/").pop();
        reportIds.push(uuid);
      });
    }
  }

  return reportIds;
};

module.exports = { buscarPacientes };
