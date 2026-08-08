import { useState, type ChangeEvent } from "react";
import { parseTicketCsv, parseTicketJson, type ImportedTicket } from "@/lib/ticket-import";
import { approveAll, approveTicket, createTicketQueue, type TicketQueueItem } from "@/lib/ticket-queue";

export function TicketImportPanel() {
  const [queue, setQueue] = useState<TicketQueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = (tickets: ImportedTicket[]) => {
    setQueue(createTicketQueue(tickets));
    setError(null);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const tickets = file.name.toLowerCase().endsWith(".json")
        ? parseTicketJson(text)
        : parseTicketCsv(text);
      loadTickets(tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import tickets.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Bulk Ticket Import</h2>
          <p className="text-sm text-muted-foreground">Import CSV or JSON, review the queue, then approve tickets for one-by-one OPM automation.</p>
        </div>
        <label className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
          Import tickets
          <input className="sr-only" type="file" accept=".csv,.json,application/json,text/csv" onChange={handleFile} />
        </label>
      </div>

      {error && <div className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</div>}

      {queue.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>{queue.length} tickets loaded</span>
            <button type="button" className="rounded-md bg-primary px-3 py-2 text-primary-foreground" onClick={() => setQueue((current) => approveAll(current))}>
              Approve All
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left"><tr><th className="p-3">Ticket</th><th className="p-3">Title</th><th className="p-3">Hours</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
              <tbody>
                {queue.map((ticket) => (
                  <tr key={ticket.id} className="border-t">
                    <td className="p-3 font-medium">{ticket.id}</td>
                    <td className="max-w-md p-3">{ticket.title}</td>
                    <td className="p-3">{ticket.hours ?? "—"}</td>
                    <td className="p-3">{ticket.status}</td>
                    <td className="p-3"><button type="button" disabled={ticket.status !== "pending"} className="rounded-md border px-3 py-1.5 disabled:opacity-50" onClick={() => setQueue((current) => approveTicket(current, ticket.id))}>Approve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
