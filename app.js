import getDaylilyData from "./getDaylilyData.js";
import fs from "fs";

getDaylilyData("user.csv", "ahs.csv", csv => {
  fs.writeFile("output.csv", csv, err => {
    if (err) console.log;
  });
});
