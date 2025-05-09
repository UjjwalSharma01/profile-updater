#!/bin/bash

# Linux Installation Script for Profile Updater
echo "Installing Profile Updater for Linux..."

# Create installation directory
INSTALL_DIR="$HOME/.local/share/profile-updater"
mkdir -p "$INSTALL_DIR"

# First run copy-assets script to ensure we have all necessary files
./copy-assets.sh

# Copy files
cp -r ./* "$INSTALL_DIR"

# Copy image.js from parent directory if not already present
if [ ! -f "$INSTALL_DIR/image.js" ]; then
    cp ../image.js "$INSTALL_DIR/"
fi

# Copy profile-changer.png if not already present
if [ ! -f "$INSTALL_DIR/profile-changer.png" ]; then
    cp ../profile-changer.png "$INSTALL_DIR/"
fi

# Ensure executable permissions
chmod +x "$INSTALL_DIR/profileUpdater"

# Create executable link
mkdir -p "$HOME/.local/bin"
ln -sf "$INSTALL_DIR/profileUpdater" "$HOME/.local/bin/profileUpdater"

# Create desktop shortcut
DESKTOP_FILE="$HOME/.local/share/applications/profile-updater.desktop"
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=Profile Updater
Comment=Auto-updates Naukri profile
Exec=$INSTALL_DIR/profileUpdater
Icon=$INSTALL_DIR/profile-changer.png
Terminal=false
Type=Application
Categories=Utility;
EOF

# Check if PATH includes ~/.local/bin
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "Adding ~/.local/bin to your PATH in .bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "Please log out and back in, or run 'source ~/.bashrc' to update your PATH"
fi

echo "Installation completed!"
echo "You can now run 'profileUpdater' from terminal or find 'Profile Updater' in your applications menu."
echo 
echo "Initial setup steps:"
echo "1. Run 'profileUpdater --init' to initialize configuration"
echo "2. Run 'profileUpdater --email \"your.email@example.com\"' to set your email"
echo "3. Run 'profileUpdater --password \"yourpassword\"' to set your password"
echo "4. Run 'profileUpdater --resumeUrl \"/path/to/your/resume.pdf\"' to set resume path"
echo "5. Optional: Run 'profileUpdater --resumeHeadlines \"Your headline\"' to add headlines"
echo "6. Optional: Run 'profileUpdater --startOnStartup' to enable autostart"
echo "7. Run 'profileUpdater' to start the application"
echo ""
echo "To configure the application, run:"
echo "  profileUpdater --help"
echo "  profileUpdater --init"
echo "  profileUpdater --email \"your.email@example.com\""
echo "  profileUpdater --password \"yourpassword\""
echo "  profileUpdater --resumeUrl \"/path/to/your/resume.pdf\""
