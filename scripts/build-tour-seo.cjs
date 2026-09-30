// Compatibility entry point. All public pages now use the same live renderer.
require('./prepare-public-pages.cjs')().catch(error=>{console.error(error);process.exitCode=1;});
