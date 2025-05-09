#!/usr/bin/env node

const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');
const os = require('os');

// Test browser detection logic
async function testBrowserDetection() {
  console.log("Testing browser detection...");
  
  const browserPaths = {
    edge: "/usr/bin/microsoft-edge",
    chrome: "/usr/bin/google-chrome",
    chromium: "/usr/bin/chromium-browser",
    brave: "/usr/bin/brave-browser"
  };
  
  for (const [name, browserPath] of Object.entries(browserPaths)) {
    try {
      await fsPromise.access(browserPath).catch(() => {
        throw new Error(`Browser not found: ${name}`);
      });
      console.log(`✅ ${name} browser found at: ${browserPath}`);
    } catch (err) {
      console.log(`❌ ${name} browser not found at: ${browserPath}`);
    }
  }
}

// Test config file creation
async function testConfigCreation() {
  console.log("\nTesting config file creation...");
  
  const configPath = path.join(__dirname, "test-config.json");
  
  const testConfig = {
    browserUrl: "/usr/bin/test-browser",
    timer: 3600000,
    email: "test@example.com",
    password: "testpassword",
    resumeUrl: "/path/to/resume.pdf",
    resumeHeadlines: ["Test Headline 1", "Test Headline 2"]
  };
  
  try {
    await fsPromise.writeFile(configPath, JSON.stringify(testConfig, null, 2));
    console.log(`✅ Config file created successfully at ${configPath}`);
    
    const readConfig = JSON.parse(await fsPromise.readFile(configPath, "utf8"));
    
    if (readConfig.browserUrl === testConfig.browserUrl && 
        readConfig.email === testConfig.email &&
        readConfig.resumeHeadlines.length === 2) {
      console.log("✅ Config file read successfully with correct values");
    } else {
      console.log("❌ Config file values don't match what was written");
    }
    
    // Clean up
    await fsPromise.unlink(configPath);
  } catch (err) {
    console.error("❌ Error in config file test:", err);
  }
}

// Test autostart directory creation
async function testAutostartDir() {
  console.log("\nTesting autostart directory access...");
  
  const autostartDir = path.join(os.homedir(), ".config/autostart");
  
  try {
    await fsPromise.access(autostartDir).catch(() => {
      console.log(`ℹ️ Autostart directory doesn't exist at ${autostartDir}. Would create it in production.`);
      return false;
    });
    console.log(`✅ Autostart directory exists at ${autostartDir}`);
    return true;
  } catch (err) {
    // Already handled in the catch block above
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("=== LINUX PROFILE UPDATER TESTS ===\n");
  
  try {
    console.log("Running browser detection test...");
    await testBrowserDetection();
    console.log("Browser detection test completed");
  } catch (err) {
    console.error("Browser detection test failed:", err);
  }
  
  try {
    console.log("Running config creation test...");
    await testConfigCreation();
    console.log("Config creation test completed");
  } catch (err) {
    console.error("Config creation test failed:", err);
  }
  
  try {
    console.log("Running autostart directory test...");
    await testAutostartDir();
    console.log("Autostart directory test completed");
  } catch (err) {
    console.error("Autostart directory test failed:", err);
  }
  
  console.log("\nAll tests completed.");
  console.log("\nNOTE: The full browser automation test can't be run in this environment.");
  console.log("When running on your Linux machine, you'll need to:");
  console.log("1. Initialize the config: node index.js --init");
  console.log("2. Set your credentials and resume path");
  console.log("3. Run the tool to test the full workflow");
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
});
