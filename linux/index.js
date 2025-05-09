#!/usr/bin/env node

import * as fsPromise from "fs/promises";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";

import puppeteer from "puppeteer-core";
import arg from "arg";
import { SysTray } from "node-systray-v2";

// Import Linux-specific notification module
import nodeNotifier from "node-notifier";

// Try to import image from different locations for better reliability
let image;
try {
  // First try the local directory (after copy-assets.sh runs)
  image = (await import("./image.js")).default;
} catch (err) {
  try {
    // Fallback to the parent directory
    image = (await import("../image.js")).default;
  } catch (err2) {
    console.error("Could not load image file:", err2);
    // Provide a minimal icon as fallback
    image = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABhSURBVDhP7Y9BCsAwCAR9Wn9i/qnZxUIpIUbsgQgZEHQdWReAA5Zkaq/sVrE6G2i9F6c/BQ9iCvR+Z3uaMBB4YAyg8uCIAIY95RnIHWY7hH3MYa84XJy/cU1hZ0DjB7wACWFi+mkBfrkAAAAASUVORK5CYII=";
  }
}

// Default configurations for Linux
const DEFAULT_UPDATE_TIME = 4 * 60 * 60 * 1000; // milliseconds (4 hours)
// Default paths for common browsers on Linux
const DEFAULT_BROWSER_PATHS = {
  edge: "/usr/bin/microsoft-edge",
  chrome: "/usr/bin/google-chrome",
  chromium: "/usr/bin/chromium-browser",
  brave: "/usr/bin/brave-browser"
};

// We'll set a default browser path that we'll later verify
let DEFAULT_BROWSER_PATH = DEFAULT_BROWSER_PATHS.chrome; 

// Try to find an available browser synchronously (for immediate startup)
for (const [name, browserPath] of Object.entries(DEFAULT_BROWSER_PATHS)) {
  try {
    if (fs.existsSync(browserPath)) {
      DEFAULT_BROWSER_PATH = browserPath;
      console.log(`Found browser: ${name} at ${browserPath}`);
      break;
    }
  } catch (err) {
    // Browser not found, continue checking
  }
}

const URL = "https://www.naukri.com/mnjuser/profile";

const isProduction = typeof process.pkg !== "undefined";

const __filename = isProduction ? process.execPath : fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addToSysTray() {
  const systray = new SysTray({
    menu: {
      // Using .png icon for Linux
      icon: image,
      title: "Profile updater",
      tooltip: "Profile updater",
      items: [
        {
          title: "Exit",
          tooltip: "Exit the application",
          checked: false,
          enabled: true,
        },
      ],
    },
    debug: false,
    copyDir: true,
  });
  
  systray.onClick((action) => {
    if (action.seq_id === 0) {
      systray.kill();
      process.exit(0);
    }
  });
}

async function startOnStartup() {
  // Create autostart entry for Linux
  const autostartDir = path.join(os.homedir(), ".config/autostart");
  const desktopEntry = `[Desktop Entry]
Type=Application
Name=Profile Updater
Exec=${__filename}
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Terminal=false
Comment=Auto-updates Naukri profile
`;

  try {
    try {
      await fsPromise.access(autostartDir);
    } catch (err) {
      await fsPromise.mkdir(autostartDir, { recursive: true });
    }
    
    const desktopFilePath = path.join(autostartDir, "profile-updater.desktop");
    await fsPromise.writeFile(desktopFilePath, desktopEntry);
    console.log("Autostart entry created successfully at:", desktopFilePath);
  } catch (err) {
    console.error("Failed to create autostart entry:", err);
    return false;
  }
  
  return true;
}

function sendNotification(title, message) {
  // Get icon path (try multiple locations)
  let iconPath;
  const localIcon = path.resolve(__dirname, "./profile-changer.png");
  const parentIcon = path.resolve(__dirname, "../profile-changer.png");
  
  try {
    if (fs.existsSync(localIcon)) {
      iconPath = localIcon;
    } else if (fs.existsSync(parentIcon)) {
      iconPath = parentIcon;
    }
  } catch (err) {
    console.log("Could not find notification icon:", err);
  }

  nodeNotifier.notify({
    title,
    message,
    icon: iconPath, // Using PNG for Linux
    sound: true,
    wait: false
  });
}

TEMP_PLACEHOLDER

async function handleBrowserNotification(config) {
  try {
    // Verify browser exists before attempting to launch
    try {
      await fsPromise.access(config.browserUrl);
    } catch (err) {
      console.error(`Browser not found at ${config.browserUrl}`);
      sendNotification(
        "Browser not found",
        `Could not find browser at ${config.browserUrl}. Run with --init flag to detect available browsers.`
      );
      return;
    }
    
    const browserAction = await openBrowser(config);
    if (browserAction) {
      sendNotification(
        "Profile updated successfully",
        "Enjoy your life in peace"
      );
    } else {
      sendNotification(
        "There was some error while updating profile",
        "Please check the error log for details"
      );
    }
  } catch (err) {
    console.error("Error in profile update:", err);
    logError(err);
    sendNotification(
      "Profile update failed",
      "An unexpected error occurred. Check error logs for details."
    );
  }
}

function usage() {
  console.log(`tool [CMD]
  --help\tTo check all the commands
  --init\tInitialize the app
  --email String\tadd your email using flag like this '--email example@ex.com'
  --password String\tadd your password using flag like this '--password yourpassword'
  --resumeUrl String\tadd your resume path using flag like this ' --resumeUrl "/path/to/your/resume.pdf" ' please notice the '/' and '"'
  --resumeHeadlines String\tadd your resume path using flag like this ' --resumeHeadlines "Hi am jobless" ' you can use this command multiple times to add multiple headlines code will update one at random
  --startOnStartup\tenable start on startup - creates autostart entry
  `);
}

async function writeConfig(config) {
  await fsPromise.writeFile(
    path.join(__dirname, "./config.json"),
    JSON.stringify(config, null, 2)
  );
}

async function logError(err) {
  await fsPromise.appendFile(path.join(__dirname, './error.log'), 
    `[${new Date().toISOString()}] ${err.stack || err}\n`
  );
}

async function main() {
  let config = null;

  try {
    const args = arg({
      "--init": Boolean,
      "--help": Boolean,
      "--email": String,
      "--password": String,
      "--resumeUrl": String,
      "--resumeHeadlines": String,
      "--startOnStartup": Boolean,
    });

    if (args["--help"]) {
      usage();
      return;
    } else if (args["--init"]) {
      // Try to find an available browser
      let browserPath = DEFAULT_BROWSER_PATH;
      let browserFound = false;
      
      for (const [name, path] of Object.entries(DEFAULT_BROWSER_PATHS)) {
        try {
          await fsPromise.access(path);
          browserPath = path;
          console.log(`Found browser: ${name} at ${path}`);
          browserFound = true;
          break;
        } catch (err) {
          // Browser not found, continue checking
        }
      }
      
      if (!browserFound) {
        console.log("Warning: No supported browser found automatically. You may need to set the browser path manually.");
        console.log("Available options:");
        console.log("- Chrome: usually at /usr/bin/google-chrome");
        console.log("- Chromium: usually at /usr/bin/chromium-browser");
        console.log("- Brave: usually at /usr/bin/brave-browser");
        console.log("- Microsoft Edge: usually at /usr/bin/microsoft-edge");
      }
      
      await writeConfig({
        browserUrl: browserPath,
        timer: DEFAULT_UPDATE_TIME,
      });
      console.log("Config initialized with browser path:", browserPath);
      return;
    } else if (args["--startOnStartup"]) {
      await startOnStartup();
      return;
    }

    config = await fsPromise.readFile(path.join(__dirname, "./config.json"), "utf8").catch((err) => {
      console.log(`Ohh! configs not found please run this tool with --init flag
      you can also use --help flag to check all the flags`);
    });

    if (!config) return;

    config = JSON.parse(config);

    if (!config) return;

    if (args["--email"]) {
      config.email = args["--email"];
      await writeConfig(config);
      console.log("Email updated successfully");
      return;
    }

    if (!config.email) {
      console.log(
        `No email found please add your adding flag like '--email example@ex.com'`
      );
      return;
    }

    if (args["--password"]) {
      config.password = args["--password"];
      await writeConfig(config);
      console.log("Password updated successfully");
      return;
    }

    if (!config.password) {
      console.log(
        `No password found please add your adding flag like '--password yourpassword'`
      );
      return;
    }

    if (args["--resumeUrl"]) {
      config.resumeUrl = args["--resumeUrl"];
      await writeConfig(config);
      console.log("Resume path updated successfully");
      return;
    }

    if (!config.resumeUrl) {
      console.log(
        `No resume path found please add your adding flag like ' --resumeUrl "/path/to/your/resume.pdf" ' please notice the '/' and '"'`
      );
      return;
    }

    if (args["--resumeHeadlines"]) {
      if (config.resumeHeadlines) {
        config.resumeHeadlines.push(args["--resumeHeadlines"]);
      } else {
        config.resumeHeadlines = [args["--resumeHeadlines"]];
      }
      await writeConfig(config);
      console.log("Resume headline added successfully");
      return;
    }
  } catch (err) {
    if (err.message.includes("Unexpected token")) {
      console.log(
        "Looks like there is some error in parsing configs please try running with --init flag again"
      );
      return;
    }
    console.log(err.message);
    logError(err);
    usage();
    return;
  }

  // Verify configuration
  if (!fs.existsSync(config.browserUrl)) {
    console.error(`Error: Browser not found at ${config.browserUrl}`);
    console.log("Please run with --init flag to re-detect available browsers or manually configure browserUrl in config.json");
    return;
  }
  
  // Initialize system tray
  try {
    addToSysTray();
    console.log("System tray icon initialized");
  } catch (err) {
    console.error("Failed to initialize system tray icon:", err);
    console.log("The application will continue running but without a system tray icon");
    logError(err);
  }

  // Display startup notification
  sendNotification(
    "Profile Updater Started",
    "The profile updater is now running in the background"
  );

  console.log(`Profile updater is running in the background. Next update in ${config.timer/3600000} hours.`);
  
  // Run initial update after a short delay to ensure notifications are working
  setTimeout(() => {
    handleBrowserNotification(config);
    
    // Set interval for regular updates
    setInterval(async () => {
      handleBrowserNotification(config);
    }, config.timer);
  }, 5000);
}

main().catch(err => {
  console.error("Fatal error:", err);
  logError(err);
});
