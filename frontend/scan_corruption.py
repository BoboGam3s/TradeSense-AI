import os

file_path = r'c:\Users\bobot\OneDrive\Bureau\Projet_TradeSens\frontend\src\app\dashboard\page.js'

with open(file_path, 'rb') as f:
    data = f.read()

if b'\x00' in data:
    print(f"Found NULL characters in file!")
    # Find positions
    pos = data.find(b'\x00')
    print(f"First NULL at byte {pos}")
else:
    print("No NULL characters found.")

# Try to read as lines and check for unusually long ones
with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if len(line) > 5000:
            print(f"Excessively long line at {i+1}: {len(line)} chars")
        if 'Positions Ouvertes' in line:
            print(f"Found 'Positions Ouvertes' at line {i+1}")
