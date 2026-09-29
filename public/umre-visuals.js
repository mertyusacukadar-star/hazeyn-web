(function () {
  const slugs = new Set(['19-ekim-2026-umresi','6-kasim-2026-umresi','kasim-ara-tatil-umresi','14-aralik-2026-umresi','21-ocak-2027-umresi','tam-ramazan-umresi-37-gun','ramazan-medine-40-vakit-programi','son-15-ramazan-umresi']);
  window.umreVisual = function (tour, original) {
    if (!slugs.has(tour.slug)) return original;
    // Replace only the old campaign/group placeholders; future admin uploads win.
    if (original && !/gallery-medine|heroBannerFile|hotel\.svg|hero\.svg/.test(original)) return original;
    return '/assets/' + (tour.slug.includes('ramazan') ? 'umre-madinah-night.png' : 'umre-makkah-sunrise.png');
  };
  window.umrePackage = function (tour) {
    if (!slugs.has(tour.slug)) return tour;
    // User-confirmed scope for these eight programs; custom future content wins.
    if (!tour.included.length || tour.included.some(text => text.includes('kesin listesi rezervasyon'))) {
      tour.included = ['Gidiş–dönüş uçak bileti', 'Umre vizesi', 'Programda belirtilen otellerde konaklama', 'Kahvaltı ve akşam yemeği', 'Program kapsamındaki transferler', 'Rehberlik hizmeti', 'Hazeyn Turizm ikramları'];
    }
    if (!tour.excluded.length || tour.excluded.some(text => text.includes('rezervasyon öncesinde yazılı'))) {
      tour.excluded = ['Pasaport çıkarma / yenileme masrafları', 'Yurt dışı çıkış harcı', 'Kişisel ihtiyaçlar ve özel harcamalar'];
    }
    return tour;
  };
})();
