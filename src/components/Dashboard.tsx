/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  PlusCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { ERPDatabase } from '../types';

interface DashboardProps {
  erpData: ERPDatabase;
  setTab: (tab: string) => void;
  triggerDemoData: () => void;
}

export function Dashboard({ erpData, setTab, triggerDemoData }: DashboardProps) {
  // Aggregate stats
  const currency = erpData.profile.currency;
  
  // Financial Calculations
  const creditEntries = erpData.ledger.filter(e => e.type === 'credit');
  const debitEntries = erpData.ledger.filter(e => e.type === 'debit');

  const totalRevenue = creditEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = debitEntries.reduce((sum, e) => sum + e.amount, 0);
  const NetProfit = totalRevenue - totalExpenses;

  // Inventory stats
  const lowStockItems = erpData.inventory.filter(item => item.stock <= item.reorderLevel);
  const outOfStockItems = erpData.inventory.filter(item => item.stock === 0);

  // Active Deals Value
  const activeDealsValue = erpData.deals
    .filter(d => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + d.value, 0);

  const activeEmployees = erpData.employees.filter(e => e.status === 'Active').length;

  // Compile monthly revenues/expenses for chart (Dummy aggregate based on actual dates or sample ledger)
  // Let's bundle actual ledger categories for a neat breakdown bar chart
  const categoriesMap: { [key: string]: { debit: number; credit: number } } = {
    'Revenue': { debit: 0, credit: 0 },
    'COGS': { debit: 0, credit: 0 },
    'Operating_Expense': { debit: 0, credit: 0 },
    'Salaries': { debit: 0, credit: 0 },
  };

  erpData.ledger.forEach(entry => {
    const cat = entry.category;
    if (categoriesMap[cat] !== undefined) {
      if (entry.type === 'debit') categoriesMap[cat].debit += entry.amount;
      if (entry.type === 'credit') categoriesMap[cat].credit += entry.amount;
    } else {
      // generic mapping fallback
      const fallback = 'Operating_Expense';
      if (entry.type === 'debit') categoriesMap[fallback].debit += entry.amount;
      if (entry.type === 'credit') categoriesMap[fallback].credit += entry.amount;
    }
  });

  const chartData = [
    { name: 'Revenue Intake', Credit: totalRevenue, Debit: 0, color: 'bg-emerald-500' },
    { name: 'COGS', Credit: 0, Debit: categoriesMap['COGS'].debit, color: 'bg-amber-500' },
    { name: 'Operations', Credit: 0, Debit: categoriesMap['Operating_Expense'].debit, color: 'bg-blue-500' },
    { name: 'Staff Salaries', Credit: 0, Debit: categoriesMap['Salaries'].debit, color: 'bg-rose-500' },
  ];

  // Max value for scale in charts
  const maxVal = Math.max(totalRevenue, totalExpenses, 1000) * 1.15;

  return (
    <div id="erp-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome to {erpData.profile.name}
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Operational dashboard configured for <span className="font-semibold text-slate-800 capitalize">{erpData.profile.industry}</span> profile operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {erpData.customers.length === 0 && (
            <button
              onClick={triggerDemoData}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-sans transition grow sm:grow-0 cursor-pointer"
            >
              🚀 Hydrate All Demo Modules
            </button>
          )} Laoded: 100% Client-Side Sandbox
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">Gross Revenue</span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Inflow accounts</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">Debited Outflow</span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {currency}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1 text-xs text-rose-600 font-sans">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>COGS + OPEX + Payroll</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">Warehouse Status</span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {erpData.inventory.length} SKUs
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-600 font-sans">
              {lowStockItems.length > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 font-semibold">{lowStockItems.length} items low stock</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Perfect supply levels</span>
                </>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">Operational Margins</span>
            <h3 className={`text-2xl font-bold tracking-tight ${NetProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {NetProfit < 0 ? '-' : ''}{currency}{Math.abs(NetProfit).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Tax baseline {erpData.profile.taxRate}%</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Analytics Section row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Charts: Ledger Balance Allocations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Financial Allocation Matrix</h3>
              <p className="text-xs text-slate-500">Breakdown of gross corporate funds versus operation cost categories</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span> Income</span>
              <span className="flex items-center gap-1 text-rose-500"><span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span> Expenses</span>
            </div>
          </div>

          {/* Elegant purely responsive dynamic SVG rendering */}
          <div className="relative h-64 flex items-end justify-between px-4 pb-2 border-b border-slate-200 pt-4">
            {chartData.map((d, index) => {
              const debitHeight = totalExpenses > 0 ? (d.Debit / maxVal) * 100 : 0;
              const creditHeight = totalRevenue > 0 ? (d.Credit / maxVal) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className="flex gap-1.5 items-end h-44 w-full justify-center">
                    {/* Credit Bar */}
                    {d.Credit > 0 && (
                      <div 
                        style={{ height: `${Math.max(creditHeight, 3)}%` }}
                        className="w-8 sm:w-10 bg-emerald-500/90 rounded-t-sm hover:bg-emerald-400 transition-all relative flex justify-center group-hover:scale-105"
                      >
                        <div className="absolute -top-7 scale-0 group-hover:scale-100 transition px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono z-20 whitespace-nowrap shadow-md">
                          {currency}{d.Credit.toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Debit Bar */}
                    {d.Debit > 0 && (
                      <div 
                        style={{ height: `${Math.max(debitHeight, 3)}%` }}
                        className="w-8 sm:w-10 bg-rose-500/90 rounded-t-sm hover:bg-rose-400 transition-all relative flex justify-center group-hover:scale-105"
                      >
                        <div className="absolute -top-7 scale-0 group-hover:scale-100 transition px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono z-20 whitespace-nowrap shadow-md">
                          {currency}{d.Debit.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500 mt-2 font-medium tracking-tight truncate w-full text-center">{d.name}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/50">
            <span className="text-slate-600 font-sans flex items-center gap-1">
              🧬 Strategic balance calculation ratio: <strong>{totalExpenses > 0 ? (totalRevenue / totalExpenses).toFixed(1) : totalRevenue}x</strong> safe leverage coverage.
            </span>
            <button 
              onClick={() => setTab('Accounting')} 
              className="text-indigo-600 font-semibold hover:text-indigo-500 inline-flex items-center gap-1 transition cursor-pointer"
            >
              Analyze Records <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Side Panel: Urgent Stock & Process Actions */}
        <div id="quick-action-panels" className="space-y-6">
          {/* Quick Tasks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs">
            <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-3">Enterprise Shortcuts</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setTab('Invoicing')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition flex items-center justify-between text-xs font-sans group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Dispatch Client Invoice</p>
                    <p className="text-slate-400 text-[10px]">Create billable lines and track dues</p>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <button 
                onClick={() => setTab('CRM')}
                className="w-full text-left p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition flex items-center justify-between text-xs font-sans group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Enroll New Customer</p>
                    <p className="text-slate-400 text-[10px]">Store CRM details and sales funnels</p>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>
            </div>
          </div>

          {/* Supply Alerts threshold listing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-3xs">
            <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3 mb-3">Warehouse Stock Alerts</h3>
            {lowStockItems.length === 0 ? (
              <div className="py-4 text-center text-slate-400">
                <p className="text-xs">No active inventory warnings. All units exceed safety levels.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded border border-slate-150">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-slate-400 text-[10px] font-mono">SKU ID: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-500 font-mono text-sm">{item.stock}</span>
                      <span className="text-[10px] text-slate-400"> / {item.unit} left</span>
                      <p className="text-amber-600 text-[9px] font-semibold">Min safety: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <button 
                    onClick={() => setTab('Inventory')} 
                    className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline block text-center w-full font-semibold pt-1 cursor-pointer"
                  >
                    View +{lowStockItems.length - 3} low stock parts
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRM opportunities and Employee Overview logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipe value deals summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Interactive Deal Funnel Highlights</h4>
            <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
              Pipeline: {currency}{activeDealsValue.toLocaleString()}
            </span>
          </div>
          
          {erpData.deals.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No active pipeline deals found. Convert customers in Sales pipeline!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {erpData.deals.slice(0, 4).map((d) => {
                const customer = erpData.customers.find(c => c.id === d.customerId);
                return (
                  <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 hover:text-indigo-600 transition cursor-pointer" onClick={() => setTab('CRM')}>{d.title}</p>
                      <p className="text-[10px] text-slate-400">{customer?.company || 'Walk-In'} — Target: {d.closeDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold ${
                        d.stage === 'Won' ? 'bg-emerald-50 text-emerald-600' :
                        d.stage === 'Proposal' || d.stage === 'Negotiation' ? 'bg-blue-50 text-blue-600' :
                        d.stage === 'Contacted' ? 'bg-amber-50 text-amber-500' : 'bg-slate-150 text-slate-600'
                      }`}>
                        {d.stage}
                      </span>
                      <span className="font-mono font-bold text-slate-700">{currency}{d.value.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HR & Personnel Summary logs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Personnel Directory Status</h4>
            <span className="text-xs text-slate-500 font-sans">Active Staff: <strong>{activeEmployees}</strong></span>
          </div>
          <div className="divide-y divide-slate-100">
            {erpData.employees.slice(0, 4).map((emp) => {
              const pendingLeave = erpData.leaves.find(lv => lv.employeeId === emp.id && lv.status === 'Pending');
              return (
                <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-800">{emp.fullName}</h5>
                    <p className="text-[10px] text-slate-400">{emp.role} — <span className="font-mono">{emp.department}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    {pendingLeave ? (
                      <span className="px-2 py-0.5 rounded-full font-mono text-[9px] bg-amber-50 text-amber-600 font-semibold animate-pulse">
                        Requested Vacation
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] ${
                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {emp.status}
                      </span>
                    )}
                    <span className="font-mono text-slate-500 text-[11px]">{currency}{emp.salary.toLocaleString()}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
