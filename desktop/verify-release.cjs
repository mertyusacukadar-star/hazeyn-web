// Verify the actual distributable without installing over the user's application.
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto'),zlib=require('zlib');
const {spawn,spawnSync}=require('child_process');
const pkg=require('./package.json'),release=path.resolve(__dirname,'../release');
const installer=path.join(release,pkg.build.nsis.artifactName.replace('${version}',pkg.version).replace('${ext}','exe'));
const exe=pkg.build.productName+'.exe';
const builder=path.dirname(require.resolve('electron-builder'));
const lib=path.dirname(require.resolve('app-builder-lib',{paths:[builder]}));
const {getPath7za}=require(path.join(lib,'toolsets/7zip.js'));
const asar=require(require.resolve('@electron/asar',{paths:[lib]}));
function machine(bytes){const pe=bytes.readUInt32LE(0x3c);assert.equal(bytes.toString('ascii',0,2),'MZ');assert.equal(bytes.readUInt32LE(pe),0x4550);return bytes.readUInt16LE(pe+4);}
async function digest(file){const h=crypto.createHash('sha256');for await(const part of fs.createReadStream(file))h.update(part);return h.digest('hex');}
async function entryDigest(tool,archive,name){
 return new Promise((resolve,reject)=>{
  const proc=spawn(tool,['x','-so',archive,name],{windowsHide:true}),hash=crypto.createHash('sha256');let error='';
  proc.stdout.on('data',part=>hash.update(part));proc.stderr.on('data',part=>{error+=part;});proc.on('error',reject);
  proc.on('close',code=>code===0?resolve(hash.digest('hex')):reject(new Error('Archive read failed: '+error)));
 });
}
(async()=>{
 const bytes=fs.readFileSync(installer);assert.equal(machine(bytes),0x14c,'Installer stub must run on 32-bit Windows');
 const tool=await getPath7za(),temporary=path.join(release,'verification');fs.mkdirSync(temporary,{recursive:true});
 const signature=Buffer.from('377abcaf271c','hex'),archives=[];
 // NSIS embeds one independently checksummed 7z application package per architecture.
 for(let offset=0;(offset=bytes.indexOf(signature,offset))>=0;offset++){
  if(offset+32>bytes.length||zlib.crc32(bytes.subarray(offset+12,offset+32))!==bytes.readUInt32LE(offset+8))continue;
  const end=offset+32+Number(bytes.readBigUInt64LE(offset+12))+Number(bytes.readBigUInt64LE(offset+20));
  assert(end<=bytes.length,'Truncated application archive');
  const archive=path.join(temporary,'application-'+archives.length+'.7z');fs.writeFileSync(archive,bytes.subarray(offset,end));archives.push(archive);
 }
 assert.equal(archives.length,2,'Universal installer must contain both application packages');
 const checks=[];
 for(const [arch,folder,pe] of [['x64','win-unpacked',0x8664],['ia32','win-ia32-unpacked',0x14c]]){
  const appPath=path.join(release,folder,exe),appBytes=fs.readFileSync(appPath);assert.equal(machine(appBytes),pe);
  const bundle=path.join(release,folder,'resources/app.asar');
  assert.equal(JSON.parse(asar.extractFile(bundle,'package.json').toString()).version,pkg.version);
  assert.equal(asar.extractFile(bundle,'main.js').toString(),fs.readFileSync(path.join(__dirname,'main.js'),'utf8'));
  const runtime=spawnSync(appPath,['-e','console.log(JSON.stringify({arch:process.arch,electron:process.versions.electron}))'],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1'},windowsHide:true,encoding:'utf8',timeout:30000});
  assert.equal(runtime.status,0,runtime.stderr);const actual=JSON.parse(runtime.stdout.trim());assert.equal(actual.arch,arch);
  const wanted=await digest(appPath);let embedded=false;
  for(const archive of archives)if(await entryDigest(tool,archive,exe)===wanted)embedded=true;
  assert(embedded,'Installer missing verified '+arch+' executable');checks.push({arch,electron:actual.electron,packagedVersion:pkg.version,embedded:true});
 }
 for(const archive of archives){const result=spawnSync(tool,['t',archive],{windowsHide:true,encoding:'utf8',timeout:60000});assert.equal(result.status,0,'Compressed payload integrity failed: '+result.stderr);}
 const sum=await digest(installer),size=fs.statSync(installer).size;
 fs.writeFileSync(path.join(release,'SHA256SUMS.txt'),sum+'  '+path.basename(installer)+'\n');
 fs.writeFileSync(path.join(release,'verification-report.json'),JSON.stringify({version:pkg.version,installer:path.basename(installer),size,sha256:sum,checks},null,2));
 console.log(JSON.stringify({installer:path.basename(installer),size,checks,integrity:'passed'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
