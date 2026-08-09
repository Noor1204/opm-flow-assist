(() => {
  const S = { date:'#txtTaskDate', project:'#ddlProj', taskType:'#ddlTaskType', category:'#ddlTaskCat', task:'#ddlTask', hours:'#txtHrs', save:'#LnkSave' };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function setValue(el, value, fireChange=false) {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, String(value)); else el.value = String(value);
    el.dispatchEvent(new Event('input', {bubbles:true}));
    if (fireChange) el.dispatchEvent(new Event('change', {bubbles:true}));
  }
  function fn(name) { try { if (typeof window[name] === 'function') window[name](); } catch(e) {} }
  function select(selector, value, handler) {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLSelectElement)) throw new Error(`OPM field not found: ${selector}`);
    const opt = [...el.options].find(o => o.value === String(value));
    if (!opt) throw new Error(`OPM option not found: ${value}`);
    setValue(el, opt.value, false); fn(handler);
    return opt.textContent.trim();
  }
  function setDate(value) {
    const el = document.querySelector(S.date);
    if (!(el instanceof HTMLInputElement)) throw new Error('OPM date field not found.');
    setValue(el, value, false); fn('setDate');
  }
  function postBack(control) {
    if (typeof window.__doPostBack !== 'function') throw new Error('OPM postback function not found.');
    window.__doPostBack(control, '');
  }
  async function task(text) {
    const sel = document.querySelector(S.task);
    if (sel instanceof HTMLSelectElement) {
      const opt = [...sel.options].find(o => o.value === text || o.textContent.trim() === text || o.textContent.includes(text));
      if (!opt) throw new Error(`Task not found: ${text}`);
      setValue(sel, opt.value, false); fn('Set_hidTask'); return opt.textContent.trim();
    }
    const box = document.querySelector('#select2-ddlTask-container');
    const trigger = box?.closest('.select2-selection');
    if (!(trigger instanceof HTMLElement)) throw new Error('OPM Task Select2 control not found.');
    trigger.click(); await sleep(150);
    const search = document.querySelector('.select2-container--open .select2-search__field');
    if (!(search instanceof HTMLInputElement)) throw new Error('OPM Task search field not found.');
    setValue(search, text, true); await sleep(500);
    const opts = [...document.querySelectorAll('.select2-container--open .select2-results__option')];
    const match = opts.find(o => o.textContent.trim() === text || o.textContent.includes(text));
    if (!(match instanceof HTMLElement)) throw new Error(`Task not found: ${text}`);
    match.click(); await sleep(100); fn('Set_hidTask'); return text;
  }
  async function action(message) {
    const t = message.ticket || {};
    if (message.action === 'set-date') { setDate(t.date); return {ok:true}; }
    if (message.action === 'set-project') { select(S.project, '417', 'Set_Hid'); postBack('ddlProj'); return {ok:true}; }
    if (message.action === 'set-tasktype') { select(S.taskType, 'P', 'Set_hidType'); postBack('ddlTaskType'); return {ok:true}; }
    if (message.action === 'fill-rest') {
      select(S.category, '22', 'Set_hidCat'); await task(t.id); const h=document.querySelector(S.hours); if (!(h instanceof HTMLInputElement)) throw new Error('OPM hours field not found.'); setValue(h, t.hours, false); h.dispatchEvent(new Event('blur',{bubbles:true})); return {ok:true};
    }
    if (message.action === 'save-ticket') { const save=document.querySelector(S.save); if (!(save instanceof HTMLElement)) throw new Error('OPM Save button not found.'); save.click(); return {ok:true}; }
    throw new Error(`Unknown action: ${message.action}`);
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.source !== 'opm-flow-assist') return;
    action(message).then(result=>sendResponse({ok:true,result})).catch(e=>sendResponse({ok:false,error:e instanceof Error?e.message:String(e)}));
    return true;
  });
})();
