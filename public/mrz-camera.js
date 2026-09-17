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
    function repairNameFillers(line, start) {
        const head = line.slice(0,start);
        const name = line.slice(start).replace(/<{3,}[<K]*$/, value => value.replace(/K/g,'<'));
        return head + name;
    }
    function repairMrzLines(input) {
        const lines = input.map(line => String(line));
        for (let i=0; i<lines.length; i++) {
            if (lines[i].length >= 44 && /^P[A-Z<K]/.test(lines[i])) {
                if (lines[i][1] === 'K') lines[i] = lines[i][0] + '<' + lines[i].slice(2);
                lines[i] = repairNameFillers(lines[i],5);
            }
            if (lines[i].length >= 30 && /^[A-Z<]+$/.test(lines[i]) && lines[i-1]?.length >= 30 && lines[i-2]?.length >= 30) lines[i] = repairNameFillers(lines[i],0);
        }
        return lines;
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
    const months = {JAN:1,OCA:1,FEB:2,SUB:2,MAR:3,APR:4,NIS:4,MAY:5,JUN:6,HAZ:6,JUL:7,TEM:7,AUG:8,AGU:8,SEP:9,EYL:9,OCT:10,EKI:10,NOV:11,KAS:11,DEC:12,ARA:12};
    function isoDate(year, month, day) {
        const date = new Date(Date.UTC(Number(year),Number(month)-1,Number(day)));
        if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth()+1 !== Number(month) || date.getUTCDate() !== Number(day)) return '';
        return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
    function datesFromVisibleText(text) {
        const normalized = String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
        const found = [];
        for (const match of normalized.matchAll(/\b([0-3]?\d)[.\/-]([01]?\d)[.\/-]((?:19|20)\d{2})\b/g)) {
            const value = isoDate(match[3],match[2],match[1]); if (value) found.push({value,index:match.index});
        }
        for (const match of normalized.matchAll(/\b([0-3]?\d)\s+([A-Z]{3})(?:\s*\/\s*[A-Z]{3})?\s+((?:19|20)\d{2})\b/g)) {
            const month = months[match[2]], value = month ? isoDate(match[3],month,match[1]) : ''; if (value) found.push({value,index:match.index});
        }
        return {normalized,found};
    }
    function extractIssueDate(text, expiration = '', birth = '', now = new Date()) {
        const {normalized,found} = datesFromVisibleText(text);
        if (!found.length) return '';
        const labels = /DATE\s*(?:OF\s*)?ISSUE|ISSUE\s*DATE|VERILIS\s*TARIHI|DATE\s*DE\s*DELIVRANCE|FECHA\s*DE\s*EXPEDICION/g;
        const max = now.toISOString().slice(0,10);
        const usable = entry => entry.value !== expiration && entry.value !== birth && entry.value <= max && (!expiration || entry.value < expiration);
        for (const label of normalized.matchAll(labels)) {
            const direct = found.filter(entry => entry.index >= label.index && entry.index <= label.index + 240 && usable(entry));
            if (direct.length) return direct[0].value;
        }
        if (!expiration) return '';
        const expiryTime = Date.parse(expiration + 'T00:00:00Z');
        const plausible = found.filter(usable).map(entry => ({...entry,years:(expiryTime-Date.parse(entry.value+'T00:00:00Z'))/31557600000}))
            .filter(entry => entry.years >= 1 && entry.years <= 11.5).sort((a,b)=>Math.abs(a.years-10)-Math.abs(b.years-10));
        return plausible[0]?.value || '';
    }
    function parseText(raw, parse, manualTc = '', now = new Date(), visualText = '') {
        const lines = repairMrzLines(linesFromText(raw)), candidates = [];
        for (let i=0; i<lines.length; i++) {
            if (lines[i].length >= 44 && lines[i+1]?.length >= 44 && /^P[A-Z<]/.test(lines[i])) candidates.push([lines[i].slice(0,44),lines[i+1].slice(0,44)]);
            if (lines[i].length >= 30 && lines[i+1]?.length >= 30 && lines[i+2]?.length >= 30 && /^[IA][A-Z<]/.test(lines[i])) candidates.push([lines[i].slice(0,30),lines[i+1].slice(0,30),lines[i+2].slice(0,30)]);
        }
        if (!candidates.length) throw Error('Belgenin altındaki MRZ satırları tam okunamadı. Belgeyi çerçeveye yerleştirip yeniden okutun.');
        let result;
        for (const candidate of candidates) { try { const parsed = parse(candidate,{autocorrect:true}); if (parsed.valid && ['TD1','TD3'].includes(parsed.format)) { result=parsed; break; } } catch (_) {} }
        if (!result) throw Error('MRZ kontrol rakamları uyuşmuyor. Belgeyi düz ve aydınlık zeminde yeniden okutun.');
        const f=result.fields;
        if (!f.firstName || !f.lastName || !f.documentNumber || !f.birthDate || !f.expirationDate) throw Error('Zorunlu belge alanları okunamadı.');
        const optional=[f.personalNumber,f.optional1,f.optional2].map(v=>String(v||'').replace(/</g,'').trim()), mrzTc=optional.find(validTc)||'', typedTc=String(manualTc||'').trim();
        if (typedTc && !validTc(typedTc)) throw Error('Elle girilen T.C. numarası geçerli değil.');
        if (typedTc && mrzTc && typedTc !== mrzTc) throw Error('MRZ ve elle girilen T.C. numaraları farklı.');
        const passport=result.format==='TD3', birthDate=mrzDate(f.birthDate,'birth',now), endDate=mrzDate(f.expirationDate,'expiry',now);
        const document={version:1,source:'camera',documentType:passport?'passport':'identity',name:`${f.firstName} ${f.lastName}`.replace(/\s+/g,' ').trim(),gender:f.sex==='male'?'Erkek':f.sex==='female'?'Kadın':'',tc:mrzTc||typedTc,birthDate,nationality:f.nationality||'',issuingCountry:f.issuingState||'',[passport?'passportNo':'identityNo']:f.documentNumber,[passport?'passportEnd':'identityEnd']:endDate};
        if (passport) { const startDate=extractIssueDate(visualText,endDate,birthDate,now); if (startDate) document.passportStart=startDate; }
        const warnings=[];
        if (!mrzTc && typedTc) warnings.push('T.C. numarası MRZ’de yoktu; elle girilen numarayı belgeyle karşılaştırın.');
        if (passport && !document.passportStart) warnings.push('Pasaport başlangıç tarihi MRZ’de bulunmaz ve görünen bilgi alanından güvenle okunamadı; bu alanı elle kontrol edin.');
        if (warnings.length) document.warning=warnings.join(' ');
        return document;
    }
    const api={validTc,linesFromText,repairMrzLines,mrzDate,datesFromVisibleText,extractIssueDate,parseText};
    if (typeof module!=='undefined'&&module.exports) module.exports=api;
    root.TurizmMrzCamera=api;
    if (typeof document==='undefined') return;
    let scriptPromise;
    function loadOcr() {
        if (root.Tesseract) return Promise.resolve();
        if (!scriptPromise) scriptPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/vendor/ocr/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(Error('Kamera okuma dosyası yüklenemedi. İnternet bağlantısını kontrol edin.'));document.head.append(script);}).catch(error=>{scriptPromise=null;throw error;});
        return scriptPromise;
    }
    async function imageCanvas(file,cropBottom,threshold) {
        const url=URL.createObjectURL(file);
        try {
            const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');
            const sourceY=cropBottom?Math.floor(img.height*.54):0,sourceHeight=img.height-sourceY,scale=Math.min(2.4,2400/img.width,1200/sourceHeight);
            canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(sourceHeight*scale));
            const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,sourceY,img.width,sourceHeight,0,0,canvas.width,canvas.height);
            if (threshold) { const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const gray=.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2],value=gray<165?Math.max(0,gray*.55):Math.min(255,gray*1.18);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;}ctx.putImageData(pixels,0,0); }
            return canvas;
        } finally { URL.revokeObjectURL(url); }
    }
    function hasMrz(raw) { const lines=repairMrzLines(linesFromText(raw));return lines.some((line,index)=>(line.length>=44&&lines[index+1]?.length>=44)||(line.length>=30&&lines[index+1]?.length>=30&&lines[index+2]?.length>=30)); }
    api.readDocument=async function(file,status){
        if(!file||!String(file.type).startsWith('image/')||file.size>12*1024*1024) throw Error('Belge görüntüsü alınamadı. Kamerayı yeniden açın.');
        await loadOcr();status('MRZ okuma motoru hazırlanıyor…');
        const worker=await root.Tesseract.createWorker('mrz',1,{workerPath:'/vendor/ocr/worker.min.js',corePath:'/vendor/ocr',langPath:'/vendor/ocr/lang',workerBlobURL:false,gzip:true,logger:message=>{if(message.status==='recognizing text')status(`Belge okunuyor: %${Math.round(message.progress*100)}`);}});
        try {
            const parser=await import('/vendor/mrz/lib/index.js');
            const validMrz=raw=>{try{parseText(raw,parser.parse,'',new Date(),'');return true;}catch(_){return false;}};
            await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
            let mrzText='',engReady=false,mrzValid=false;
            for(const crop of [true,false]){const canvas=await imageCanvas(file,crop,true),result=await worker.recognize(canvas);canvas.width=canvas.height=0;mrzText=result.data.text;if(validMrz(mrzText)){mrzValid=true;break;}}
            if(!mrzValid){
                status('MRZ ikinci yöntemle doğrulanıyor…');await worker.reinitialize('eng',1);engReady=true;
                await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
                let engText='';for(const crop of [true,false]){const canvas=await imageCanvas(file,crop,true),result=await worker.recognize(canvas);canvas.width=canvas.height=0;engText=result.data.text;if(validMrz(engText)){mrzText=engText;mrzValid=true;break;}}
                if(!mrzValid&&hasMrz(engText))mrzText=engText;
            }
            let visualText='';
            if(hasMrz(mrzText)&&repairMrzLines(linesFromText(mrzText)).some(line=>/^P[A-Z<]/.test(line))){status('Pasaport başlangıç tarihi okunuyor…');if(!engReady)await worker.reinitialize('eng',1);await worker.setParameters({tessedit_char_whitelist:'',tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});const page=await imageCanvas(file,false,false),result=await worker.recognize(page);page.width=page.height=0;visualText=result.data.text;}
            return {mrzText:repairMrzLines(linesFromText(mrzText)).join('\n'),visualText};
        } finally {await worker.terminate();}
    };
    api.readImage=async function(file,status){return(await api.readDocument(file,status)).mrzText;};
    function sourceRect(video,guide){const vr=video.getBoundingClientRect(),gr=guide.getBoundingClientRect(),scale=Math.max(vr.width/video.videoWidth,vr.height/video.videoHeight),drawnWidth=video.videoWidth*scale,drawnHeight=video.videoHeight*scale,offsetX=(drawnWidth-vr.width)/2,offsetY=(drawnHeight-vr.height)/2,x=Math.max(0,(gr.left-vr.left+offsetX)/scale),y=Math.max(0,(gr.top-vr.top+offsetY)/scale);return{x,y,width:Math.min(video.videoWidth-x,gr.width/scale),height:Math.min(video.videoHeight-y,gr.height/scale)};}
    function drawGuide(video,guide,canvas,maxWidth){const rect=sourceRect(video,guide),scale=Math.min(1,maxWidth/rect.width);canvas.width=Math.max(1,Math.round(rect.width*scale));canvas.height=Math.max(1,Math.round(rect.height*scale));canvas.getContext('2d',{willReadFrequently:true}).drawImage(video,rect.x,rect.y,rect.width,rect.height,0,0,canvas.width,canvas.height);}
    function frameMetrics(canvas,previous){const ctx=canvas.getContext('2d',{willReadFrequently:true}),{data}=ctx.getImageData(0,0,canvas.width,canvas.height),gray=new Uint8Array(canvas.width*canvas.height);let brightness=0,sharpness=0,count=0;for(let i=0,p=0;i<data.length;i+=4,p++){gray[p]=(.299*data[i]+.587*data[i+1]+.114*data[i+2])|0;brightness+=gray[p];}const startY=Math.floor(canvas.height*.62);for(let y=startY+1;y<canvas.height-1;y++)for(let x=1;x<canvas.width-1;x++){const p=y*canvas.width+x;sharpness+=Math.abs(4*gray[p]-gray[p-1]-gray[p+1]-gray[p-canvas.width]-gray[p+canvas.width]);count++;}let motion=0;if(previous?.length===gray.length)for(let i=0;i<gray.length;i+=4)motion+=Math.abs(gray[i]-previous[i]);return{brightness:brightness/gray.length,sharpness:sharpness/Math.max(1,count),motion:previous?.length===gray.length?motion/Math.ceil(gray.length/4):99,gray};}
    api.captureLive=async function(status){
        if(!navigator.mediaDevices?.getUserMedia)throw Error('Bu tarayıcı canlı kamera taramasını desteklemiyor. iPhone’da Safari veya ana ekran uygulamasını kullanın.');
        const scanner=document.createElement('section');scanner.className='passport-live-scanner';scanner.setAttribute('role','dialog');scanner.setAttribute('aria-modal','true');scanner.setAttribute('aria-label','Pasaport kamera okuyucu');scanner.innerHTML=`<button type="button" class="passport-scanner-close" data-close aria-label="Kamerayı kapat">×</button><div class="passport-camera-stage"><video data-video playsinline muted></video><div class="passport-guide" data-guide><span>Pasaport bilgi sayfasını çerçeveye sığdırın</span><i>MRZ</i></div></div><div class="passport-scanner-message" data-message>Arka kamera açılıyor…</div><div class="passport-scan-progress" data-progress><b></b><b></b><b></b><b></b><b></b></div><button type="button" class="btn btn-gold passport-manual-capture" data-capture>Şimdi tara</button>`;
        document.body.append(scanner);document.body.classList.add('camera-open');const video=scanner.querySelector('[data-video]'),guide=scanner.querySelector('[data-guide]'),message=scanner.querySelector('[data-message]'),progress=[...scanner.querySelectorAll('[data-progress] b')];let stream,timer,settled=false,stable=0,previous;
        const cleanup=()=>{clearTimeout(timer);stream?.getTracks().forEach(track=>track.stop());video.srcObject=null;scanner.remove();document.body.classList.remove('camera-open');};
        return new Promise((resolve,reject)=>{const fail=error=>{if(settled)return;settled=true;cleanup();reject(error);};const capture=()=>{if(settled||!video.videoWidth)return;settled=true;message.textContent='Görüntü alındı, bilgiler okunuyor…';const canvas=document.createElement('canvas');drawGuide(video,guide,canvas,2400);canvas.toBlob(blob=>{cleanup();blob?resolve(blob):reject(Error('Kamera görüntüsü alınamadı.'));},'image/jpeg',.95);};scanner.querySelector('[data-close]').addEventListener('click',()=>fail(Error('Tarama iptal edildi.')));scanner.querySelector('[data-capture]').addEventListener('click',capture);
            navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},focusMode:{ideal:'continuous'}}}).then(acquired=>{if(settled){acquired.getTracks().forEach(track=>track.stop());return;}stream=acquired;video.srcObject=stream;return video.play();}).then(()=>{if(settled)return;status('Canlı kamera açık; belgeyi çerçeveye sığdırın.');const sample=document.createElement('canvas');sample.width=180;sample.height=126;const inspect=()=>{if(settled)return;drawGuide(video,guide,sample,180);const metrics=frameMetrics(sample,previous);previous=metrics.gray;if(metrics.brightness<45){stable=0;message.textContent='Ortamı biraz aydınlatın';}else if(metrics.brightness>242){stable=0;message.textContent='Parlamayı azaltmak için telefonu eğin';}else if(metrics.sharpness<13){stable=0;message.textContent='Belgeye biraz yaklaşın ve netleştirin';}else if(metrics.motion>7){stable=0;message.textContent='Telefonu sabit tutun';}else{stable++;message.textContent=stable<5?'Sabit tutun, otomatik okunacak…':'Okunuyor…';}progress.forEach((dot,index)=>dot.classList.toggle('active',index<stable));if(stable>=5)capture();else timer=setTimeout(inspect,240);};timer=setTimeout(inspect,500);}).catch(error=>fail(Error(error?.name==='NotAllowedError'?'Kamera izni verilmedi. Safari ayarlarından bu site için kameraya izin verin.':'Arka kamera açılamadı.')));
        });
    };
})(typeof window === 'undefined' ? globalThis : window);
