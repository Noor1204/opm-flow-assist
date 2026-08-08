import type { ImportedTicket } from "./ticket-import";

export type TicketReviewStatus = "pending" | "approved" | "needs-review" | "failed" | "submitted";

export type TicketQueueItem = ImportedTicket & {
  status: TicketReviewStatus;
  error?: string;
};

export function createTicketQueue(tickets: ImportedTicket[]): TicketQueueItem[] {
  return tickets.map((ticket) => ({ ...ticket, status: "pending" }));
}

export function approveTicket(queue: TicketQueueItem[], ticketId: string) {
  return queue.map((ticket) => ticket.id === ticketId ? { ...ticket, status: "approved", error: undefined } : ticket);
}

export function approveAll(queue: TicketQueueItem[]) {
  return queue.map((ticket) => ticket.status === "pending" ? { ...ticket, status: "approved", error: undefined } : ticket);
}

export function markNeedsReview(queue: TicketQueueItem[], ticketId: string, error: string) {
  return queue.map((ticket) => ticket.id === ticketId ? { ...ticket, status: "needs-review", error } : ticket);
}

export function markSubmitted(queue: TicketQueueItem[], ticketId: string) {
  return queue.map((ticket) => ticket.id === ticketId ? { ...ticket, status: "submitted", error: undefined } : ticket);
}

export function markFailed(queue: TicketQueueItem[], ticketId: string, error: string) {
  return queue.map((ticket) => ticket.id === ticketId ? { ...ticket, status: "failed", error } : ticket);
}
