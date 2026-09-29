(function(root) {
  const origin = 'https://www.hazeynturizm.com';
  function metadata(tour, settings = {}) {
    const url = origin + '/' + encodeURIComponent(tour.slug);
    const duration = tour.duration || (tour.durationDays ? tour.durationDays + ' gün' : '');
    const title = `${tour.title}${duration ? ' – ' + duration : ''} | Hazeyn Turizm`;
    const prices = Object.entries(tour.roomPrices || {}).filter(([,v])=>/USD|\$/.test(String(v))).map(([room,value])=>({room,price:Number(String(value).replace(/USD|\$/g,'').trim())})).filter(p=>Number.isFinite(p.price)&&p.price>0);
    const description = `${tour.title}${tour.departureDate ? ' (' + tour.departureDate + ')' : ''}: ${duration ? duration + ', ' : ''}İstanbul çıkışlı umre programı. ${prices.length ? 'Kişi başı ' + Math.min(...prices.map(p=>p.price)) + ' USD’den başlayan oda fiyatları. ' : ''}Mekke–Medine otelleri, dahil hizmetler ve program ayrıntıları.`;
    const agency = {'@type':'TravelAgency','@id':origin+'/#agency',name:'Hazeyn Turizm',url:origin+'/',telephone:settings.phone || '0216 280 0 777',address:{'@type':'PostalAddress',streetAddress:settings.address || 'Atatürk Mah. Gaffar Efendi Sk. Güder Han No:5, İç Kapı No:26',addressLocality:'Ümraniye',addressRegion:'İstanbul',addressCountry:'TR'}};
    const trip = {'@type':'TouristTrip','@id':url+'#trip',name:tour.title,url,description,provider:{'@id':agency['@id']},offers:prices.map(p=>({'@type':'Offer',name:p.room+' kişilik odada kişi başı',url,price:p.price,priceCurrency:'USD',seller:{'@id':agency['@id']}}))};
    const image = new URL(tour.image || '/og-hazeyn.jpg',origin).href;
    trip.image = image;
    return {title,description,url,image,schema:{'@context':'https://schema.org','@graph':[agency,trip,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Ana Sayfa',item:origin+'/'},{'@type':'ListItem',position:2,name:'Umre Programları',item:origin+'/umre-fiyatlari'},{'@type':'ListItem',position:3,name:tour.title,item:url}]}]}};
  }
  root.hazeynTourMetadata = metadata;
  if (typeof module !== 'undefined') module.exports = metadata;
})(typeof window === 'undefined' ? globalThis : window);
