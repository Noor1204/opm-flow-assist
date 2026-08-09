(() => {
  const SELECTORS = {
    project: '#ddlProj',
    taskType: '#ddlTaskType',
    taskCategory: '#ddlTaskCat',
    hours: '#txtHrs',
    save: '#LnkSave',
    task: '#ddlTask'
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setNativeValue(element, value) {
    const prototype = Object.getPrototypeOf(element);
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function callPageFunction(name) {
    try {
      const fn = window[name];
      if (typeof fn === 'function') fn.call(window);
    } catch (error) {
      console.warn(`OPM ${name}() failed`, error);
    }
  }

  function selectByValue(selector, value, pageHandler) {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLSelectElement)) throw new Error(`OPM field not found: ${selector}`);
    const option = [...element.options].find((item) => item.value === String(value));
    if (!option) throw new Error(`OPM option not found for ${selector}: ${value}`);
    setNativeValue(element, option.value);
    if (pageHandler) callPageFunction(pageHandler);
    return option.textContent?.trim() || option.value;
  }

  function setInput(selector, value) {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLInputElement)) throw new Error(`OPM input not found: ${selector}`);
    setNativeValue(element, String(value ?? ''));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  async function selectTask(taskText) {
    const select = document.querySelector(SELECTORS.task);
    if (select instanceof HTMLSelectElement) {
      const option = [...select.options].find((item) => item.textContent?.trim() === taskText || item.value === taskText || item.textContent?.includes(taskText));
      if (!option) throw new Error(`Task not found: ${taskText}`);
      setNativeValue(select, option.value);
      return option.textContent?.trim() || taskText;
    }

    const container = document.querySelector('#select2-ddlTask-container');
    const trigger = container?.closest('.select2-selection');
    if (!(trigger instanceof HTMLElement)) throw new Error('OPM Task Select2 control not found.');
    trigger.click();
    await wait(150);
    const search = document.querySelector('.select2-container--open .select2-search__field');
    if (!(search instanceof HTMLInputElement)) throw new Error('OPM Task search field not found.');
    setNativeValue(search, taskText);
    search.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    await wait(700);
    const options = [...document.querySelectorAll('.select2-container--open .select2-results__option')];
    const match = options.find((item) => item.textContent?.trim() === taskText || item.textContent?.includes(taskText));
    if (!(match instanceof HTMLElement)) throw new Error(`Task not found: ${taskText}`);
    match.click();
    return taskText;
  }

  async function fillTicket(ticket) {
    if (!ticket?.id) throw new Error('Ticket ID is required.');
    selectByValue(SELECTORS.project, ticket.projectValue ?? '417', 'Set_Hid');
    await wait(250);
    selectByValue(SELECTORS.taskType, ticket.taskTypeValue ?? 'M', 'Set_hidType');
    await wait(250);
    selectByValue(SELECTORS.taskCategory, ticket.taskCategoryValue ?? '22', 'Set_hidCat');
    await wait(250);
    await selectTask(ticket.taskText ?? ticket.id);
    setInput(SELECTORS.hours, ticket.hours);
    return { ok: true, ticketId: ticket.id };
  }

  async function saveTicket() {
    const save = document.querySelector(SELECTORS.save);
    if (!(save instanceof HTMLElement)) throw new Error('OPM Save button not found.');
    save.click();
    return { ok: true };
  }

  window.addEventListener('message', async (event) => {
    if (event.source !== window || event.data?.source !== 'opm-flow-assist') return;
    const { requestId, action, ticket } = event.data;
    try {
      const result = action === 'fill-ticket' ? await fillTicket(ticket) : action === 'save-ticket' ? await saveTicket() : (() => { throw new Error(`Unknown action: ${action}`); })();
      window.postMessage({ source: 'opm-flow-assist', requestId, ok: true, result }, '*');
    } catch (error) {
      window.postMessage({ source: 'opm-flow-assist', requestId, ok: false, error: error instanceof Error ? error.message : String(error) }, '*');
    }
  });
})();
