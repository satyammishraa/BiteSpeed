const express = require("express");
const identifyRoute = require("./routes/identify");

const app = express();
const port = 3000;

app.use(express.json());
app.use("/identify", identifyRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});