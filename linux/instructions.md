# Profile Updater for Linux - Instructions

## Overview

This tool automatically updates your Naukri.com profile at regular intervals by:
- Uploading your resume file
- Randomly selecting and updating your resume headline from a configured list
- Running silently in the system tray
- Providing desktop notifications after each update

## System Requirements

- Linux OS (tested on Ubuntu, Debian, Fedora)
- A Chromium-based browser (Edge, Chrome, Chromium, or Brave)
- NodeJS v14 or higher
- NPM v6 or higher
- 2GB RAM minimum (4GB recommended)
- 64GB RAM is more than sufficient for optimal performance

## Installation

### Option 1: Manual Installation

1. Clone or extract this directory to a location of your choice
2. Install dependencies:
   ```bash
   cd linux
   npm install
   ```
3. Make the install script executable:
   ```bash
   chmod +x install.sh
   ```
4. Run the install script:
   ```bash
   ./install.sh
   ```

### Option 2: Build from Source

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the application:
   ```bash
   npm run build
   ```
3. The build output will be in the `build` directory
4. The ZIP package will be created as `profile-updater-linux.zip`

## Configuration

Before using the tool, you need to configure it:

1. Initialize the configuration:
   ```bash
   node index.js --init
   ```
   This creates a basic config.json file with default values.

2. Configure your email:
   ```bash
   node index.js --email "your.email@example.com"
   ```

3. Configure your password:
   ```bash
   node index.js --password "yourpassword"
   ```

4. Set the path to your resume file:
   ```bash
   node index.js --resumeUrl "/path/to/your/resume.pdf"
   ```

5. (Optional) Add resume headlines:
   ```bash
   node index.js --resumeHeadlines "Professional Software Engineer with 5 years of experience"
   ```
   You can run this command multiple times to add multiple headlines. The tool will randomly select one when updating your profile.

6. (Optional) Configure the tool to start on login:
   ```bash
   node index.js --startOnStartup
   ```
   This creates a desktop entry in `~/.config/autostart` to run the tool automatically when you log in.

## Running the Tool

After configuration, simply run:
```bash
node index.js
```

The tool will:
1. Start running in the system tray
2. Immediately update your profile the first time
3. Automatically update your profile at the configured interval (default is 4 hours)
4. Show desktop notifications after each update attempt

## Troubleshooting

### Browser Detection Issues

If the tool fails to detect your browser, you can manually edit the `config.json` file and update the `browserUrl` field:

```json
{
  "browserUrl": "/usr/bin/microsoft-edge",
  "timer": 14400000,
  "email": "your.email@example.com",
  "password": "yourpassword",
  "resumeUrl": "/path/to/your/resume.pdf"
}
```

Common browser paths:
- Edge: `/usr/bin/microsoft-edge`
- Chrome: `/usr/bin/google-chrome`
- Chromium: `/usr/bin/chromium-browser`
- Brave: `/usr/bin/brave-browser`

### Notification Issues

If desktop notifications aren't working, make sure:
1. Your desktop environment supports the freedesktop.org notification specification
2. The `libnotify` package is installed:
   ```bash
   # For Debian/Ubuntu
   sudo apt-get install libnotify-bin
   
   # For Fedora
   sudo dnf install libnotify
   
   # For Arch Linux
   sudo pacman -S libnotify
   ```

### Login Issues

If the tool fails to log in to your Naukri account:
1. Check that your email and password are correct
2. Verify that you don't have two-factor authentication enabled on your account
3. Try logging in manually to check if there are any captchas or verification steps

## Command Line Options

- `--help`: Show all available commands
- `--init`: Initialize the app configuration
- `--email`: Configure your email
- `--password`: Configure your password
- `--resumeUrl`: Set the path to your resume file
- `--resumeHeadlines`: Add a resume headline (can be used multiple times)
- `--startOnStartup`: Configure the application to start on login

## Running Tests

To verify your installation works correctly:
```bash
node test.js
```

This will test:
- Browser detection
- Configuration file handling
- Autostart directory access
- Desktop notifications

## License

This tool is provided as-is with no warranty. See the LICENSE file for details.
