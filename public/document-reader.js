(function (root) {
    'use strict';
    const fields = ['name', 'tc', 'gender', 'birthDate', 'passportNo', 'passportStart', 'passportEnd', 'identityNo', 'identityEnd', 'nationality', 'issuingCountry', 'placeOfBirth', 'issuingAuthority'];
    function validTc(value) {
        if (!/^[1-9]\d{10}$/.test(value)) return false;
        const d = Array.from(value, Number);
        return ((d[0]+d[2]+d[4]+d[6]+d[8])*7-(d[1]+d[3]+d[5]+d[7])+1000)%10 === d[9]
            && d.slice(0,10).reduce((a,b)=>a+b,0)%10 === d[10];
    }
    function normalize(input) {
        if (!input || input.version !== 1 || !['passport','identity'].includes(input.documentType)) throw Error('Belge biçimi desteklenmiyor.');
        const result = { documentType: input.documentType, source: input.source === 'camera' ? 'camera' : 'nfc' };
        for (const key of fields) {
            const value = String(input[key] || '').trim();
            if (!value) continue;
            if (value.length > 180 || /[\u0000-\u001f]/.test(value)) throw Error('Geçersiz belge alanı.');
            if (['birthDate','passportStart','passportEnd','identityEnd'].includes(key) && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw Error('Belgede geçersiz tarih var.');
            result[key] = value;
        }
        if (result.tc && !validTc(result.tc)) throw Error('T.C. numarası kontrolü başarısız.');
        if (!result.name || !(result.tc || result.passportNo || result.identityNo)) throw Error('Ad ve belge numarası okunamadı.');
        if (result.gender && !['Kadın','Erkek'].includes(result.gender)) delete result.gender;
        if (result.documentType === 'identity') { delete result.passportNo; delete result.passportStart; delete result.passportEnd; }
        if (result.documentType === 'passport') { delete result.identityNo; delete result.identityEnd; }
        return result;
    }
    function match(passengers, document) {
        const hits = passengers.filter(p => (document.tc && p.tc === document.tc)
            || (document.passportNo && p.passportNo === document.passportNo)
            || (document.identityNo && p.identityNo === document.identityNo));
        if (hits.length > 1) throw Error('Birden fazla kayıt eşleşti. Önce mükerrer kayıtları düzeltin.');
        const p = hits[0];
        if (p && p.tc && document.tc && p.tc !== document.tc) throw Error('Belge numarası eşleşti ancak T.C. numaraları farklı. Kayıt değiştirilmedi.');
        return p || null;
    }
    function merge(existing, document) {
        const next = { ...existing };
        fields.forEach(key => { if (document[key]) next[key] = document[key]; });
        next.documentReadAt = new Date().toISOString();
        next.documentVerification = document.source === 'camera' ? 'mrz-checked' : 'not-verified';
        return next;
    }
    const api = { validTc, normalize, match, merge };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.TurizmDocumentRules = api;
    if (typeof document === 'undefined') return;
    root.installDocumentReader = function (hooks) {
        const panel = document.createElement('div');
        panel.className = 'document-reader';
        panel.innerHTML = `<strong>Kimlik / Pasaport okut</strong><p>Önce yukarıdan programı seçin. Kamerayla okumada belgenin altındaki MRZ satırlarını net çekin.</p>
          <button type="button" class="btn btn-gold" data-camera>Canlı kamerayla okut</button>
          <button type="button" class="btn btn-outline dark" data-scan>NFC ile okut</button>
          <div data-camera-tools class="camera-review" hidden>
            <label>Okunan MRZ satırları <small>Pasaportta 2, kimlikte 3 satır. Hataları düzeltebilirsiniz.</small><textarea data-mrz rows="4" spellcheck="false" autocapitalize="characters"></textarea></label>
            <label>T.C. kimlik no <small>MRZ’de yoksa mevcut yolcuyla eşleştirmek için girin.</small><input data-tc inputmode="numeric" autocomplete="off" maxlength="11"></label>
            <button type="button" class="btn btn-gold" data-parse>Satırları işle</button>
          </div>
          <span data-status role="status" aria-live="polite"></span>`;
        document.getElementById('passengerTable').closest('.table-wrap').before(panel);
        let pending = null;
        const status = panel.querySelector('[data-status]');
        const cameraButton = panel.querySelector('[data-camera]');
        const cameraTools = panel.querySelector('[data-camera-tools]');
        const signature = () => JSON.stringify(hooks.context());
        const dialog = document.createElement('dialog');
        dialog.className = 'document-preview';
        document.body.append(dialog);
        function clear() { pending = null; dialog.close(); dialog.replaceChildren(); }
        dialog.addEventListener('cancel', clear);
        cameraButton.onclick = async () => {
            try {
                if (!hooks.allowed()) throw Error('Yolcu düzenleme yetkiniz yok.');
                if (!hooks.context().tourId) throw Error('Önce kayıt yapılacak programı seçin.');
                pending = { token: crypto.randomUUID(), signature: signature() };
                cameraTools.hidden = true;
                cameraButton.disabled = true;
                if (!root.TurizmMrzCamera?.captureLive || !root.TurizmMrzCamera?.readDocument) throw Error('Canlı kamera okuyucu yüklenemedi.');
                const token = pending.token;
                const image = await root.TurizmMrzCamera.captureLive(message => { status.textContent = message; });
                const read = await root.TurizmMrzCamera.readDocument(image, message => { status.textContent = message; });
                if (!pending || pending.token !== token || signature() !== pending.signature) throw Error('Program veya liste değişti. Fotoğrafı yeniden çekin.');
                pending.visualText = read.visualText;
                panel.querySelector('[data-mrz]').value = read.mrzText.trim();
                cameraTools.hidden = false;
                status.textContent = 'Okunan MRZ satırlarını ve varsa T.C. numarasını kontrol edip “Satırları işle”ye basın.';
            } catch (error) { pending = null; status.textContent = error.message; }
            finally { cameraButton.disabled = false; }
        };
        panel.querySelector('[data-parse]').onclick = async () => {
            try {
                if (!pending || signature() !== pending.signature || !hooks.allowed()) throw Error('Program veya liste değişti. Yeniden okutun.');
                const parser = await import('/vendor/mrz/lib/index.js');
                const documentData = root.TurizmMrzCamera.parseText(panel.querySelector('[data-mrz]').value, parser.parse, panel.querySelector('[data-tc]').value, new Date(), pending.visualText || '');
                root.turizmNfcResult({requestId:pending.token, document:documentData});
                cameraTools.hidden = true;
            } catch (error) { status.textContent = error.message; }
        };
        panel.querySelector('[data-scan]').onclick = () => {
            try {
                if (!hooks.allowed()) throw Error('Yolcu düzenleme yetkiniz yok.');
                const context = hooks.context();
                if (!context.tourId) throw Error('Önce kayıt yapılacak programı seçin.');
                if (!root.TurizmNfc) throw Error('NFC için Turizm NFC telefon uygulamasını kullanın. Telefonda kaydedilen yolcu bu bilgisayarda da senkronize olur.');
                pending = { token: crypto.randomUUID(), signature: signature() };
                root.TurizmNfc.postMessage(JSON.stringify({ action: 'scan', requestId: pending.token, context: {companyId:context.companyId,tourId:context.tourId,tourTitle:context.tourTitle} }));
                status.textContent = 'Telefon ekranındaki belge bilgilerini girip NFC okumayı başlatın.';
            } catch (e) { status.textContent = e.message; }
        };
        root.turizmNfcResult = function (response) {
            try {
                if (!pending || response.requestId !== pending.token) return;
                if (response.error) throw Error(response.error);
                if (signature() !== pending.signature || !hooks.allowed()) throw Error('Program, firma veya liste değişti. Belgeyi tekrar okutun.');
                const data = normalize(response.document);
                const old = hooks.find(data);
                const photo = response.document.photo;
                if (photo && (typeof photo !== 'string' || photo.length > 3000000 || !/^data:image\/(jpeg|jp2);base64,[A-Za-z0-9+/]+={0,2}$/.test(photo))) throw Error('Fotoğraf biçimi veya boyutu geçersiz.');
                dialog.replaceChildren();
                const title = document.createElement('h2');
                title.textContent = old ? 'Mevcut yolcuyu güncelle' : 'Yeni yolcu ekle'; dialog.append(title);
                const description = document.createElement('p');
                description.textContent = hooks.context().tourTitle + (data.source === 'camera'
                    ? ' — Kameradan okunan MRZ kontrol rakamları doğrulandı. Çip ve belge imzası doğrulanmadı.'
                    : ' — Çip bilgileri okundu; belgenin dijital imzası doğrulanmadı.'); dialog.append(description);
                const table = document.createElement('table');
                const labels = {name:'Ad soyad',tc:'T.C.',gender:'Cinsiyet',birthDate:'Doğum tarihi',passportNo:'Pasaport no',passportStart:'Pasaport başlangıç',passportEnd:'Pasaport bitiş',identityNo:'Kimlik seri no',identityEnd:'Kimlik bitiş',nationality:'Uyruk',issuingCountry:'Düzenleyen ülke',placeOfBirth:'Doğum yeri',issuingAuthority:'Düzenleyen makam'};
                for (const key of fields) if (data[key]) {
                    const row = document.createElement('tr');
                    for (const text of [labels[key], old?.[key] || '—', data[key]]) { const cell = document.createElement('td'); cell.textContent = text; row.append(cell); }
                    table.append(row);
                }
                dialog.append(table);
                const note = document.createElement('p');
                note.textContent = 'Tablo: alan / eski değer / okunan değer. Belgedeki Latin harfli ad yazımı kullanılacaktır. Okunmayan alanlar korunur.' + (data.source === 'camera' ? ' Kamera okuması çip fotoğrafını içermez.' : ' Çip fotoğrafı kalıcı kayda eklenmez; buradan indirebilirsiniz.'); dialog.append(note);
                if (response.document.warning) { const warning = document.createElement('p'); warning.textContent = String(response.document.warning).slice(0,250); dialog.append(warning); }
                if (photo) {
                    if (photo.startsWith('data:image/jpeg;')) { const img = document.createElement('img'); img.src = photo; img.alt = 'Belgeden okunan fotoğraf'; img.width = 120; dialog.append(img); }
                    const download = document.createElement('button'); download.type = 'button'; download.textContent = 'Fotoğrafı indir / paylaş';
                    download.onclick = () => root.TurizmNfc.postMessage(JSON.stringify({action:'photo', requestId:response.requestId})); dialog.append(download);
                }
                const apply = document.createElement('button'); apply.type = 'button'; apply.className = 'btn btn-gold'; apply.textContent = old ? 'Değişiklikleri listeye uygula' : 'Yolcuyu listeye ekle';
                apply.onclick = () => {
                    try {
                        if (!pending || signature() !== pending.signature || !hooks.allowed()) throw Error('Liste değişti. Belgeyi yeniden okutun.');
                        hooks.apply(data); clear(); status.textContent = 'Bilgiler forma uygulandı. Kalıcı kayıt için Listeyi Kaydet düğmesine basın.';
                    } catch (e) { clear(); status.textContent = e.message; }
                };
                const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Vazgeç'; cancel.onclick = clear;
                dialog.append(apply,cancel); dialog.showModal(); status.textContent = '';
            } catch (e) { clear(); status.textContent = e.message; }
        };
    };
})(typeof window === 'undefined' ? globalThis : window);
