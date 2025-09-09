const express = require("express");
const cors = require("cors");
const sequelize = require("./database");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(3000, () =>
    console.log("Server running on http:/127.0.0.1:3000"),
  );
});
