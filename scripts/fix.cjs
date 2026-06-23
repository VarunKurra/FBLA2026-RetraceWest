const fs = require('fs');
const files = [
  'src/pages/Report.jsx', 
  'src/pages/Leaderboard.jsx', 
  'src/pages/Admin.jsx', 
  'src/pages/Dashboard.jsx',
  'src/pages/Registry.jsx',
  'src/pages/SpatialMap.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let raw = fs.readFileSync(f, 'utf8');
    // Fix escaping
    raw = raw.replace(/\\\$/g, '$').replace(/\\`/g, '`');
    // Fix import
    raw = raw.replace(/import\s*\{\s*PARKWAY_WEST\s*\}\s*from\s*['"]\.\.\/data\/westHighSchool['"];/g, '');
    let importAppCtx = "import { useApp } from '../context/AppContext';";
    if (raw.includes(importAppCtx) && !raw.includes('PARKWAY_WEST')) {
        raw = raw.replace(importAppCtx, "import { useApp, PARKWAY_WEST } from '../context/AppContext';");
    }
    fs.writeFileSync(f, raw);
    console.log('Fixed', f);
  }
});
