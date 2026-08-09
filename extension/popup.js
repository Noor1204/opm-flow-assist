const $ = id => document.getElementById(id);
const status = text => { $('status').textContent = text; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run(tabId, func, args = []) {
  const result = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  return result?.[0]?.result;
}

async function waitForOPM(tabId, test, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      if (await run(tabId, test)) return true;
    } catch (_) {}
    await sleep(400);
  }
  throw new Error('OPM page did not become ready after postback.');
}

const setDate = date => {
  const el = document.querySelector('#txtTaskDate');
  if (!(el instanceof HTMLInputElement)) throw new Error('OPM date field not found.');
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter ? setter.call(el, date) : el.value = date;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  if (typeof window.setDate === 'function') window.setDate();
  return true;
};

const projectPostback = () => {
  const el = document.querySelector('#ddlProj');
  if (!(el instanceof HTMLSelectElement)) throw new Error('Project field not found.');
  el.value = '417';
  if (typeof window.Set_Hid === 'function') window.Set_Hid();
  if (typeof window.__doPostBack !== 'function') throw new Error('OPM postback function not found.');
  window.__doPostBack('ddlProj', '');
  return true;
};

const projectReady = () => {
  const p = document.querySelector('#ddlProj');
  const type = document.querySelector('#ddlTaskType');
  return p instanceof HTMLSelectElement && p.value === '417' && type instanceof HTMLSelectElement;
};

const typePostback = () => {
  const el = document.querySelector('#ddlTaskType');
  if (!(el instanceof HTMLSelectElement)) throw new Error('Task Type field not found.');
  el.value = 'P';
  if (typeof window.Set_hidType === 'function') window.Set_hidType();
  if (typeof window.__doPostBack !== 'function') throw new Error('OPM postback function not found.');
  window.__doPostBack('ddlTaskType', '');
  return true;
};

const typeReady = () => {
  const t = document.querySelector('#ddlTaskType');
  const c = document.querySelector('#ddlTaskCat');
  return t instanceof HTMLSelectElement && t.value === 'P' && c instanceof HTMLSelectElement;
};

const fillCategoryAndHours = hours => {
  const cat = document.querySelector('#ddlTaskCat');
  if (!(cat instanceof HTMLSelectElement)) throw new Error('Task Category field not found.');
  cat.value = '22';
  if (typeof window.Set_hidCat === 'function') window.Set_hidCat();

  const input = document.querySelector('#txtHrs');
  if (!(input instanceof HTMLInputElement)) throw new Error('Hours field not found.');
  const proto = Object.getPrototypeOf(input);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter ? setter.call(input, String(hours)) : input.value = String(hours);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
  return true;
};

const openTaskSearch = ticketId => {
  const select = document.querySelector('#ddlTask');
  if (select instanceof HTMLSelectElement) {
    const opt = [...select.options].find(o => o.value === ticketId || o.textContent.trim() === ticketId || o.textContent.includes(ticketId));
    if (!opt) throw new Error(`Task not found: ${ticketId}`);
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    if (typeof window.Set_hidTask === 'function') window.Set_hidTask();
    return 'native';
  }

  const container = document.querySelector('#select2-ddlTask-container');
  const trigger = container?.closest('.select2-selection');
  if (!(trigger instanceof HTMLElement)) throw new Error('OPM Task Select2 control not found.');
  trigger.click();
  const search = document.querySelector('.select2-container--open .select2-search__field');
  if (!(search instanceof HTMLInputElement)) throw new Error('OPM Task search field not found.');
  const proto = Object.getPrototypeOf(search);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter ? setter.call(search, ticketId) : search.value = ticketId;
  search.dispatchEvent(new Event('input', { bubbles: true }));
  search.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a', code: 'KeyA' }));
  return 'select2';
};

const selectTaskAndSave = async ticketId => {
  const native = document.querySelector('#ddlTask');
  if (native instanceof HTMLSelectElement) {
    const selected = native.selectedOptions?.[0];
    if (!selected || !selected.textContent.includes(ticketId)) throw new Error(`Task selection failed: ${ticketId}`);
  } else {
    const started = Date.now();
    let match = null;
    while (Date.now() - started < 15000) {
      const open = document.querySelector('.select2-container--open');
      const opts = open ? [...open.querySelectorAll('.select2-results__option')] : [];
      match = opts.find(o => o.textContent.trim() === ticketId || o.textContent.includes(ticketId));
      if (match) break;
      await new Promise(r => setTimeout(r, 300));
    }
    if (!match) throw new Error(`Task result not found: ${ticketId}`);
    match.click();
    if (typeof window.Set_hidTask === 'function') window.Set_hidTask();

    const rendered = document.querySelector('#select2-ddlTask-container');
    if (!(rendered instanceof HTMLElement) || !rendered.textContent.includes(ticketId)) {
      throw new Error(`Task was not selected: ${ticketId}`);
    }
  }

  const save = document.querySelector('#LnkSave');
  if (!(save instanceof HTMLElement)) throw new Error('OPM Save button not found.');
  save.click();
  return true;
};

const saveCompleted = () => {
  const modal = document.querySelector('#myNewModal');
  const save = document.querySelector('#LnkSave');
  // A successful save closes/removes the entry modal. Never report Done while it is still open.
  return !modal || !(save instanceof HTMLElement) || getComputedStyle(modal).display === 'none';
};

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  $('date').value = d.toISOString().slice(0, 10);

  $('start').addEventListener('click', async () => {
    if (!tab?.id) return status('OPM tab not found.');
    const date = $('date').value;
    const rows = $('tickets').value.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(line => {
      const [id, hours] = line.split('|').map(v => v.trim());
      return { id, hours };
    });
    if (!date) return status('Select OPM date.');
    if (!rows.length || rows.some(r => !r.id || !r.hours)) return status('Use: TICKET | HOURS');

    try {
      for (let i = 0; i < rows.length; i++) {
        const t = rows[i];
        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSetting date...`);
        await run(tab.id, setDate, [date]);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSelecting Raj ERP 4.0...`);
        await run(tab.id, projectPostback);
        await waitForOPM(tab.id, projectReady);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSelecting OPM...`);
        await run(tab.id, typePostback);
        await waitForOPM(tab.id, typeReady);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nFilling category and hours...`);
        await run(tab.id, fillCategoryAndHours, [t.hours]);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSearching task...`);
        await run(tab.id, openTaskSearch, [t.id]);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nSelecting task...`);
        await run(tab.id, selectTaskAndSave, [t.id]);

        status(`Ticket ${i + 1}/${rows.length}: ${t.id}\nWaiting for Save confirmation...`);
        await waitForOPM(tab.id, saveCompleted, 20000);
      }
      status(`Done: ${rows.length} ticket(s) saved.`);
    } catch (e) {
      status(`Stopped: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
});
