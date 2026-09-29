// Read-only public-site preview; never forwards admin requests or writes.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.xml':'application/xml'};
http.createServer(async(req,res) => {
  if(req.method !== 'GET') {res.writeHead(405);return res.end();}
  const url = new URL(req.url,'http://localhost');
  if(url.pathname === '/api/data') {
    try {const response=await fetch('https://www.hazeynturizm.com/api/data');res.writeHead(response.status,{'Content-Type':'application/json'});res.end(await response.text());}catch(_){res.writeHead(502);res.end('{}');}
    return;
  }
  let route = decodeURIComponent(url.pathname).replace(/\/$/,'') || '/';
  if(['/', '/tr'].includes(route)) route='/index.html';
  if(!path.extname(route)) route += '.html';
  const file = path.resolve(root,'.'+route);
  if(!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(error?'Not found':data);});
}).listen(4173,'127.0.0.1',()=>console.log('Public preview http://127.0.0.1:4173'));
