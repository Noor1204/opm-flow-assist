const $ = (id) => document.getElementById(id);
const status = (text) => { $('status').textContent = text; };

async function send(tabId, action, ticket) {
  const response = await chrome.tabs.sendMessage(tabId, { source: 'opm-flow-assist', action, ticket });
  if (!response?.ok) throw new Error(response?.error || 'No response from OPM page.');
  return response.result;
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  $('start').addEventListener('click', async () => {
    if (!tab?.id) return;
    const rows = $('tickets').value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const [id, hours] = line.split('|').map(v => v.trim());
      return { id, taskText: id, hours, projectValue: '417', taskTypeValue: 'M', taskCategoryValue: '22' };
    });
    if (!rows.length) return status('Enter at least one ticket.');
    try {
      for (let i = 0; i < rows.length; i++) {
        status(`Filling ${i + 1}/${rows.length}: ${rows[i].id}`);
        await send(tab.id, 'fill-ticket', rows[i]);
        await new Promise(r => setTimeout(r, 500));
        await send(tab.id, 'save-ticket');
        await new Promise(r => setTimeout(r, 1200));
      }
      status(`Done: ${rows.length} ticket(s).`);
    } catch (error) {
      status(`Stopped: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
});
