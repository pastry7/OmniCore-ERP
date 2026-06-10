/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IndustryType = 'retail' | 'service' | 'manufacturing' | 'general';

export interface BusinessProfile {
  name: string;
  industry: IndustryType;
  currency: string;             // e.g. '$', '€', '£', '¥'
  address: string;
  taxRate: number;              // default e.g. 15 for 15%
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  balance: number;              // positive means they owe us
  status: 'active' | 'inactive';
  segment: 'Enterprise' | 'SMB' | 'Key Account' | 'Wholesaler';
}

export type InventoryType = 'product' | 'service' | 'material';

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  stock: number;
  unit: string;                 // e.g. 'pcs', 'hrs', 'kg', 'box'
  buyPrice: number;             // cost price
  sellPrice: number;            // retail price
  reorderLevel: number;
  sku: string;
  location?: string;
  supplierId?: string;          // links to Supplier
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export type DealStage = 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface SalesDeal {
  id: string;
  title: string;
  customerId: string;
  value: number;
  stage: DealStage;
  closeDate: string;
  notes?: string;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;        // e.g. INV-2026-0001
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
}

export interface PurchaseOrderLine {
  itemId: string;
  name: string;
  qty: number;
  costPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;             // e.g. PO-2026-0001
  supplierId: string;
  date: string;
  items: PurchaseOrderLine[];
  total: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
}

export interface LedgerTransaction {
  id: string;
  date: string;
  description: string;
  category: 'Revenue' | 'COGS' | 'Operating_Expense' | 'Salaries' | 'Tax' | 'Equity' | 'Other';
  type: 'debit' | 'credit';     // debit increases asset/expense, credit increases liability/revenue/equity
  amount: number;
  referenceId?: string;         // links to invoice or purchase order
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: 'Sales' | 'Engineering' | 'Operations' | 'Finance' | 'HR' | 'Executive';
  salary: number;
  hireDate: string;
  status: 'Active' | 'OnLeave' | 'Terminated';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Sick' | 'Annual' | 'Maternity/Paternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Complete ERP Database represented in state
export interface ERPDatabase {
  profile: BusinessProfile;
  customers: Customer[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  deals: SalesDeal[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  ledger: LedgerTransaction[];
  employees: Employee[];
  leaves: LeaveRequest[];
}
