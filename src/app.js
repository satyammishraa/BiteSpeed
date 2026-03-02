require("dotenv").config();
const express=require("express");
const app=express();
const prisma=require("./config/prisma");
const identifyRoute = require("./routes/identify.route");

app.use(express.json());
app.use("/identify",identifyRoute);

const PORT=process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed", error);
  }
});