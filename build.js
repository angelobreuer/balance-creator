var packager = require("electron-packager");

var options = {
  arch: "ia32",
  platform: "win32",
  dir: "./dist",
  "app-copyright": "Angelo Breuer",
  "app-version": "2.1.6",
  asar: false,
  name: "Bilanzenersteller2",
  out: "./releases",
  overwrite: true,
  prune: true,
  version: "1.0.0",
  "version-string": {
    CompanyName: "Angelo Breuer",
    FileDescription: "Bilanzenersteller",
  },
};
packager(options, function done_callback(err, appPaths) {
  console.log("Error: ", err);
  console.log("appPaths: ", appPaths);
});
