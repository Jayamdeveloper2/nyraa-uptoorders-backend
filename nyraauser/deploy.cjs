// const FtpDeploy = require("ftp-deploy");
// const ftpDeploy = new FtpDeploy();

// const config = {
//   user: "nyraaecommerce@jayamdesigners.co.in",
//   password: "hWO9zfDY@}}S",
//   host: "ftp.jayamdesigners.co.in",
//   port: 21,
//   localRoot: __dirname + "/dist",
//   remoteRoot: "/public_html/",
//   include: ["*", "**/*"],
//   deleteRemote: true,
//   forcePasv: true
// };

// ftpDeploy
//   .deploy(config)
//   .then(res => console.log("✅ Deployed successfully:", res))
//   .catch(err => console.error("❌ Deployment failed:", err));


const path = require("path");
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
  user: "nyraaecommerce@jayamdesigners.co.in",
  password: "hWO9zfDY@}}S", // You can move this to .env for security
  host: "ftp.jayamdesigners.co.in",
  port: 21,
  localRoot: path.join(__dirname, "dist"),       // ✅ your compiled frontend files
  remoteRoot: "/public_html/nyraa/",             // ✅ correct subdirectory
  include: ["*", "**/*"],
  deleteRemote: true,                            // ✅ removes old files in nyraa folder
  forcePasv: true
};

ftpDeploy
  .deploy(config)
  .then(res => console.log("✅ Deployed successfully:", res))
  .catch(err => console.error("❌ Deployment failed:", err));
