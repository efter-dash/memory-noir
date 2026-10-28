import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:4173';
const host=crypto.randomUUID(),a=crypto.randomUUID(),b=crypto.randomUUID();let code;
async function call(token,action,data={},expected=200){const r=await fetch(origin+'/api/room',{method:'POST',headers:{'Content-Type':'application/json','X-Room-Token':token},body:JSON.stringify({action,code,...data})});const v=await r.json();assert.equal(r.status,expected,JSON.stringify(v));return v;}
const r=await call(host,'create',{name:'Storyteller test',demo:false,truth:'Sam hid the cake in the greenhouse.',redHerring:'Everyone blamed the cat.',smokingGun:'A note signed Sam, next to the roses.'});code=r.code;
await call(a,'join',{name:'First detective'});await call(b,'join',{name:'Second detective'});await call(a,'start',{},400);await call(host,'start');
const joined=await call(a,'ping');assert.equal(joined.truth,undefined);assert.equal(joined.players.length,3);assert.ok(!JSON.stringify(joined).includes(host));
await call(a,'effect',{kind:'hot'},400);await call(a,'resolve',{correct:true},400);
await Promise.all([call(a,'pin',{id:'receipt'}),call(b,'pin',{id:'photo'}),call(a,'note',{text:'Maybe the cat was framed.'})]);
const pinned=await call(b,'ping');assert.equal(pinned.pins.length,3);assert.ok(pinned.pins.some(p=>p.text==='Maybe the cat was framed.'));
await call(a,'move',{id:pinned.pins[0].id,x:34,y:42});const moved=await call(b,'ping');assert.equal(moved.pins.find(p=>p.id===pinned.pins[0].id).x,34);
await call(host,'telegram',{text:'Look among the roses.'});assert.equal((await call(a,'ping')).telegrams.at(-1).text,'Look among the roses.');
await call(a,'accuse',{who:'Sam',what:'hid cake',where:'greenhouse'});await call(b,'vote');await call(host,'resolve',{correct:true});const revealed=await call(a,'ping');assert.equal(revealed.phase,'reveal');assert.equal(revealed.truth,'Sam hid the cake in the greenhouse.');
console.log('PASS: Three independent sessions, role isolation, concurrent board writes, cross-session moves, telegram, team voting, storyteller reveal.');
