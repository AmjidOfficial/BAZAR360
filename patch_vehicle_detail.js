import fs from 'fs';
const content = fs.readFileSync('src/components/VehicleDetail.tsx', 'utf8');

const targetStr = `        {/* Hero Image Section (Matches Home Page aspect ratio) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}`;

const replacementStr = `        {/* Hero Image Section (Matches Home Page aspect ratio) */}
        <div className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-[16/9] md:aspect-[2.35/1] bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-[var(--color-border-main)] relative shadow-xl group"
          >
            <img 
              src={car.imageUrl || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'} 
              alt={car.title}
              className="w-full h-full object-cover object-center"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {car.images && car.images.length > 1 && (
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer">
                  <ImageIcon size={14} /> View Gallery ({car.images.length})
                </button>
              </div>
            )}
          </motion.div>
          {car.images && car.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {car.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  alt={\`\${car.title} - Image \${idx + 1}\`}
                  className="w-32 h-24 rounded-xl object-cover border border-[var(--color-border-main)] shrink-0 cursor-pointer hover:border-[#FE805D] transition-colors"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}`;

const newContent = content.replace(
  `        {/* Hero Image Section (Matches Home Page aspect ratio) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full aspect-[16/9] md:aspect-[2.35/1] bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-[var(--color-border-main)] relative shadow-xl"
        >
          <img 
            src={car.imageUrl || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80'} 
            alt={car.title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Content Grid */}`, replacementStr
);

fs.writeFileSync('src/components/VehicleDetail.tsx', newContent);
console.log('Patched VehicleDetail');
