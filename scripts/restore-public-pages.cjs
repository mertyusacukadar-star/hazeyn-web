// Compatibility entry point; do not regenerate outdated loading placeholders.
require('./prepare-public-pages.cjs')().catch(error=>{console.error(error);process.exitCode=1;});
