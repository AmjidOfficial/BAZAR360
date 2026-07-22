import re
with open('src/components/HomeFeed.tsx', 'r') as f:
    content = f.read()

replacement = """      {/* 4. Elegant floating action call (Modern Separated Stack) */}
      <div className="fixed bottom-24 right-4 md:right-6 z-40 flex flex-col gap-4 items-end">
        <motion.a
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          href="https://wa.me/923000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-4 shadow-2xl flex items-center justify-center cursor-pointer border border-[#25D366]/50 shadow-[#25D366]/30 transition-all duration-300 w-14 h-14 md:w-auto md:h-auto md:px-5 md:py-3.5 md:rounded-2xl"
        >
          {/* Mobile Icon */}
          <div className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.061-.175-.299-.018-.461.13-.611.134-.135.304-.35.45-.525.148-.175.197-.299.297-.499.1-.2.05-.375-.025-.524-.075-.15-.67-1.62-.92-2.22-.24-.582-.486-.505-.67-.514-.173-.008-.37-.01-.569-.01-.197 0-.522.074-.795.373-.273.298-1.043 1.02-1.043 2.486s1.068 2.88 1.217 3.08c.148.199 2.096 3.2 5.077 4.487.71.306 1.265.489 1.696.625.713.226 1.363.194 1.874.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          {/* Desktop Icon + Text */}
          <div className="hidden md:flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.061-.175-.299-.018-.461.13-.611.134-.135.304-.35.45-.525.148-.175.197-.299.297-.499.1-.2.05-.375-.025-.524-.075-.15-.67-1.62-.92-2.22-.24-.582-.486-.505-.67-.514-.173-.008-.37-.01-.569-.01-.197 0-.522.074-.795.373-.273.298-1.043 1.02-1.043 2.486s1.068 2.88 1.217 3.08c.148.199 2.096 3.2 5.077 4.487.71.306 1.265.489 1.696.625.713.226 1.363.194 1.874.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-black text-sm uppercase tracking-wide">WhatsApp</span>
          </div>
          
          {/* Tooltip for Mobile */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none md:hidden shadow-xl border border-white/10">
            WhatsApp Support
          </span>
        </motion.a>
        
        <motion.button
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          onClick={() => setTab('sell')}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl hidden md:flex items-center gap-2 cursor-pointer font-black text-sm uppercase border border-white/20 shadow-orange-500/20"
        >
          <PlusCircle size={20} />
          <span>Post Ad</span>
        </motion.button>
      </div>"""

content = re.sub(r'      \{\/\* 4\. Elegant floating action call \(Modern Separated Stack\)\s*\*\/\}[\s\S]*?<\/div>', replacement, content)

with open('src/components/HomeFeed.tsx', 'w') as f:
    f.write(content)
