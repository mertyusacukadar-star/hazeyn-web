const {normalizePlan}=require('../public/bus-plan');
function validateBusPlans(state){
  const plans=state.tourBusPlans;
  if(plans===undefined)return;
  const fail=()=>{const e=new Error('Otobüs planı geçersiz. Güncel tur ve yolcu listesiyle tekrar deneyin.');e.statusCode=400;throw e;};
  if(!plans||typeof plans!=='object'||Array.isArray(plans))fail();
  for(const plan of Object.values(plans)){
    // Plans for removed tours can be retained for recovery but cannot contain invalid shapes.
    if(!plan||!Array.isArray(plan.buses)||plan.buses.length>20)fail();
    const normalized=normalizePlan(plan);
    if(normalized.buses.length!==plan.buses.length)fail();
    for(let i=0;i<plan.buses.length;i++){
      const raw=plan.buses[i],b=normalized.buses[i];
      if(!raw||raw.id!==b.id||raw.name!==b.name||raw.capacity!==b.capacity||raw.limit!==b.limit||raw.rear!==b.rear||raw.doorAfter!==b.doorAfter)fail();
      if(JSON.stringify(raw.assignments)!==JSON.stringify(b.assignments))fail();
      // Passenger edits can remove people without editing their bus plan. The UI
      // reconciles these references on next open, without altering passenger records.
    }
  }
}
module.exports={validateBusPlans};
