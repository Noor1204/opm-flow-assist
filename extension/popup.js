const $ = id => document.getElementById(id);
const status = text => { $('status').textContent = text; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function waitForComplete(tabId, timeout = 20000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn) => { if (done) return; done = true; chrome.tabs.onUpdated.removeListener(listener); clearTimeout(timer); fn(); };
    const listener = (id, info) => { if (id === tabId && info.status === 'complete') finish(resolve); };
    const timer = setTimeout(() => finish(() => reject(new Error('OPM page reload timed out.'))), timeout);
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function run(tabId, func, args = []) {
  const result = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  return result?.[0]?.result;
}

const setDate = (date) => {
  const el = document.querySelector('#txtTaskDate');
  if (!(el instanceof HTMLInputElement)) throw new Error('OPM date field not found.');
  const proto = Object.getPrototypeOf(el), setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter ? setter.call(el, date) : el.value = date;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  if (typeof window.setDate === 'function') window.setDate();
  return true;
};

const setProjectAndPostback = () => {
  const el = document.querySelector('#ddlProj');
  if (!(el instanceof HTMLSelectElement)) throw new Error('Project field not found.');
  el.value = '417';
  if (typeof window.Set_Hid === 'function') window.Set_Hid();
  if (typeof window.__doPostBack !== 'function') throw new Error('OPM postback function not found.');
  window.__doPostBack('ddlProj', '');
  return true;
};

const setTypeAndPostback = () => {
  const el = document.querySelector('#ddlTaskType');
  if (!(el instanceof HTMLSelectElement)) throw new Error('Task Type field not found.');
  el.value = 'P';
  if (typeof window.Set_hidType === 'function') window.Set_hidType();
  if (typeof window.__doPostBack !== 'function') throw new Error('OPM postback function not found.');
  window.__doPostBack('ddlTaskType', '');
  return true;
};

const fillRest = (ticketId, hours) => {
  const cat = document.querySelector('#ddlTaskCat');
  if (!(cat instanceof HTMLSelectElement)) throw new Error('Task Category field not found.');
  cat.value = '22';
  if (typeof window.Set_hidCat === 'function') window.Set_hidCat();

  const input = document.querySelector('#txtHrs');
  if (!(input instanceof HTMLInputElement)) throw new Error('Hours field not found.');
  input.value = String(hours);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));

  const select = document.querySelector('#ddlTask');
  if (select instanceof HTMLSelectElement) {
    const opt = [...select.options].find(o => o.value === ticketId || o.textContent.trim() === ticketId || o.textContent.includes(ticketId));
    if (!opt) throw new Error(`Task not found: ${ticketId}`);
    select.value = opt.value;
    if (typeof window.Set_hidTask === 'function') window.Set_hidTask();
    return { needsSelect: false };
  }

  const container = document.querySelector('#select2-ddlTask-container');
  const trigger = container?.closest('.select2-selection');
  if (!(trigger instanceof HTMLElement)) throw new Error('OPM Task Select2 control not found.');
  trigger.click();
  return { needsSelect: true };
};

const finishTaskAndSave = (ticketId) => {
  const open = document.querySelector('.select2-container--open');
  if (open) {
    const opts = [...open.querySelectorAll('.select2-results__option')];
    const match = opts.find(o => o.textContent.trim() === ticketId || o.textContent.includes(ticketId));
    if (!match) throw new Error(`Task not found: ${ticketId}`);
    match.click();
    if (typeof window.Set_hidTask === 'function') window.Set_hidTask();
  }
  const save = document.querySelector('#LnkSave');
  if (!(save instanceof HTMLElement)) throw new Error('OPM Save button not found.');
  save.click();
  return true;
};

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); $('date').value = d.toISOString().slice(0, 10);
  $('start').addEventListener('click', async () => {
    if (!tab?.id) return status('OPM tab not found.');
    const date = $('date').value;
    const rows = $('tickets').value.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(line => {
      const [id, hours] = line.split('|').map(v => v.trim()); return { id, hours };
    });
    if (!date) return status('Select OPM date.');
    if (!rows.length || rows.some(r => !r.id || !r.hours)) return status('Use: TICKET | HOURS');
    try {
      for (let i = 0; i < rows.length; i++) {
        const t = rows[i];
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSetting date...`);
        await run(tab.id, setDate, [date]);
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSelecting Raj ERP 4.0...`);
        const nav1 = waitForComplete(tab.id);
        await run(tab.id, setProjectAndPostback);
        await nav1;
        await sleep(500);
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSelecting OPM...`);
        const nav2 = waitForComplete(tab.id);
        await run(tab.id, setTypeAndPostback);
        await nav2;
        await sleep(500);
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nFilling category, task and hours...`);
        await run(tab.id, fillRest, [t.id, t.hours]);
        await sleep(700);
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSaving...`);
        await run(tab.id, finishTaskAndSave, [t.id]);
        await sleep(1200);
      }
      status(`Done: ${rows.length} ticket(s).`);
    } catch (e) { status(`Stopped: ${e instanceof Error ? e.message : String(e)}`); }
  });
});
