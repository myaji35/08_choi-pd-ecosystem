#!/usr/bin/env python3
import os
import re

def fix_route_file(file_path):
    """Fix Next.js 16 route parameter types in a file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file needs fixing
    if '{ params }: { params: { id: string } }' not in content:
        return False

    print(f"Fixing: {file_path}")

    # Replace the parameter type
    content = content.replace(
        '{ params }: { params: { id: string } }',
        '{ params }: { params: Promise<{ id: string }> }'
    )

    # Find all function bodies that use params and add await
    # Pattern to find function bodies after the params declaration
    functions = re.findall(
        r'export async function \w+\([^)]+{ params }: { params: Promise<{ id: string }> }\)\s*{([^}]+)}',
        content,
        re.MULTILINE | re.DOTALL
    )

    # For each function, if it accesses params.id directly, we need to await it
    for func_body in functions:
        if 'params.id' in func_body:
            # Replace direct params.id access with await
            new_body = func_body

            # Add const { id } = await params; at the beginning of try block
            if 'try {' in new_body:
                new_body = new_body.replace(
                    'try {',
                    'try {\n    const { id } = await params;',
                    1
                )
                # Replace all params.id with just id
                new_body = new_body.replace('params.id', 'id')
                # Replace parseInt(params. with parseInt(
                new_body = new_body.replace('parseInt(params.', 'parseInt(')

                content = content.replace(func_body, new_body)

    # Write the fixed content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return True

def main():
    base_dir = "/Users/gangseungsig/Documents/02_GitHub/08_The Choi PD Ecosystem(최PD)/choi-pd-ecosystem"
    api_dir = os.path.join(base_dir, "src/app/api")

    fixed_count = 0

    # Walk through all route.ts files
    for root, dirs, files in os.walk(api_dir):
        for file in files:
            if file == 'route.ts':
                file_path = os.path.join(root, file)
                if fix_route_file(file_path):
                    fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} route files!")

if __name__ == "__main__":
    main()