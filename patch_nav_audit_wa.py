with open('src/components/NavigationAudit.tsx', 'r') as f:
    content = f.read()

target = """      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${MALAK_MAZHAR_WHATSAPP}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-40 p-4 bg-green-500 text-white rounded-full shadow-lg hover:scale-105 transition-all"
        title="Contact on WhatsApp"
      >
        <MessageCircle size={24} />
      </a>"""

if target in content:
    content = content.replace(target, '')
    with open('src/components/NavigationAudit.tsx', 'w') as f:
        f.write(content)
    print("NavigationAudit Patched!")
else:
    print("Target not found in NavigationAudit")
