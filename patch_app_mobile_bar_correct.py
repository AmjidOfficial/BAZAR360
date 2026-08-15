with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "MOBILE FIXED BOTTOM BAR" in line:
        skip = True
    
    if skip and '      {/* STICKY VEHICLE COMPARISON DRAWER BAR */}' in line:
        skip = False

    if not skip:
        new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
print("Removed duplicate MOBILE FIXED BOTTOM BAR from App.tsx!")
