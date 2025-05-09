// Modified segment for the openBrowser function
// Replace the current login handling with this code

// After this line:
// await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });

// Add these lines:
// Check if we're already logged in
console.log("Checking login status...");
    
const isLoggedIn = await page.evaluate(() => {
  // Check for elements that would only be present after login
  const profileElements = document.querySelector("#lazyResumeHead") || 
                          document.querySelector("#attachCV") ||
                          document.querySelector(".naukicon-edit") ||
                          document.querySelector(".fullname");
  
  // Check for login form elements
  const loginElements = document.querySelector("#usernameField") || 
                        document.querySelector("#passwordField");
  
  // If we have profile elements and no login elements, we're logged in
  return !!profileElements && !loginElements;
});

if (isLoggedIn) {
  console.log("Already logged in, continuing with profile update");
} else {
  console.log("Not logged in, attempting to login");
  
  try {
    // Wait for the login form to appear
    await page.waitForSelector("#usernameField", { timeout: 5000 });
    console.log("Login form detected, attempting to log in");
    await page.type("#usernameField", config.email);
    await page.type("#passwordField", config.password);
    const loginButton = await page.$(
      ".waves-effect.waves-light.btn-large.btn-block.btn-bold.blue-btn.textTransform"
    );
    
    if (loginButton) {
      await Promise.all([page.waitForNavigation(), loginButton.click()]);
    } else {
      console.log("Login button not found, attempting alternative login method");
      // Try submitting the form directly
      await page.evaluate(() => {
        document.querySelector('form').submit();
      });
      await page.waitForNavigation();
    }
    
    // Navigate to the profile page after login
    console.log("Logged in, navigating to profile page");
    await page.goto(URL, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
  } catch (err) {
    console.log("Login form detection error:", err);
    
    // Try looking for login links/buttons if the login form isn't immediately visible
    try {
      const loginLink = await page.$('a[href*="login"], button:has-text("Login"), a:has-text("Login")');
      if (loginLink) {
        console.log("Found login link, clicking it");
        await Promise.all([
          page.waitForNavigation(),
          loginLink.click()
        ]);
        
        // Now try to login
        if (await page.$('#usernameField')) {
          await page.type("#usernameField", config.email);
          await page.type("#passwordField", config.password);
          await page.click(".waves-effect.waves-light.btn-large.btn-block.btn-bold.blue-btn.textTransform");
          await page.waitForNavigation();
        }
      }
    } catch (linkErr) {
      console.log("Could not find or use login link:", linkErr);
    }
  }
}

// Check if we made it to the profile page before continuing
const onProfilePage = await page.evaluate(() => {
  return !!document.querySelector("#attachCV") || !!document.querySelector("#lazyResumeHead");
});

if (!onProfilePage) {
  console.log("Could not reach profile page, aborting");
  return false;
}

// Then continue with the existing code for updating resume
// ...
