const identifyService = require("../services/identify.service");

exports.identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided",
      });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }
    
    const result = await identifyService.handleIdentify(email, phoneNumber);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};