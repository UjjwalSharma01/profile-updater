import AdmZip from "adm-zip";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.resolve(__dirname, "../build");
const OUTPUT_ZIP = path.resolve(__dirname, "../profile-updater-linux.zip");

// Create a new zip file
const zip = new AdmZip();

// Add the build directory to the zip
function addDirectoryToZip(directory, zipPath = "") {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      addDirectoryToZip(filePath, path.join(zipPath, file));
    } else {
      const fileData = fs.readFileSync(filePath);
      const fileZipPath = path.join(zipPath, file);
      zip.addFile(fileZipPath, fileData);
    }
  }
}

// Add the build directory
addDirectoryToZip(BUILD_DIR);

// Write the zip file
zip.writeZip(OUTPUT_ZIP);

console.log(`Zip file created at ${OUTPUT_ZIP}`);
