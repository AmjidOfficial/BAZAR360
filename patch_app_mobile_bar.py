import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'      \{\/\* MOBILE FIXED BOTTOM BAR \*\/.*?<\/div>\s*<\/div>\s*<\/NavigationAudit>'

replacement = '    </NavigationAudit>'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
