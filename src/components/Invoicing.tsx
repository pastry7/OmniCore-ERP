/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Printer, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  Undo2,
  Calendar,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';
import { ERPDatabase, Invoice, InvoiceItem, Customer, LedgerTransaction } from '../types';

interface InvoicingProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
}

export function Invoicing({ erpData, updateData }: InvoicingProps) {
  const currency = erpData.profile.currency;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Invoice Form Creation Mode States
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    discount: 0,
    notes: ''
  });

  // Current items being added to the new invoice
  const [invoiceLines, setInvoiceLines] = useState<InvoiceItem[]>([]);
  const [selectedLineItem, setSelectedLineItem] = useState({
    itemId: '',
    qty: 1
  });

  // Selected Invoice for Mock Print View Modal
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // Line item addition to form
  const handleAddLine = () => {
    if (!selectedLineItem.itemId) return;
    const catalogItem = erpData.inventory.find(i => i.id === selectedLineItem.itemId);
    if (!catalogItem) return;

    // Check if item already exists in current lines
    const exists = invoiceLines.find(l => l.itemId === selectedLineItem.itemId);
    if (exists) {
      setInvoiceLines(invoiceLines.map(l => {
        if (l.itemId === selectedLineItem.itemId) {
          return { ...l, qty: l.qty + Number(selectedLineItem.qty) };
        }
        return l;
      }));
    } else {
      setInvoiceLines([...invoiceLines, {
        itemId: catalogItem.id,
        name: catalogItem.name,
        qty: Number(selectedLineItem.qty) || 1,
        unitPrice: catalogItem.sellPrice
      }]);
    }

    setSelectedLineItem({ itemId: '', qty: 1 });
  };

  const handleRemoveLine = (idx: number) => {
    setInvoiceLines(invoiceLines.filter((_, i) => i !== idx));
  };

  // Submit complete invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.customerId) return;
    if (invoiceLines.length === 0) {
      alert("Please add at least one billable line item first.");
      return;
    }

    const subtotal = invoiceLines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0);
    const afterDiscount = subtotal - (Number(newInvoice.discount) || 0);
    const taxAmount = afterDiscount * (erpData.profile.taxRate / 100);
    const totalAmount = Math.max(0, Math.round(afterDiscount + taxAmount));

    const invoiceId = `inv-rec-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(erpData.invoices.length + 1).padStart(4, '0')}`;

    const newlyCreated: Invoice = {
      id: invoiceId,
      invoiceNumber,
      customerId: newInvoice.customerId,
      date: newInvoice.date,
      dueDate: newInvoice.dueDate,
      items: invoiceLines,
      taxRate: erpData.profile.taxRate,
      discount: Number(newInvoice.discount) || 0,
      total: totalAmount,
      status: 'Sent', // Default to active Sent Invoice
      notes: newInvoice.notes
    };

    // Automatically increase customer balance if unpaid!
    const updatedCustomers = erpData.customers.map(c => {
      if (c.id === newInvoice.customerId) {
        return { ...c, balance: c.balance + totalAmount };
      }
      return c;
    });

    updateData({
      invoices: [...erpData.invoices, newlyCreated],
      customers: updatedCustomers
    });

    // Reset forms
    setInvoiceLines([]);
    setNewInvoice({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      discount: 0,
      notes: ''
    });
    setShowCreateInvoice(false);
  };

  // Mark invoice as PAID with instant general accounting Ledger entry and customer balance clearing!
  const handleMarkPaid = (inv: Invoice) => {
    const nextInvoices = erpData.invoices.map(i => {
      if (i.id === inv.id) {
        return { ...i, status: 'Paid' as const };
      }
      return i;
    });

    // Clear customer balance
    const nextCustomers = erpData.customers.map(c => {
      if (c.id === inv.customerId) {
        return { ...c, balance: Math.max(0, c.balance - inv.total) };
      }
      return c;
    });

    // Create Credit (Inflow) Ledger transaction!
    const transaction: LedgerTransaction = {
      id: `ldgr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Payment received: Invoiced Contract ${inv.invoiceNumber}`,
      category: 'Revenue',
      type: 'credit',
      amount: inv.total,
      referenceId: inv.id
    };

    // Decrease Inventory product quantities recursively if it was a product or manufacturing element!
    let nextInventory = [...erpData.inventory];
    inv.items.forEach(itm => {
      nextInventory = nextInventory.map(existing => {
        if (existing.id === itm.itemId && existing.type !== 'service') {
          return { ...existing, stock: Math.max(0, existing.stock - itm.qty) };
        }
        return existing;
      });
    });

    updateData({
      invoices: nextInvoices,
      customers: nextCustomers,
      ledger: [...erpData.ledger, transaction],
      inventory: nextInventory
    });

    // If print modal is open, sync details
    if (printInvoice && printInvoice.id === inv.id) {
      setPrintInvoice({ ...printInvoice, status: 'Paid' });
    }
  };

  const handleDeleteInvoice = (id: string) => {
    const targeted = erpData.invoices.find(i => i.id === id);
    if (!targeted) return;

    // Decrease client balance since invoice is deleted
    const clearedCust = erpData.customers.map(c => {
      if (c.id === targeted.customerId && targeted.status !== 'Paid') {
        return { ...c, balance: Math.max(0, c.balance - targeted.total) };
      }
      return c;
    });

    updateData({
      invoices: erpData.invoices.filter(i => i.id !== id),
      customers: clearedCust
    });
  };

  // Filter invoices
  const filteredInvoices = erpData.invoices.filter(i => {
    const customer = erpData.customers.find(c => c.id === i.customerId);
    const customerName = customer ? customer.name.toLowerCase() : '';
    const companyName = customer ? customer.company.toLowerCase() : '';
    
    const matchesSearch = i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customerName.includes(searchQuery.toLowerCase()) ||
                          companyName.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || i.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="erp-invoicing" className="space-y-8 font-sans">
      
      {/* Title Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Invoicing hub & Client Billing</h2>
          <p className="text-xs text-slate-500 mt-1">Issue printable contracts, manage client outstanding balances, and auto-sync received payments to General accounts Ledger.</p>
        </div>
        <div className="shrink-0">
          <button 
            onClick={() => setShowCreateInvoice(!showCreateInvoice)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Client Invoice</span>
          </button>
        </div>
      </div>

      {/* Dynamic Billing creator layout */}
      {showCreateInvoice && (
        <div className="bg-slate-50 p-6 rounded-xl border border-indigo-150 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-100/60 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600" /> Professional Billing Architect
          </h3>

          <form onSubmit={handleSaveInvoice} className="space-y-6 text-xs">
            {/* Row 1: Client Selection and Date selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Target Billable Customer *</label>
                <select
                  required
                  value={newInvoice.customerId}
                  onChange={e => setNewInvoice({...newInvoice, customerId: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 text-sm outline-none text-slate-800 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose client account --</option>
                  {erpData.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company}) — Balance: {currency}{c.balance}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Issue Date</label>
                <input 
                  type="date"
                  value={newInvoice.date}
                  onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 text-sm focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Due Date</label>
                <input 
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 text-sm focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Row 2: Add Line item list panel */}
            <div className="bg-white p-4 rounded-lg border border-slate-200/85 space-y-4 shadow-3xs">
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Line Item Selector</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-slate-500 text-[10px] mb-1">Catalog Item (SKU Rate)</label>
                  <select
                    value={selectedLineItem.itemId}
                    onChange={e => setSelectedLineItem({...selectedLineItem, itemId: e.target.value})}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Pick inventory product/service --</option>
                    {erpData.inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (SKU: {i.sku} — Rate: {currency}{i.sellPrice} / {i.unit}) — Stock: {i.stock}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-24">
                  <label className="block text-slate-500 text-[10px] mb-1">Units (Billed Qty)</label>
                  <input 
                    type="number"
                    min="1"
                    value={selectedLineItem.qty}
                    onChange={e => setSelectedLineItem({...selectedLineItem, qty: Number(e.target.value) || 1})}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none text-slate-800 text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddLine}
                  className="w-full sm:w-auto px-4 py-2 mt-5 font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition cursor-pointer"
                >
                  Apply Line
                </button>
              </div>

              {/* Current lines representation */}
              {invoiceLines.length > 0 ? (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-sans">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-500 font-mono text-[9px] uppercase">
                        <th className="py-2">Billed SKU Segment</th>
                        <th className="py-2 text-center">Unit Price</th>
                        <th className="py-2 text-center">Quantity</th>
                        <th className="py-2 text-right">Sum Sub total</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceLines.map((line, index) => (
                        <tr key={index} className="text-slate-700">
                          <td className="py-2.5 font-bold text-slate-800">{line.name}</td>
                          <td className="py-2.5 text-center font-mono">{currency}{line.unitPrice.toLocaleString()}</td>
                          <td className="py-2.5 text-center font-mono">{line.qty}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-900">{currency}{(line.qty * line.unitPrice).toLocaleString()}</td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              className="text-rose-500 hover:text-rose-700 font-mono text-[11px] cursor-pointer"
                            >
                              Drop
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-slate-405 italic">Select billing items above to add invoice lines.</p>
              )}
            </div>

            {/* Calculations and Summary parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Contract Notes / Payment Terms</label>
                <textarea 
                  value={newInvoice.notes}
                  onChange={e => setNewInvoice({...newInvoice, notes: e.target.value})}
                  placeholder="Payment within net 30 days via bank wire transfer details..."
                  className="w-full p-2.5 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 h-24"
                ></textarea>
              </div>

              {/* Aggregates calculations */}
              <div className="bg-slate-100 p-4 rounded-lg space-y-2 border border-slate-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Row Subtotal:</span>
                  <span className="font-bold text-slate-800">
                    {currency}{invoiceLines.reduce((sum, l) => sum + (l.qty * l.unitPrice), 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Contract Discount:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 font-bold">- {currency}</span>
                    <input 
                      type="number"
                      value={newInvoice.discount}
                      onChange={e => setNewInvoice({...newInvoice, discount: Number(e.target.value) || 0})}
                      className="w-16 p-1 text-right bg-white rounded border border-slate-200 font-sans outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">State Standard Tax ({erpData.profile.taxRate}%):</span>
                  <span className="font-bold text-slate-800">
                    {currency}{Math.round((invoiceLines.reduce((sum, l) => sum + (l.qty * l.unitPrice), 0) - (Number(newInvoice.discount) || 0)) * (erpData.profile.taxRate / 100)).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900 leading-none">
                  <span>Gross Invoice Total:</span>
                  <span className="text-indigo-700">
                    {currency}{
                      Math.max(0, Math.round(
                        (invoiceLines.reduce((sum, l) => sum + (l.qty * l.unitPrice), 0) - (Number(newInvoice.discount) || 0)) * (1 + erpData.profile.taxRate / 100)
                      )).toLocaleString()
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setInvoiceLines([]);
                  setShowCreateInvoice(false);
                }}
                className="px-4 py-2 font-semibold bg-slate-200 rounded text-slate-700 hover:bg-slate-300 transition cursor-pointer"
              >
                Quit Creator
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 font-semibold bg-indigo-600 rounded text-white hover:bg-indigo-500 shadow transition cursor-pointer"
              >
                Dispatch Sent Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice filter search and list logs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-500" /> Distributed General Billing Archive
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{erpData.invoices.length}</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="INV Number or Client..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            {/* Status Selector */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Marked Paid</option>
              <option value="Sent">Sent (Unpaid)</option>
              <option value="Overdue">Overdue contracts</option>
              <option value="Draft">Draft status</option>
            </select>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No processed invoices found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Invoice Ledger Reference</th>
                  <th className="py-3 px-4">Debited Client</th>
                  <th className="py-3 px-4">Issue Details</th>
                  <th className="py-3 px-4">Gross Due Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Inflow Clearance</th>
                  <th className="py-3 px-4 text-right">Receipt Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const client = erpData.customers.find(c => c.id === inv.customerId);
                  const isOverdue = inv.status !== 'Paid' && new Date(inv.dueDate) < new Date();
                  
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" /> {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{client ? client.name : 'Unassigned Walk-in'}</p>
                        <p className="test-[10px] text-slate-400">{client ? client.company : 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <p>Issued: {inv.date}</p>
                        <p className={`text-[10px] ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>Due: {inv.dueDate}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {currency}{inv.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[9px] ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                          isOverdue ? 'bg-rose-50 text-rose-600 animate-pulse' :
                          inv.status === 'Sent' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isOverdue ? 'Overdue!' : inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 rounded transition cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Cleared
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-center">
                            ✅ Paid Inflow Accounted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPrintInvoice(inv)}
                            className="p-1 px-2 text-[10px] font-semibold bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" /> View Printable
                          </button>
                          
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded transition cursor-pointer font-bold"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable template view modal popup */}
      {printInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-8 space-y-6 font-sans">
            
            {/* Action panel top */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="font-bold text-slate-800 text-xs">COMMERCIAL CONTRACT RECEIPT</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition cursor-pointer shadow-3xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Output Printer
                </button>
                <button
                  onClick={() => setPrintInvoice(null)}
                  className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>

            {/* Print Area layout */}
            <div className="space-y-6 p-4 border border-slate-150 rounded-lg">
              
              {/* Header: Company and invoice number */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-950 uppercase">{erpData.profile.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">HQ Context: {erpData.profile.address}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Mail: {erpData.profile.email} | Tel: {erpData.profile.phone}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-mono font-bold text-indigo-700">{printInvoice.invoiceNumber}</h3>
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{printInvoice.status}</p>
                </div>
              </div>

              {/* Bill To / Details metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y border-slate-100 py-4">
                <div>
                  <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">CONTRACT ISSUED TO</p>
                  <h5 className="font-bold text-slate-800">
                    {erpData.customers.find(c => c.id === printInvoice.customerId)?.name || 'Walk-In Customer'}
                  </h5>
                  <p className="text-slate-500">
                    {erpData.customers.find(c => c.id === printInvoice.customerId)?.company || 'Individual Account'}
                  </p>
                  <p className="text-slate-400 truncate w-60">
                    {erpData.customers.find(c => c.id === printInvoice.customerId)?.address || 'N/AAddress'}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">DATE AND TERMS</p>
                  <p className="text-slate-700"><strong>Contract Date:</strong> {printInvoice.date}</p>
                  <p className="text-slate-700"><strong>Contract Due:</strong> {printInvoice.dueDate}</p>
                  <p className="text-slate-700"><strong>Tax baseline limit:</strong> {printInvoice.taxRate}% Area standard</p>
                </div>
              </div>

              {/* Ledger Items specifications */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono font-bold text-[9px] uppercase">
                    <th className="py-2.5">SKU Specification</th>
                    <th className="py-2.5 text-center">Unit Price Price</th>
                    <th className="py-2.5 text-center">Billed Quantity</th>
                    <th className="py-2.5 text-right">Sum total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printInvoice.items.map((it, i) => (
                    <tr key={i} className="text-slate-700">
                      <td className="py-2.5 font-bold text-slate-800">{it.name}</td>
                      <td className="py-2.5 text-center font-mono">{currency}{it.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 text-center font-mono">{it.qty}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {currency}{(it.qty * it.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal calculation blocks */}
              <div className="border-t border-slate-200 pt-4 flex justify-end text-xs font-mono">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Gross Subtotal:</span>
                    <span className="font-bold text-slate-800">
                      {currency}{printInvoice.items.reduce((s, x) => s + (x.qty * x.unitPrice), 0).toLocaleString()}
                    </span>
                  </div>
                  {printInvoice.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span className="font-sans">Discount Deduct:</span>
                      <span className="font-bold">- {currency}{printInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Dynamic Tax ({printInvoice.taxRate}%):</span>
                    <span className="font-bold text-slate-800">
                      {currency}{Math.round((printInvoice.items.reduce((s, x) => s + (x.qty * x.unitPrice), 0) - printInvoice.discount) * (printInvoice.taxRate / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 leading-none">
                    <span className="font-sans text-indigo-700 uppercase">Grand Net Total:</span>
                    <span className="text-indigo-700">{currency}{printInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footnotes */}
              {printInvoice.notes && (
                <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 italic">
                  <strong>Notes & Terms:</strong> {printInvoice.notes}
                </div>
              )}
            </div>

            {/* Clear button if Unpaid */}
            {printInvoice.status !== 'Paid' && (
              <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200/80 flex items-center justify-between text-xs font-sans">
                <span className="text-amber-800">This invoice represents an active account outstanding due of <strong>{currency}{printInvoice.total.toLocaleString()}</strong>.</span>
                <button
                  onClick={() => handleMarkPaid(printInvoice)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition shadow cursor-pointer"
                >
                  Clear Outstanding
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
