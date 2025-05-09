# Profile Updater for Linux

This is the Linux version of the Profile Updater tool, which automatically updates your professional profile on Naukri.com using browser automation.

## Features

- Automatically logs into Naukri.com and updates your profile at regular intervals
- Updates your resume file
- Randomly selects and updates your resume headline from a configured list
- Runs in the system tray
- Can be configured to start automatically during login
- Provides desktop notifications after update attempts

## System Requirements

- Linux OS (tested on Ubuntu, Debian, Fedora)
- 64-bit architecture
- A Chromium-based browser installed (Chrome, Chromium, Edge, or Brave)
- At least 2GB of RAM (4GB recommended)

## Installation

1. Clone this repository or download the release ZIP
2. Run the installation script:

```bash
chmod +x install.sh
./install.sh
```

## Configuration

1. Initialize the configuration:
   ```
   profileUpdater --init
   ```
   This creates a basic config.json file with default values.

2. Configure your email:
   ```
   profileUpdater --email "your.email@example.com"
   ```

3. Configure your password:
   ```
   profileUpdater --password "yourpassword"
   ```

4. Set the path to your resume file:
   ```
   profileUpdater --resumeUrl "/path/to/your/resume.pdf"
   ```

5. (Optional) Add resume headlines:
   ```
   profileUpdater --resumeHeadlines "Professional Software Engineer with 5 years of experience"
   ```
   You can run this command multiple times to add multiple headlines. The tool will randomly select one when updating your profile.

6. (Optional) Configure the tool to start automatically on login:
   ```
   profileUpdater --startOnStartup
   ```

## Running the Tool

After configuration, simply run:
```
profileUpdater
```

The tool will:
1. Start running in the system tray
2. Automatically update your profile at the configured interval (default is 4 hours)
3. Show desktop notifications after each update attempt

## Building from Source

To build the application from source:

1. Install Node.js and npm
2. Install dependencies:
   ```
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```

This will generate a standalone executable in the `build` directory.

## Command Line Options

- `--help`: Show all available commands
- `--init`: Initialize the app configuration
- `--email`: Configure your email
- `--password`: Configure your password
- `--resumeUrl`: Set the path to your resume file
- `--resumeHeadlines`: Add a resume headline (can be used multiple times)
- `--startOnStartup`: Configure the application to start on login
