import re
with open('src/components/HomeFeed.tsx', 'r') as f:
    content = f.read()

replacement = """      {/* 4. Elegant floating action call (Modern Separated Stack) */}
      <div className="fixed bottom-24 right-6 z-40 hidden md:flex flex-col gap-4">
        <motion.a
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          href="https://wa.me/923000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-4 shadow-2xl flex items-center justify-center gap-2 cursor-pointer font-black text-sm uppercase border border-[#25D366]/50 shadow-[#25D366]/20 transition-colors"
        >
          <MessageSquare size={20} className="fill-current" />
        </motion.a>
        
        <motion.button
          variants={hoverEffects.lift}
          whileHover="whileHover"
          whileTap="whileTap"
          onClick={() => setTab('sell')}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 cursor-pointer font-black text-sm uppercase border border-white/20 shadow-orange-500/20"
        >
          <PlusCircle size={20} />
          <span>Post Ad</span>
        </motion.button>
      </div>"""

content = re.sub(r'      \{\/\* 4\. Elegant floating action call \*\/\}[\s\S]*?<\/div>', replacement, content)

with open('src/components/HomeFeed.tsx', 'w') as f:
    f.write(content)
