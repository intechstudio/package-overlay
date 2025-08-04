const fs = require("fs");
const archiver = require("archiver");
const modules = fs.readdirSync("node_modules");
const output = fs.createWriteStream("package-archive.zip");
const archive = archiver("zip", { zlib: { level: 9 } });

const subfolder = "my-project-files";
if (!fs.existsSync(subfolder)) {
  fs.mkdirSync(subfolder);
}

const excludedFiles = [
  subfolder,
  "components",
  "overlay_element",
  "archive.js",
  "build.js",
  ".github",
  ".git",
];

// Get all files and directories in the current folder
const files = fs.readdirSync(".");
for (const file of files) {
  // Exclude the excluded files/directories
  if (!excludedFiles.includes(file)) {
    fs.renameSync(file, `${subfolder}/${file}`);
  }
}

//Copy components dist folder
fs.mkdirSync(`${subfolder}/components`);
fs.renameSync("components/dist", `${subfolder}/components/dist`);

//Copy overlay_element dist folder
fs.mkdirSync(`${subfolder}/overlay_element`);
fs.renameSync("overlay_element/dist", `${subfolder}/overlay_element/dist`);

output.on("close", () => {
  console.log("Archive created successfully.");
});

archive.pipe(output);
archive.directory(subfolder, false);
archive.finalize();

console.log("Dependencies removed and archive created.");
