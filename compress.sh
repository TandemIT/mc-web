#!/bin/bash

# Function to compress one folder
compress_folder() {
  INPUT="$1"

  # Validate input
  if [ ! -e "$INPUT" ]; then
    echo "❌ Error: File or folder not found!"
    return
  fi

  # Check for the "world" folder
  if [ ! -d "$INPUT/world" ]; then
    echo "❌ Error: No 'world' folder found in '$INPUT'. Please ensure you're selecting the full Minecraft world/server folder."
    return
  fi

  # Extract filename and fix name (replace - with _)
  BASENAME=$(basename "$INPUT")
  SAFE_NAME="${BASENAME//-/_}"
  OUTPUT_DIR="/root/web/src/worlds"
  OUTPUT="$OUTPUT_DIR/$SAFE_NAME.tar.xz"

  # Check if compression is needed (only if any file inside is newer than the archive)
  if [ -f "$OUTPUT" ] && ! find "$INPUT/world" -type f -newer "$OUTPUT" | grep -q .; then
    echo "⚠️  Skipping '$INPUT': No changes detected."
    return
  fi

  # Run compression
  echo "📦 Compressing '$INPUT' to '$OUTPUT'..."
  tar -cJf "$OUTPUT" "$INPUT"

  # Result
  if [ $? -eq 0 ]; then
    echo "✅ Done: $OUTPUT"
  else
    echo "❌ Compression failed!"
  fi
}

# Loop through all directories and subdirectories inside /home/minecraft
find /home/minecraft -type d -name "world" | while read world_folder; do
  parent_folder=$(dirname "$world_folder")
  compress_folder "$parent_folder" &
done

# Wait for all background jobs to finish
wait
