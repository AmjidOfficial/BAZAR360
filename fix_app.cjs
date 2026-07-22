const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const block = `  // Parse '?listing=ID' to open detailed modal
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const listingId = searchParams.get('listing');
    if (listingId && listings.length > 0) {
      const found = listings.find(v => v.id === listingId);
      if (found) {
        setSelectedListing(found);
      }
    }
  }, [window.location.search, listings]);`;

code = code.replace(block, "");

const insertPoint = `  // Bidirectional SPA Routing and browser history synchronization engine`;
code = code.replace(insertPoint, block + "\n\n" + insertPoint);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Fixed App.tsx");
