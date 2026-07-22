import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'      \{\/\* MOBILE FIXED BOTTOM BAR \*\/.*?<\/div>\s*<div className="md:hidden fixed bottom-0 left-0 w-full z-50'

replacement = '      {/* MOBILE FIXED BOTTOM BAR */}\n      <div className="md:hidden fixed bottom-0 left-0 w-full z-50'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
