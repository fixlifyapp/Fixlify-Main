
import { Payment } from "@/types/payment";

export const payments: Payment[] = [
  {
    id: "1",
    date: new Date("2025-05-15T14:30:00").toISOString(),
    clientId: "c101",
    clientName: "John Anderson",
    jobId: "j785",
    amount: 249.99,
    method: "credit-card",
    status: "paid",
    reference: "txn_1234567890",
    technicianId: "3",
    technicianName: "Michael Chen"
  },
  {
    id: "2",
    date: new Date("2025-05-14T10:15:00").toISOString(),
    clientId: "c102",
    clientName: "Sarah Williams",
    jobId: "j784",
    amount: 125.50,
    method: "e-transfer",
    status: "paid",
    reference: "etr_8765432109"
  },
  {
    id: "3",
    date: new Date("2025-05-13T16:45:00").toISOString(),
    clientId: "c103",
    clientName: "Robert Johnson",
    jobId: "j782",
    amount: 350.00,
    method: "cash",
    status: "paid",
    technicianId: "4",
    technicianName: "Emily Rodriguez"
  },
  {
    id: "4",
    date: new Date("2025-05-12T09:30:00").toISOString(),
    clientId: "c104",
    clientName: "Jennifer Brown",
    jobId: "j780",
    amount: 199.99,
    method: "credit-card",
    status: "refunded",
    reference: "txn_2468135790",
    notes: "Customer dissatisfied with service",
    technicianId: "3",
    technicianName: "Michael Chen"
  },
  {
    id: "5",
    date: new Date("2025-05-11T13:20:00").toISOString(),
    clientId: "c105",
    clientName: "Michael Davis",
    jobId: "j779",
    amount: 89.95,
    method: "credit-card",
    status: "disputed",
    reference: "txn_1357924680",
    notes: "Customer claims service was not performed",
    technicianId: "5",
    technicianName: "David Kim"
  },
  {
    id: "6",
    date: new Date("2025-05-10T15:10:00").toISOString(),
    clientId: "c106",
    clientName: "Lisa Wilson",
    jobId: "j778",
    amount: 275.00,
    method: "cheque",
    status: "paid",
    reference: "chk_1029384756"
  },
  {
    id: "7",
    date: new Date("2025-05-09T11:05:00").toISOString(),
    clientId: "c107",
    clientName: "Daniel Martin",
    jobId: "j777",
    amount: 150.25,
    method: "cash",
    status: "paid",
    technicianId: "2",
    technicianName: "Sarah Johnson"
  }
];
