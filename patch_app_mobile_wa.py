import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """      {/* MOBILE FIXED BOTTOM BAR */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <a 
          href="https://wa.me/923000000000" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-2 border-[#25D366]/50 shadow-[#25D366]/30 transition-transform active:scale-95"
        >
          <MessageSquare size={24} className="fill-current" />
        </a>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0B0F19]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe">"""

content = content.replace('      {/* MOBILE FIXED BOTTOM BAR */}\n      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0B0F19]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe">', replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
