const HJSON = require("hjson");
const fs = require("fs");
const { join } = require("path");

const { databaseUrl: dbUrl } = HJSON.parse(fs.readFileSync(join(__dirname, "./config/config.hjson"), "utf8"));
fs.writeFileSync(join(__dirname, ".env"), `# DO NOT EDIT, AUTOGENERATED
DATABASE_URL=${dbUrl}`)