/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart4, 
  Calculator, 
  FileText, 
  Calendar,
  Layers,
  Inbox,
  Briefcase
} from 'lucide-react';
import { ERPDatabase, LedgerTransaction, BusinessProfile } from '../types';

interface AccountingProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
}

export function Accounting({ erpData, updateData }: AccountingProps) {
  const currency = erpData.profile.currency;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTx, setNewTx] = useState({
    description: '',
    category: 'Operating_Expense' as LedgerTransaction['category'],
    type: 'debit' as LedgerTransaction['type'],
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Calculate high-level financial parameters
  const credits = erpData.ledger.filter(tx => tx.type === 'credit');
  const debits = erpData.ledger.filter(tx => tx.type === 'debit');

  const grossRevenue = credits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalOutflows = debits.reduce((sum, tx) => sum + tx.amount, 0);
  const currentNetBalance = grossRevenue - totalOutflows;

  // Manual transaction addition
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || newTx.amount <= 0) return;

    const newlyCreated: LedgerTransaction = {
      id: `ldgr-${Date.now()}`,
      date: newTx.date,
      description: newTx.description,
      category: newTx.category,
      type: newTx.type,
      amount: Number(newTx.amount) || 0
    };

    updateData({
      ledger: [...erpData.ledger, newlyCreated]
    });

    setNewTx({
      description: '',
      category: 'Operating_Expense',
      type: 'debit',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddTransaction(false);
  };

  const handleRemoveTransaction = (id: string) => {
    updateData({
      ledger: erpData.ledger.filter(tx => tx.id !== id)
    });
  };

  // Filter ledger list
  const filteredLedger = erpData.ledger.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || tx.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Profit and Loss Aggregations
  const plRevenue = erpData.ledger
    .filter(tx => tx.category === 'Revenue')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const plCOGS = erpData.ledger
    .filter(tx => tx.category === 'COGS')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const grossMarginProfit = plRevenue - plCOGS;

  const plOpex = erpData.ledger
    .filter(tx => tx.category === 'Operating_Expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const plSalaries = erpData.ledger
    .filter(tx => tx.category === 'Salaries')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const earningsBeforeTax = grossMarginProfit - plOpex - plSalaries;
  
  const calculatedTaxRate = erpData.profile.taxRate / 100;
  const plTaxDeduction = earningsBeforeTax > 0 ? Math.round(earningsBeforeTax * calculatedTaxRate) : 0;
  
  const finalNetProfit = earningsBeforeTax - plTaxDeduction;

  return (
    <div id="erp-accounting" className="space-y-8 font-sans">
      
      {/* Title Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Finance & General Ledger Accounting</h2>
          <p className="text-xs text-slate-500 mt-1">Audit profit margins, track operating expenses against capital equity, and manage public ledger accounts.</p>
        </div>
        <div className="shrink-0">
          <button 
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Record Ledger Entry</span>
          </button>
        </div>
      </div>

      {/* Manual Transaction Input panel */}
      {showAddTransaction && (
        <div className="bg-slate-55 p-5 rounded-xl border border-indigo-150 shadow-sm bg-slate-50 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-100 pb-2">
            📊 Book Transaction Ledger Record
          </h3>

          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Transaction description / Label *</label>
              <input 
                type="text" 
                required
                value={newTx.description}
                onChange={e => setNewTx({...newTx, description: e.target.value})}
                placeholder="e.g. Cleared AWS Server Monthly hosting fee" 
                className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Accounting Ledger Code</label>
              <select
                value={newTx.category}
                onChange={e => setNewTx({...newTx, category: e.target.value as LedgerTransaction['category']})}
                className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
              >
                <option value="Operating_Expense">Operating Expense (OPEX)</option>
                <option value="COGS">Cost of Goods Sold (COGS)</option>
                <option value="Revenue">Sales Revenues (Inflow)</option>
                <option value="Salaries">Staff Payroll Overhead</option>
                <option value="Equity">Owner's Equity Capital</option>
                <option value="Tax">Public Tax Fees</option>
                <option value="Other">Other Adjustment / Outlays</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Transaction Date</label>
              <input 
                type="date" 
                value={newTx.date}
                onChange={e => setNewTx({...newTx, date: e.target.value})}
                className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Flow Type</label>
              <select
                value={newTx.type}
                onChange={e => setNewTx({...newTx, type: e.target.value as LedgerTransaction['type']})}
                className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 font-bold focus:border-indigo-500"
              >
                <option value="debit">DEBIT (Cash Outlay / Expens)</option>
                <option value="credit">CREDIT (Cash Inflow / Return)</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-slate-600 font-medium mb-1">Amount ({currency})</label>
              <input 
                type="number" 
                required
                min="0.1"
                step="any"
                value={newTx.amount}
                onChange={e => setNewTx({...newTx, amount: Number(e.target.value) || 0})}
                placeholder="0" 
                className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 font-mono font-bold text-slate-805"
              />
            </div>

            <div className="sm:col-span-2 pt-5 flex items-center justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddTransaction(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Corporate Profit & Loss Statement (P&L) */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Corporate Profit & Loss (P&L) Statement</h3>
              <p className="text-[11px] text-slate-400">Live fiscal statement compiled dynamically from accounting journals</p>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded">
            Baseline Tax: {erpData.profile.taxRate}%
          </span>
        </div>

        {/* P&L statement sheet structure */}
        <div className="space-y-4 text-xs font-mono max-w-2xl">
          
          {/* Row Sales */}
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-300 font-semibold uppercase tracking-wider">Gross Sales General Revenue</span>
            <span className="text-emerald-400 font-bold text-sm">+ {currency}{plRevenue.toLocaleString()}</span>
          </div>

          {/* Cost Of Goods sold (COGS) */}
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-300">Cost of Goods Sold (COGS) Raw logistics</span>
            <span className="text-rose-400 font-bold">- {currency}{plCOGS.toLocaleString()}</span>
          </div>

          {/* GROSS PROFIT */}
          <div className="flex justify-between border-b border-slate-800/80 pb-2 bg-slate-950/20 px-2 py-1 rounded">
            <span className="text-slate-100 font-bold uppercase tracking-wider">Computed Gross Profit Margin</span>
            <span className={`font-bold text-sm ${grossMarginProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currency}{grossMarginProfit.toLocaleString()}
            </span>
          </div>

          {/* Operational OPEX expenses */}
          <div className="flex justify-between border-b border-slate-800 pb-2 pl-4">
            <span className="text-slate-400">Operating Expenses & Server Costs (OPEX)</span>
            <span className="text-rose-400 font-bold">- {currency}{plOpex.toLocaleString()}</span>
          </div>

          {/* Personal Salaries Payroll */}
          <div className="flex justify-between border-b border-slate-800 pb-2 pl-4">
            <span className="text-slate-400">Corporate Staff Remuneration Payroll</span>
            <span className="text-rose-400 font-bold">- {currency}{plSalaries.toLocaleString()}</span>
          </div>

          {/* PBT (Profit Before Tax) */}
          <div className="flex justify-between border-b border-slate-800/80 pb-2 bg-slate-950/20 px-2 py-1 rounded">
            <span className="text-slate-100 font-semibold">Earnings Before Tax (EBT Ratio)</span>
            <span className={`font-bold ${earningsBeforeTax >= 0 ? 'text-slate-200' : 'text-rose-400'}`}>
              {currency}{earningsBeforeTax.toLocaleString()}
            </span>
          </div>

          {/* Tax outlays */}
          <div className="flex justify-between border-b border-slate-800 pb-2 pl-4">
            <span className="text-slate-400">Estimated Municipal Tax reserves ({erpData.profile.taxRate}%)</span>
            <span className="text-rose-400 font-bold">- {currency}{plTaxDeduction.toLocaleString()}</span>
          </div>

          {/* GRAND FINAL NET PROFIT */}
          <div className="flex justify-between border-b border-slate-750 pb-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-white font-bold uppercase tracking-widest text-sm">Consolidated Net Profit</span>
            <span className={`font-bold text-lg ${finalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {finalNetProfit < 0 ? '-' : ''}{currency}{Math.abs(finalNetProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Accounting transaction ledger logs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-500" /> General Accounting Audit Trail
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{filteredLedger.length}</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="    Search description/ledger..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            {/* Account code selector */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Categories (Ledger)</option>
              <option value="Revenue">Sales revenues</option>
              <option value="COGS">COGS logistics</option>
              <option value="Operating_Expense">Operating costs</option>
              <option value="Salaries">Payroll costs</option>
              <option value="Equity">Founder Capital</option>
              <option value="Tax">Government Tax</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        {filteredLedger.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No logged transitions found match search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Transaction Code (ID)</th>
                  <th className="py-3 px-4">Booking Date</th>
                  <th className="py-3 px-4">Description Name</th>
                  <th className="py-3 px-4">Ledger Code</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{tx.id}</td>
                    <td className="py-3.5 px-4 text-slate-650 font-sans">{tx.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[9px] bg-slate-100 text-slate-700 capitalize font-mono">
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${
                        tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-rose-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRemoveTransaction(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
