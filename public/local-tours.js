(async function () {
  const target = document.getElementById('localTours');
  if (!target) return;
  try {
    const response = await fetch('/api/data', {cache:'no-store'});
    if (!response.ok) throw new Error('Programlar yüklenemedi');
    const state = await response.json();
    const tours = (state.tours || []).filter(t => t.type === 'umre' && (t.status || 'active') === 'active');
    target.replaceChildren();
    for (const tour of tours) {
      const card = document.createElement('a');
      card.className = 'seo-card';
      card.href = '/program.html?slug=' + encodeURIComponent(tour.slug);
      const image = document.createElement('img');
      image.src = window.umreVisual(tour, tour.image);
      image.alt = tour.title;
      image.loading = 'lazy';
      image.style.cssText = 'width:100%;aspect-ratio:3/2;object-fit:contain;border-radius:12px';
      const title = document.createElement('h3');
      title.textContent = tour.title;
      const label = document.createElement('span');
      label.className = 'text-btn';
      label.textContent = 'Program ve oda fiyatlarını incele →';
      card.append(image, title, label);
      target.append(card);
    }
    if (!tours.length) target.textContent = 'Yeni programlarımız hakkında bilgi almak için bize ulaşın.';
  } catch (_) {
    target.replaceChildren();
    const link = document.createElement('a');
    link.href = '/tr#umre';
    link.textContent = 'Güncel Umre programlarını görüntüle →';
    target.append(link);
  }
})();
