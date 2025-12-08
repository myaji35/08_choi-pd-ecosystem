#!/bin/bash

# Fix Next.js 16 route parameter types
echo "🔧 Fixing Next.js 16 route parameter types..."

cd "/Users/gangseungsig/Documents/02_GitHub/08_The Choi PD Ecosystem(최PD)/choi-pd-ecosystem"

# Find all route files with params
find src/app/api -name "route.ts" -type f | while read file; do
  # Check if file contains old params syntax
  if grep -q "{ params }: { params: { id: string } }" "$file"; then
    echo "Fixing: $file"

    # Replace the old syntax with new Promise-based syntax
    sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"

    # Add await for params
    sed -i '' 's/params\.id/\(await params\)\.id/g' "$file"
    sed -i '' 's/parseInt(params\./parseInt\(\(await params\)\./g' "$file"

    # Fix cases where params.id is already awaited
    sed -i '' 's/(await (await params))/(await params)/g' "$file"
  fi
done

echo "✅ Route parameter types fixed!"