import child_process from "child_process";
import exifr from "exifr";
import { createWriteStream, readdirSync } from "fs";
import { promisify } from "util";

const exec = promisify(child_process.exec);

const minutesToAdd = 7;

const dir = `E:\\${minutesToAdd.toString()}`;
const logFile = createWriteStream("photos.log");
const photos = readdirSync(dir);

for (let i = 0; i < photos.length; i++) {
  const filename = photos[i];
  const path = dir + "\\" + filename;

  const { DateTimeOriginal: oldDate } = await exifr.parse(path);
  const newDate = new Date(oldDate.getTime() + minutesToAdd * 60 * 1000);

  const oldTime = oldDate.toLocaleTimeString();
  const newTime = newDate.toLocaleTimeString();
  log(`> [${filename}] ${oldTime} → ${newTime} (${i + 1}/${photos.length})`);

  const YYYY = newDate.getFullYear();
  const mm = zeroPad(newDate.getMonth() + 1);
  const dd = zeroPad(newDate.getDate());
  const HH = zeroPad(newDate.getHours());
  const MM = zeroPad(newDate.getMinutes());
  const SS = zeroPad(newDate.getSeconds());
  const exiftoolFormat = `${YYYY}:${mm}:${dd} ${HH}:${MM}:${SS}`;

  const { stdout, stderr, error } = await exec(
    `exiftool -overwrite_original -DateTimeOriginal="${exiftoolFormat}" -CreateDate="${exiftoolFormat}" "${path}"`
  );

  if (stdout) {
    log(stdout);
  }
  if (stderr) {
    err(stderr);
  }
  if (error) {
    err(error);
  }
}

function zeroPad(n) {
  return (n < 10 ? "0" : "") + n;
}

function log(message) {
  console.log(message);
  logFile.write(message + "\n");
}

function err(message) {
  message = "ERROR:\n" + message;
  console.error(message);
  logFile.write(message + "\n");
}
