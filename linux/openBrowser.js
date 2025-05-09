async function openBrowser(config) {
  // Get the user's default Chrome profile path
  const homeDir = os.homedir();
  const defaultProfilePath = path.join(homeDir, '.config/google-chrome');
  const tempProfilePath = path.join(os.tmpdir(), 'profile-updater-tmp-chrome');
  let browser = null;
  
  try {
    // First check if browser executable exists
    await fsPromise.access(config.browserUrl);
    const { spawn } = await import('child_process');
    
    // Try to open URL in existing Chrome session
    console.log("Trying to open URL in existing Chrome session");
    const chromeProcess = spawn(config.browserUrl, [
      `--user-data-dir=${defaultProfilePath}`,
      '--profile-directory=Default',
      URL
    ]);
    
    // Give the browser some time to open the URL
    console.log("Waiting for the URL to open in your existing Chrome session...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Use a temporary profile for Puppeteer to avoid conflicts with the existing Chrome session
    console.log("Launching automation browser with temporary profile...");
    browser = await puppeteer.launch({
      executablePath: config.browserUrl,
      headless: isProduction,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        `--user-data-dir=${tempProfilePath}`, // Use temporary profile for automation
        '--no-first-run',
        '--no-default-browser-check'
      ],
    });
    
    // Try to reuse existing pages before creating a new one
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the URL with the temporary session
    console.log("Navigating to profile page...");
    await page.goto(URL, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    
    // Check if we're already logged in
    console.log("Checking login status...");
    
    // Better check for being logged in by looking for profile-specific elements
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
        
        // Try looking for login links/buttons
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
    
    // Check if we made it to the profile page
    const onProfilePage = await page.evaluate(() => {
      return !!document.querySelector("#attachCV") || !!document.querySelector("#lazyResumeHead");
    });
    
    if (!onProfilePage) {
      console.log("Could not reach profile page, aborting");
      return false;
    }
    
    //? updating resume
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click("#attachCV"),
    ]);
    await fileChooser.accept([config.resumeUrl]);
    
    await page.waitForSelector('#lazyAttachCV .msg', { visible: true });

    if (config.resumeHeadlines?.length) {
      // //? updating headline
      await page.click("#lazyResumeHead .edit.icon");
      await page.evaluate(() => {
        const inputField = document.querySelector("#resumeHeadlineTxt");
        inputField.value = ""; // Directly set the value to empty
      });
      await page.type(
        "#resumeHeadlineTxt",
        config.resumeHeadlines[Math.round(Math.random() * (config.resumeHeadlines?.length - 1))]
      );
      await page.click(`form[name="resumeHeadlineForm"] .btn-dark-ot`);

      await page.waitForSelector('#lazyResumeHead .msg', { visible: true });
    }

    return true;
  } catch (err) {
    console.log("Error during browser automation:", err);
    return false;
  } finally {
    // Close the browser if it was initialized
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.log("Error closing browser:", err);
      }
    }
  }
}
