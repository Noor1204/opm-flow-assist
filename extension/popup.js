const $ = (id) => document.getElementById(id);
const status = (text) => { $('status').textContent = text; };

function send(tabId, action, ticket) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const listener = (event) => {
      if (event.source !== window || event.data?.source !== 'opm-flow-assist-popup' || event.data.requestId !== requestId) return;
      window.removeEventListener('message', listener);
      event.data.ok ? resolve(event.data.result) : reject(new Error(event.data.error));
    };
    window.addEventListener('message', listener);
    chrome.scripting.executeScript({
      target: { tabId },
      func: (payload) => window.postMessage({ source: 'opm-flow-assist', ...payload }, '*'),
      args: [{ requestId, action, ticket }]
    }).catch(reject);
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  $('start').addEventListener('click', async () => {
    if (!tab?.id) return;
    const rows = $('tickets').value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [id, hours] = line.split('|').map((v) => v.trim());
      return { id, taskText: id, hours, projectValue: '417', taskTypeValue: 'M', taskCategoryValue: '22' };
    });
    if (!rows.length) return status('Enter at least one ticket.');
    try {
      for (let i = 0; i < rows.length; i++) {
        status(`Filling ${i + 1}/${rows.length}: ${rows[i].id}`);
        await send(tab.id, 'fill-ticket', rows[i]);
        await new Promise((r) => setTimeout(r, 300));
        await send(tab.id, 'save-ticket');
        await new Promise((r) => setTimeout(r, 1000));
      }
      status(`Done: ${rows.length} ticket(s).`);
    } catch (error) {
      status(`Stopped: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
});
