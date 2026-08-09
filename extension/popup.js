const $ = id => document.getElementById(id);
const status = text => { $('status').textContent = text; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function waitForTabLoad(tabId, timeout=15000) {
  return new Promise((resolve,reject) => {
    const timer=setTimeout(()=>{chrome.tabs.onUpdated.removeListener(listener); reject(new Error('OPM page reload timed out.'));},timeout);
    function listener(id, info) { if(id===tabId && info.status==='complete'){clearTimeout(timer); chrome.tabs.onUpdated.removeListener(listener); setTimeout(resolve,300);} }
    chrome.tabs.onUpdated.addListener(listener);
  });
}
async function send(tabId, action, ticket) {
  try {
    const response = await chrome.tabs.sendMessage(tabId,{source:'opm-flow-assist',action,ticket});
    if(!response?.ok) throw new Error(response?.error || 'No response from OPM page.');
    return response.result;
  } catch(e) {
    if(String(e?.message||e).includes('Receiving end does not exist')) throw new Error('OPM page extension script is not ready. Refresh OPM and try again.');
    throw e;
  }
}
chrome.tabs.query({active:true,currentWindow:true},([tab])=>{
  const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); $('date').value=d.toISOString().slice(0,10);
  $('start').addEventListener('click',async()=>{
    if(!tab?.id) return;
    const date=$('date').value;
    if(!date) return status('Select OPM date.');
    const rows=$('tickets').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(line=>{const [id,hours]=line.split('|').map(v=>v.trim()); return {id,hours,date};});
    if(rows.some(r=>!r.id||!r.hours)) return status('Use: TICKET | HOURS');
    try {
      for(let i=0;i<rows.length;i++){
        const t=rows[i]; status(`Ticket ${i+1}/${rows.length}: ${t.id}\nSetting date...`);
        await send(tab.id,'set-date',t);
        status(`Ticket ${i+1}/${rows.length}: ${t.id}\nSelecting Project...`);
        await send(tab.id,'set-project',t); await waitForTabLoad(tab.id);
        status(`Ticket ${i+1}/${rows.length}: ${t.id}\nSelecting OPM...`);
        await send(tab.id,'set-tasktype',t); await waitForTabLoad(tab.id);
        status(`Ticket ${i+1}/${rows.length}: ${t.id}\nFilling category, task and hours...`);
        await send(tab.id,'fill-rest',t);
        await sleep(250);
        status(`Ticket ${i+1}/${rows.length}: ${t.id}\nSaving...`);
        await send(tab.id,'save-ticket',t);
        await waitForTabLoad(tab.id).catch(()=>{});
        await sleep(700);
      }
      status(`Done: ${rows.length} ticket(s).`);
    } catch(e){ status(`Stopped: ${e instanceof Error?e.message:String(e)}`); }
  });
});
