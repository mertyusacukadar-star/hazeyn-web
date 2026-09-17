(function (root) {
    'use strict';

    function validTc(value) {
        if (!/^[1-9]\d{10}$/.test(value)) return false;
        const n = Array.from(value, Number);
        return ((n[0]+n[2]+n[4]+n[6]+n[8])*7-(n[1]+n[3]+n[5]+n[7]))%10 === n[9]
            && n.slice(0,10).reduce((sum,digit)=>sum+digit,0)%10 === n[10];
    }

    function linesFromText(raw) {
        return String(raw || '').toUpperCase().replace(/[«‹﹤]/g, '<').split(/\r?\n/)
            .map(line => line.replace(/\s/g, '').replace(/[^A-Z0-9<]/g, ''))
            .filter(line => line.length >= 27);
    }

    function mrzDate(value, kind, now = new Date()) {
        if (!/^\d{6}$/.test(value || '')) throw Error('Belgedeki tarih okunamadı.');
        const yy = Number(value.slice(0,2)), month = Number(value.slice(2,4)), day = Number(value.slice(4,6));
        let year = 2000 + yy;
        if (kind === 'birth' ? year > now.getUTCFullYear() : year > now.getUTCFullYear() + 30) year -= 100;
        const date = new Date(Date.UTC(year,month-1,day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth()+1 !== month || date.getUTCDate() !== day) throw Error('Belgede geçersiz tarih var.');
        return `${year.toString().padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }

    function parseText(raw, parse, manualTc = '', now = new Date()) {
        const lines = linesFromText(raw);
        const candidates = [];
        for (let i=0; i<lines.length; i++) {
            if (lines[i].length >= 44 && lines[i+1]?.length >= 44 && /^P[A-Z<]/.test(lines[i])) candidates.push([lines[i].slice(0,44),lines[i+1].slice(0,44)]);
            if (lines[i].length >= 30 && lines[i+1]?.length >= 30 && lines[i+2]?.length >= 30 && /^[IA][A-Z<]/.test(lines[i])) candidates.push([lines[i].slice(0,30),lines[i+1].slice(0,30),lines[i+2].slice(0,30)]);
        }
        if (!candidates.length) throw Error('Belgenin altındaki MRZ satırları tam okunamadı. Satırları düzeltip tekrar işleyin.');
        let result;
        for (const candidate of candidates) {
            try {
                const parsed = parse(candidate, { autocorrect:true });
                if (parsed.valid && ['TD1','TD3'].includes(parsed.format)) { result = parsed; break; }
            } catch (_) { /* A different pair may be the MRZ. */ }
        }
        if (!result) throw Error('MRZ kontrol rakamları uyuşmuyor. Fotoğrafı yeniden çekin veya satırları düzeltin.');
        const f = result.fields;
        if (!f.firstName || !f.lastName || !f.documentNumber || !f.birthDate || !f.expirationDate) throw Error('Zorunlu belge alanları okunamadı.');
        const optional = [f.personalNumber,f.optional1,f.optional2].map(v=>String(v||'').replace(/</g,'').trim());
        const mrzTc = optional.find(validTc) || '';
        const typedTc = String(manualTc||'').trim();
        if (typedTc && !validTc(typedTc)) throw Error('Elle girilen T.C. numarası geçerli değil.');
        if (typedTc && mrzTc && typedTc !== mrzTc) throw Error('MRZ ve elle girilen T.C. numaraları farklı.');
        const passport = result.format === 'TD3';
        const document = {
            version:1, source:'camera', documentType:passport ? 'passport' : 'identity',
            name:`${f.firstName} ${f.lastName}`.replace(/\s+/g,' ').trim(),
            gender:f.sex === 'male' ? 'Erkek' : f.sex === 'female' ? 'Kadın' : '',
            tc:mrzTc || typedTc,
            birthDate:mrzDate(f.birthDate,'birth',now),
            nationality:f.nationality || '', issuingCountry:f.issuingState || '',
            [passport ? 'passportNo' : 'identityNo']:f.documentNumber,
            [passport ? 'passportEnd' : 'identityEnd']:mrzDate(f.expirationDate,'expiry',now),
        };
        if (!mrzTc && typedTc) document.warning = 'T.C. numarası MRZ’de yoktu; elle girilen numarayı belgeyle karşılaştırın.';
        return document;
    }

    const api = { validTc, linesFromText, mrzDate, parseText };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.TurizmMrzCamera = api;
    if (typeof document === 'undefined') return;

    let scriptPromise;
    function loadOcr() {
        if (root.Tesseract) return Promise.resolve();
        if (!scriptPromise) scriptPromise = new Promise((resolve,reject) => {
            const script = document.createElement('script');
            script.src = '/vendor/ocr/tesseract.min.js';
            script.onload = resolve;
            script.onerror = () => reject(Error('Kamera okuma dosyası yüklenemedi. İnternet bağlantısını kontrol edin.'));
            document.head.append(script);
        }).catch(error => { scriptPromise = null; throw error; });
        return scriptPromise;
    }

    async function imageCanvas(file, cropBottom) {
        const url = URL.createObjectURL(file);
        try {
            const img = new Image();
            img.src = url;
            await img.decode();
            const canvas = document.createElement('canvas');
            const sourceY = cropBottom ? Math.floor(img.height * .53) : 0;
            const sourceHeight = img.height - sourceY;
            const scale = Math.min(2, 2200 / img.width, 1100 / sourceHeight);
            canvas.width = Math.max(1,Math.round(img.width*scale));
            canvas.height = Math.max(1,Math.round(sourceHeight*scale));
            const ctx = canvas.getContext('2d', { willReadFrequently:true });
            ctx.drawImage(img,0,sourceY,img.width,sourceHeight,0,0,canvas.width,canvas.height);
            const pixels = ctx.getImageData(0,0,canvas.width,canvas.height);
            for (let i=0; i<pixels.data.length; i+=4) {
                const gray = .299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2];
                const value = gray < 150 ? Math.max(0,gray*.6) : Math.min(255,gray*1.15);
                pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;
            }
            ctx.putImageData(pixels,0,0);
            return canvas;
        } finally { URL.revokeObjectURL(url); }
    }

    api.readImage = async function (file, status) {
        if (!file || !String(file.type).startsWith('image/') || file.size > 12*1024*1024) throw Error('12 MB altında bir belge fotoğrafı seçin.');
        await loadOcr();
        status('Kamera okuma motoru hazırlanıyor…');
        const worker = await root.Tesseract.createWorker('eng',1,{
            workerPath:'/vendor/ocr/worker.min.js', corePath:'/vendor/ocr', langPath:'/vendor/ocr/lang',
            workerBlobURL:false, gzip:true,
            logger: message => { if (message.status === 'recognizing text') status(`Belge okunuyor: %${Math.round(message.progress*100)}`); }
        });
        try {
            await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
            let raw = '';
            for (const crop of [true,false]) {
                const canvas = await imageCanvas(file,crop);
                const result = await worker.recognize(canvas);
                canvas.width = canvas.height = 0;
                raw = result.data.text;
                if (linesFromText(raw).some(line=>line.length===44 || line.length===30)) break;
            }
            return raw;
        } finally { await worker.terminate(); }
    };
})(typeof window === 'undefined' ? globalThis : window);
