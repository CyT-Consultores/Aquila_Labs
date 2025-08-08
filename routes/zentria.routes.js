const express = require("express");
const router = express.Router();
const { handleConsultaPacientes } = require("../controllers/zentria.controller");

router.post("/buscar", handleConsultaPacientes);

module.exports = router;
