// Public HTML only. This endpoint has no write path and never serializes admin state.
const {TABLE,ROW_ID,supabaseAdmin,sanitizePublicState}=require('./_supabase');
const render=require('./_site-pages.cjs');
const fallback=require('./_public-snapshot.json');
module.exports=async function(req,res) {
  if(req.method!=='GET') return res.status(405).send('Method not allowed');
  let state;
  try {
    const {data,error}=await supabaseAdmin().from(TABLE).select('data').eq('id',ROW_ID).maybeSingle();
    if(error || !data?.data) throw Error('Public content unavailable');
    state=sanitizePublicState(typeof data.data==='string'?JSON.parse(data.data):data.data);
  } catch(error) {
    state=fallback;
    res.setHeader('X-Hazeyn-Content','published-fallback');
  }
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  const route=String(req.query?.route || '');
  const slug=render.pages.slugify(String(req.query?.slug || ''));
  if(['home','blog','staff'].includes(route)) return res.status(200).send(render.template({home:'index.html',blog:'merak-edilenler.html',staff:'deneyimli-kadro.html'}[route],state));
  if(route==='local') return res.status(200).send(render.local(state));
  if(route==='prices') return res.status(200).send(render.prices(state));
  if(route==='sitemap') {
    res.setHeader('Content-Type','application/xml; charset=utf-8');
    return res.status(200).send(render.pages.renderSitemap(state,render.origin));
  }
  if(route==='program') {
    const tour=(state.tours||[]).find(t=>t.slug===slug&&t.status!=='draft'&&t.published!==false);
    if(tour) return res.status(200).send(render.pages.renderProgramPage(render.prepared(state),tour,render.origin));
  }
  if(route==='article') {
    const saved=(state.blogs||[]).map(render.pages.normalizeBlog);
    const blog=[...saved,...render.pages.requiredBlogs.map(render.pages.normalizeBlog)].find(b=>b.slug===slug&&b.status!=='draft');
    if(blog) return res.status(200).send(render.pages.renderArticlePage(state,blog,render.origin).replaceAll('/assets/hero.svg','/assets/umre-makkah-sunrise.png'));
  }
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex');
  return res.status(404).send('<!doctype html><html lang="tr"><title>Program bulunamadı | Hazeyn Turizm</title><h1>Program bulunamadı</h1><p><a href="/tr#umre">Güncel Umre programlarına dönün</a></p></html>');
};
