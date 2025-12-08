#!/bin/bash

echo "🔧 Fixing all Next.js 16 route parameter issues..."

cd "/Users/gangseungsig/Documents/02_GitHub/08_The Choi PD Ecosystem(최PD)/choi-pd-ecosystem"

# Find all route files with params.id usage
grep -r "parseInt(params.id)" --include="*.ts" src/app/api/ -l | while read file; do
  echo "Fixing: $file"

  # Add const { id } = await params; after try {
  sed -i '' '/try {/a\
    const { id } = await params;' "$file"

  # Replace params.id with id
  sed -i '' 's/parseInt(params\.id)/parseInt(id)/g' "$file"
  sed -i '' 's/params\.id/id/g' "$file"
done

# Also fix files that directly use params.id without parseInt
grep -r "params\.id" --include="*.ts" src/app/api/ -l | while read file; do
  if ! grep -q "const { id } = await params;" "$file"; then
    echo "Adding await to: $file"

    # Add const { id } = await params; after try { if not already present
    sed -i '' '/try {/a\
    const { id } = await params;' "$file"

    # Replace params.id with id
    sed -i '' 's/params\.id/id/g' "$file"
  fi
done

echo "✅ All route files fixed!"