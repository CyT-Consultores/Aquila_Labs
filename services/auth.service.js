const axiosInstance = require("../utils/axiosInstance");

const loginZentria = async () => {
  const form = new URLSearchParams();
  form.append("_username", process.env.IMEXHS_USERNAME); // ✅ correcto
  form.append("_password", process.env.IMEXHS_PASSWORD); // ✅ correcto

  await axiosInstance.post(`${process.env.IMEXHS_BASE_URL}/login_check`, form); // ✅ correcto
};

module.exports = { loginZentria };
