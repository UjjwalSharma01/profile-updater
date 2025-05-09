// Add this function to check for "isLoggedIn" state more reliably
async function checkIfLoggedIn(page) {
  try {
    // Look for elements that would only be present on the profile page
    // when the user is already logged in
    const isLoggedIn = await page.evaluate(() => {
      // These are elements that typically appear on the Naukri profile page
      // when a user is logged in
      const profileElements = document.querySelector("#lazyResumeHead") || 
                             document.querySelector("#attachCV") ||
                             document.querySelector(".naukicon-edit") ||
                             document.querySelector(".fullname");
      
      // These elements appear when the user needs to log in
      const loginElements = document.querySelector("#usernameField") || 
                           document.querySelector("#passwordField");
      
      // We're logged in if we have profile elements and no login form 
      return !!profileElements && !loginElements;
    });
    
    return isLoggedIn;
  } catch (err) {
    console.log("Error checking login status:", err);
    return false; // Assume not logged in if error
  }
}
