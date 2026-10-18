export const isAuthorialShortage=e=>e.account==='cliente-x'&&e.status==='open'&&e.stage==='content-selection'&&/radar visual sem foto in[eé]dita|reserva autoral esgotada/i.test(e.error||'');
export function pendingAuthorialShortages({errors,history=[],ledger=[],now=new Date()}) {
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const previous=new Date(Date.parse(day+'T12:00:00-03:00')-86400000).toISOString().slice(0,10);
 return errors.filter(e=>isAuthorialShortage(e)&&[day,previous].includes(e.date)&&!e.scheduledPostId&&Number.isInteger(e.slotIndex)&&e.slotIndex>=0&&
  !history.some(h=>h.slotDate===e.date&&Number(h.slotIndex)===e.slotIndex)&&
  !ledger.some(h=>h.account==='cliente-x'&&h.date===e.date&&Number(h.slotIndex)===e.slotIndex&&['published','initialized'].includes(h.status)))
  .sort((a,b)=>a.date.localeCompare(b.date)||a.slotIndex-b.slotIndex);
}
