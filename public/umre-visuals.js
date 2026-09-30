(function (root) {
  const slugs = new Set(['19-ekim-2026-umresi','6-kasim-2026-umresi','kasim-ara-tatil-umresi','14-aralik-2026-umresi','21-ocak-2027-umresi','tam-ramazan-umresi-37-gun','ramazan-medine-40-vakit-programi','son-15-ramazan-umresi']);
  const covers = {
    '19-ekim-2026-umresi':'19-ekim', '6-kasim-2026-umresi':'6-kasim',
    'kasim-ara-tatil-umresi':'12-kasim', '14-aralik-2026-umresi':'14-aralik',
    '21-ocak-2027-umresi':'21-ocak', 'tam-ramazan-umresi-37-gun':'tam-ramazan',
    'ramazan-medine-40-vakit-programi':'40-vakit', 'son-15-ramazan-umresi':'son-15'
  };
  root.umreVisual = function (tour, original) {
    if (!slugs.has(tour.slug)) return original;
    // Replace only the old campaign/group placeholders; future admin uploads win.
    if (original && !/gallery-medine|heroBannerFile|hotel\.svg|hero\.svg|umre-makkah-sunrise|umre-madinah-night/.test(original)) return original;
    return '/assets/umre-cover-' + covers[tour.slug] + '.png';
  };
  root.umrePackage = function (tour) {
    if (!slugs.has(tour.slug)) return tour;
    if (!tour.slug.includes('ramazan') && Array.isArray(tour.mekkeImages)) {
      tour.mekkeImages = tour.mekkeImages.map(url => url.includes('0f2eedc7afedd733bfcf146f97fea881') ? '/assets/orooq-mahbes-entrance.jpg' : url);
    }
    // User-confirmed scope for these eight programs; custom future content wins.
    if (!tour.included.length || tour.included.some(text => text.includes('kesin listesi rezervasyon'))) {
      tour.included = ['Gidiş–dönüş uçak bileti', 'Umre vizesi', 'Programda belirtilen otellerde konaklama', 'Kahvaltı ve akşam yemeği', 'Program kapsamındaki transferler', 'Rehberlik hizmeti', 'Hazeyn Turizm ikramları'];
    }
    if (!tour.excluded.length || tour.excluded.some(text => text.includes('rezervasyon öncesinde yazılı'))) {
      tour.excluded = ['Pasaport çıkarma / yenileme masrafları', 'Yurt dışı çıkış harcı', 'Kişisel ihtiyaçlar ve özel harcamalar'];
    }
    return tour;
  };
  root.umreBanner = function(tour, original) {
    if (!slugs.has(tour.slug)) return original;
    if (original && !/gallery-medine|heroBannerFile|hotel\.svg|hero\.svg|umre-makkah-sunrise|umre-madinah-night|umre-cover-/.test(original)) return original;
    const theme = tour.slug.includes('ramazan') ? 'ramazan' : /6-kasim|21-ocak/.test(tour.slug) ? 'medine' : 'mekke';
    return '/assets/umre-banner-' + theme + '.png';
  };
  root.hazeynSiteDesign = function(source) {
    const tour = {...source};
    tour.image = root.umreVisual(tour, tour.image || tour.coverImage);
    tour.detailBannerImage = root.umreBanner(tour, tour.detailBannerImage || tour.image);
    if (slugs.has(tour.slug)) {
      const included = Array.isArray(tour.includedServices) ? tour.includedServices : String(tour.includedServices || '').split('\n').filter(Boolean);
      const excluded = Array.isArray(tour.excludedServices) ? tour.excludedServices : String(tour.excludedServices || '').split('\n').filter(Boolean);
      const packaged = root.umrePackage({...tour, included, excluded, mekkeImages:tour.hotelImages?.mekke || []});
      tour.includedServices = packaged.included;
      tour.excludedServices = packaged.excluded;
      tour.hotelImages = {...tour.hotelImages, mekke:packaged.mekkeImages};
      tour.summary = String(tour.summary || tour.cardDescription || tour.detailBannerSubtitle || `${tour.durationDays} günlük Mekke ve Medine yolculuğu; rehberlik, otel, uçuş ve transferler dahil.`);
    }
    return tour;
  };
  root.hazeynSiteSettings = function(source = {}) {
    const settings = {...source};
    for (const [prefix,image,subtitle] of [
      ['blog','umre-makkah-sunrise','Niyetinizden yolculuğunuza: hazırlık listeleri, umre rehberi ve merak ettiğiniz soruların cevapları bir arada.'],
      ['staff','umre-madinah-night','İlk hazırlıktan dönüş yolculuğuna kadar yanınızda olan hocalarımız ve kafile ekibimizle tanışın.']
    ]) {
      if (!settings[prefix+'BannerImage'] || /(?:^|\/)hero\.svg$/.test(settings[prefix+'BannerImage'])) settings[prefix+'BannerImage'] = '/assets/'+image+'.png';
      if (!settings[prefix+'BannerSubtitle'] || /yayınlayabilirsiniz|tanıtabilirsiniz/.test(settings[prefix+'BannerSubtitle'])) settings[prefix+'BannerSubtitle'] = subtitle;
    }
    return settings;
  };
  if (typeof module !== 'undefined') module.exports = {tour:root.hazeynSiteDesign, settings:root.hazeynSiteSettings};
})(typeof window === 'undefined' ? {} : window);
