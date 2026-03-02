const express = require("express");
const identifyService = require("../services/identifyService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await identifyService(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;