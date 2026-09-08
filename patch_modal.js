import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = content.indexOf('        {selectedListing && (\n          <motion.div\n            id="fullscreen-spec-modal"');
if (startIndex === -1) console.log("Not found startIndex");

const endIndex = content.indexOf('        </motion.div>\n      )}\n    </AnimatePresence>');
if (endIndex === -1) console.log("Not found endIndex");

const newContent = content.substring(0, startIndex) + `        {selectedListing && (
          <VehicleDetail
            car={selectedListing}
            dealer={dealers.find(d => d.id === selectedListing.dealerId) || { id: 'private', name: 'Private Seller', location: 'Unknown', phone: '0000000000' } as any}
            onClose={() => setSelectedListing(null)}
          />\n` + content.substring(endIndex + '        </motion.div>\n'.length);

fs.writeFileSync('src/App.tsx', newContent);
console.log('Patched');
