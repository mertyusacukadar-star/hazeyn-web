// Read-only public-site preview; never forwards admin requests or writes.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../public');
const render=require('../public/api/_site-pages.cjs');
const state=require('../public/api/_public-snapshot.json');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.xml':'application/xml'};
http.createServer(async(req,res) => {
  if(req.method !== 'GET') {res.writeHead(405);return res.end();}
  const url = new URL(req.url,'http://localhost');
  if(url.pathname==='/program.html'&&url.searchParams.get('slug')) {
    res.writeHead(308,{Location:'/'+encodeURIComponent(url.searchParams.get('slug'))});return res.end();
  }
  const route=url.pathname.replace(/\/$/,'')||'/';
  const templates={'/':'index.html','/tr':'index.html','/index.html':'index.html','/merak-edilenler':'merak-edilenler.html','/merak-edilenler.html':'merak-edilenler.html','/deneyimli-kadro':'deneyimli-kadro.html','/deneyimli-kadro.html':'deneyimli-kadro.html'};
  let html;
  if(templates[route]) html=render.template(templates[route],state);
  else if(['/umraniye-umre-turu','/umraniye-umre-turu.html'].includes(route)) html=render.local(state);
  else if(['/umre-fiyatlari','/umre-fiyatlari.html'].includes(route)) html=render.prices(state);
  else if(/^\/[a-z0-9-]+$/.test(route)) {
    const tour=state.tours.find(t=>t.slug===route.slice(1)&&t.status!=='draft');
    if(tour) html=render.pages.renderProgramPage(render.prepared(state),tour,render.origin);
  }
  if(html){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html);}
  if(url.pathname === '/api/data') {
    try {const response=await fetch('https://www.hazeynturizm.com/api/data');res.writeHead(response.status,{'Content-Type':'application/json'});res.end(await response.text());}catch(_){res.writeHead(502);res.end('{}');}
    return;
  }
  let fileRoute = decodeURIComponent(url.pathname).replace(/\/$/,'') || '/';
  if(['/', '/tr'].includes(fileRoute)) fileRoute='/index.html';
  if(!path.extname(fileRoute)) fileRoute += '.html';
  const file = path.resolve(root,'.'+fileRoute);
  if(!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(error?'Not found':data);});
}).listen(4173,'127.0.0.1',()=>console.log('Public preview http://127.0.0.1:4173'));
