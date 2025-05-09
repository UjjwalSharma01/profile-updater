#!/bin/bash

# This script copies the necessary image files from the parent directory to the current directory
# to ensure the Linux version has all the required assets

# Navigate to the script directory
cd "$(dirname "$0")"

# Copy the image files
echo "Copying image files..."
cp ../profile-changer.png ./
cp ../image.js ./

echo "Files copied successfully!"
