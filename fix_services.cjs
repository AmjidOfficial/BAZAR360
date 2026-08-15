const fs = require('fs');
let code = fs.readFileSync('src/components/AutoChoiceHero.tsx', 'utf8');

// The Specialized Services Vertical Stack is currently around line 200.
const stackStart = '<div className="flex flex-col gap-3">';
const stackEnd = '</div>\\n                </div>\\n              </div>\\n\\n              {/* Secure Booking footer';

const newCards = `<div className="flex flex-col gap-2.5">
                    {specializedServices.map((service) => (
                      <motion.div
                        key={service.id}
                        className="w-full"
                        whileHover={{ y: -2, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      >
                        <div
                          onClick={() => handleServiceClick(service.targetTab, service.id)}
                          className="group relative flex flex-row items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-amber-50 hover:to-amber-100/50 border border-slate-100 hover:border-amber-200 transition-all duration-300 cursor-pointer shadow-sm text-left overflow-hidden"
                        >
                          {/* Ambient card neon glow */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
                          
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shadow-md">
                            {React.createElement(service.icon, { size: 18, className: "stroke-[2.5]" })}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate group-hover:text-amber-600 transition-colors">
                                {service.title}
                              </h3>
                              <span className={\`hidden sm:flex text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border shadow-sm shrink-0 \${service.pillBg}\`}>
                                {service.pill}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans leading-snug line-clamp-1">
                              {service.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>`;

const regex = /<div className="flex flex-col gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Secure Booking footer/m;
code = code.replace(regex, newCards + '\\n                </div>\\n              </div>\\n              {/* Secure Booking footer');

fs.writeFileSync('src/components/AutoChoiceHero.tsx', code);
