const assert=require('node:assert/strict'),R=require('../public/passenger-registration');
const p=(id,type,extra={})=>({id,name:'Yolcu '+id,roomPeople:type,...extra});
const ids=list=>R.rooms(list).map(r=>r.occupants.map(x=>x.id).join(''));

// Arkadaşı yakınlığı seçilebilir; diğer yakınlıklar gibi kimin arkadaşı olduğu istenir.
assert.ok(R.relationships.includes('Arkadaşı'));
R.validate([p('a','2',{relationship:'Kendisi'}),p('b','2',{relationship:'Arkadaşı',relativePassengerId:'a'})]);
assert.throws(()=>R.validate([p('b','2',{relationship:'Arkadaşı'})]),/kimin arkadaşı/);

// Eski kayıtlar (oda yeri yok) aynen eskisi gibi odalanır.
const legacy=[p('a','4'),p('b','4'),p('c','4'),p('d','4'),p('e','4'),p('f','4'),p('g','2'),p('h','2')];
assert.deepEqual(ids(legacy),['gh','abcd','ef']);

// Yer değiştirme: iki kişi odalarını değiştirir, başka kimse kaymaz; liste sırası hiç değişmez.
const swapped=R.swapRooms(legacy,'b','f');
assert.deepEqual(ids(swapped),['gh','acdf','be']);
assert.deepEqual(swapped.map(x=>x.id).join(''),'abcdefgh');
assert.deepEqual(ids(R.swapRooms(swapped,'a','c')),['gh','acdf','be']);
// Farklı tipte odaya geçen kişi o odanın tipini alır.
const cross=R.swapRooms(legacy,'a','g');
assert.deepEqual(ids(cross),['ah','bcdg','ef']);
assert.equal(cross.find(x=>x.id==='a').roomPeople,'2');assert.equal(cross.find(x=>x.id==='g').roomPeople,'4');
assert.throws(()=>R.swapRooms([...legacy,p('z','')],'a','z'),/oda tipini/);

// Odalama ekranının düzeni: oda numaraları odaya yazılır, boş oda düşer, fazla kişi kabul edilmez.
const layout=R.roomLayout(legacy);
assert.deepEqual(layout.rooms.map(r=>r.ids.join('')),['gh','abcd','ef']);
layout.rooms[1].ids=['a','b','c'];layout.rooms[2].ids=['d','e','f'];layout.rooms[2].type='3';layout.rooms[2].mekkeRoomNo='M-12';
layout.rooms.push({type:'4',ids:[],mekkeRoomNo:'',medineRoomNo:''});
const applied=R.applyRoomLayout(legacy,layout.rooms);
assert.deepEqual(ids(applied),['gh','def','abc']);
assert.deepEqual(applied.filter(x=>'def'.includes(x.id)).map(x=>x.roomPeople+x.mekkeRoomNo),['3M-12','3M-12','3M-12']);
assert.throws(()=>R.applyRoomLayout(legacy,[{type:'2',ids:['a','b','c']}]),/en çok 2/);
assert.throws(()=>R.applyRoomLayout(legacy,[{type:'2',ids:['a']},{type:'2',ids:['a']}]),/iki odaya/);
// Sonradan eklenen yolcu sabit odaları bozmaz, kendi tipinde arkaya eklenir.
assert.deepEqual(ids([...applied,p('n','4'),p('m','3')]),['gh','def','m','abc','n']);
// Oda yeri kalmış ama tipi değişmiş yolcu yeni tipte ayrı odada görünür, eski odası bozulmaz.
assert.deepEqual(ids(applied.map(x=>x.id==='a'?{...x,roomPeople:'2'}:x)),['gh','a','def','bc']);
// Oda içindeki sıra liste sırasını izler; liste sırası değişmez.
const reordered=R.applyRoomLayout(legacy,[{type:'4',ids:['d','c','b','a']},{type:'2',ids:['h','g']},{type:'4',ids:['e','f']}]);
assert.deepEqual(ids(reordered),['gh','abcd','ef']);assert.deepEqual(reordered.map(x=>x.id).join(''),'abcdefgh');

// Odaya girmemiş ama tipi seçilmiş yolcu o tipi alır; tipsiz kalan dokunulmadan kalır; bozulan odanın yeri silinir.
const fresh=[p('x',''),p('y',''),p('z',''),p('w','4',{roomSlot:'R9'})];
const waited=R.applyRoomLayout(fresh,[{type:'2',ids:['x']}],{y:'3',z:'',w:'4'});
assert.deepEqual(waited.map(x=>x.roomPeople),['2','3','','4']);
assert.equal(waited.find(x=>x.id==='w').roomSlot,undefined);
assert.throws(()=>R.applyRoomLayout(fresh,[],{y:'7'}),/geçersiz/);
assert.deepEqual(ids(waited),['x','y','w','z']);

// Değişmeyen alanlar yazılmaz: aynı odada kalan yolcuda yalnız oda yeri eklenir.
const kept=R.applyRoomLayout([p('k','2',{roomNo:'M-1'})],[{type:'2',ids:['k'],mekkeRoomNo:'M-1',medineRoomNo:'M-1'}])[0];
assert.deepEqual(Object.keys(kept).sort(),['id','name','roomNo','roomPeople','roomSlot']);

// İki cihaz aynı listenin sırasını farklı değiştirirse sunucunun sırası kalır; diğer düzenlemeler birleşir.
const S=require('../public/state-sync');
const list=passengers=>({passengerLists:[{id:'L',passengers}],_meta:{}});
const base=list([p('a','2'),p('b','2'),p('c','2')]);
const local=list([p('c','2'),p('a','2',{note:'yerel'}),p('b','2')]);
const remote=list([p('b','2'),p('a','2'),p('c','2'),p('d','2')]);
const merged=S.merge(base,local,remote);
assert.equal(merged.ok,true);
assert.deepEqual(merged.state.passengerLists[0].passengers.map(x=>x.id).join(''),'bacd');
assert.equal(merged.state.passengerLists[0].passengers.find(x=>x.id==='a').note,'yerel');
// Aynı yolcunun aynı alanı iki cihazda farklı değişirse yine çakışma sayılır.
assert.equal(S.merge(base,list([p('a','3'),p('b','2'),p('c','2')]),list([p('a','4'),p('b','2'),p('c','2')])).ok,false);

console.log('Arkadaşı relationship, room swaps without shifting, rooming board layouts and legacy rooming passed.');
