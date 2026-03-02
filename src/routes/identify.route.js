const express = require("express");
const router = express.Router();
const identifyController = require("../controllers/identify.controller");

router.post("/", identifyController.identifyContact);
module.exports = router;