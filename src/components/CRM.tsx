/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Briefcase, 
  Layers, 
  UserPlus, 
  DollarSign, 
  User, 
  ChevronRight, 
  TrendingUp,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ERPDatabase, Customer, SalesDeal, DealStage } from '../types';

interface CRMProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
}

export function CRM({ erpData, updateData }: CRMProps) {
  const currency = erpData.profile.currency;
  
  // Search and Filter States
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  
  // Create Customer Form States
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCust, setNewCust] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    segment: 'SMB' as Customer['segment']
  });

  // Create Deal Form States
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    customerId: '',
    value: 0,
    stage: 'Lead' as DealStage,
    closeDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Selected Deal Detail Modal State
  const [selectedDeal, setSelectedDeal] = useState<SalesDeal | null>(null);

  // Customer Management
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name) return;

    const added: Customer = {
      id: `cust-${Date.now()}`,
      name: newCust.name,
      company: newCust.company || 'Individual',
      email: newCust.email || 'N/A',
      phone: newCust.phone || 'N/A',
      address: newCust.address || 'N/A',
      balance: 0,
      status: 'active',
      segment: newCust.segment
    };

    updateData({
      customers: [...erpData.customers, added]
    });

    setNewCust({ name: '', company: '', email: '', phone: '', address: '', segment: 'SMB' });
    setShowAddCustomer(false);
  };

  const handleDeleteCustomer = (id: string) => {
    updateData({
      customers: erpData.customers.filter(c => c.id !== id),
      // Also cleanup associated deals
      deals: erpData.deals.filter(d => d.customerId !== id)
    });
  };

  // Deal Management
  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title || !newDeal.customerId) return;

    const added: SalesDeal = {
      id: `deal-${Date.now()}`,
      title: newDeal.title,
      customerId: newDeal.customerId,
      value: Number(newDeal.value) || 0,
      stage: newDeal.stage,
      closeDate: newDeal.closeDate,
      notes: newDeal.notes
    };

    updateData({
      deals: [...erpData.deals, added]
    });

    setNewDeal({
      title: '',
      customerId: '',
      value: 0,
      stage: 'Lead',
      closeDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddDeal(false);
  };

  const handleUpdateDealStage = (dealId: string, nextStage: DealStage) => {
    const updated = erpData.deals.map(d => {
      if (d.id === dealId) {
        return { ...d, stage: nextStage };
      }
      return d;
    });
    
    // If a deal becomes 'Won', we could trigger dynamic revenue flows or keep it as pipeline status
    updateData({ deals: updated });
    
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal({ ...selectedDeal, stage: nextStage });
    }
  };

  const handleDeleteDeal = (id: string) => {
    updateData({
      deals: erpData.deals.filter(d => d.id !== id)
    });
    setSelectedDeal(null);
  };

  // Filters
  const filteredCustomers = erpData.customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                          c.company.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesSegment = selectedSegment === 'All' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  // Kanban Pipeline Stages
  const STAGES: DealStage[] = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  return (
    <div id="erp-crm" className="space-y-8 font-sans">
      
      {/* Top action grid */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">CRM & Enterprise Opportunities</h2>
          <p className="text-xs text-slate-500 mt-1">Track pipeline client segments, record outstanding invoices, and manage client communication.</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <button 
            onClick={() => setShowAddCustomer(!showAddCustomer)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-3xs rounded-lg transition shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-500" />
            <span>Add Customer</span>
          </button>
          
          <button 
            onClick={() => setShowAddDeal(!showAddDeal)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Sales Deal</span>
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADD CUSTOMER FORM */}
        {showAddCustomer && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm transition space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-100/50 pb-2">
              <UserPlus className="w-4 h-4 text-indigo-600" /> Enroll New Enterprise Client
            </h3>
            <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Company / Representative Name *</label>
                <input 
                  type="text" 
                  required
                  value={newCust.name}
                  onChange={e => setNewCust({...newCust, name: e.target.value})}
                  placeholder="e.g. Acme Corp" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Sub Trade / Company Category</label>
                <input 
                  type="text" 
                  value={newCust.company}
                  onChange={e => setNewCust({...newCust, company: e.target.value})}
                  placeholder="e.g. Technology" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Enterprise Segment</label>
                <select
                  value={newCust.segment}
                  onChange={e => setNewCust({...newCust, segment: e.target.value as Customer['segment']})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="SMB">SMB (Low scale)</option>
                  <option value="Enterprise">Enterprise (Large-scale)</option>
                  <option value="Key Account">Key Accounts</option>
                  <option value="Wholesaler">Bulk Wholesaler</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Business Email</label>
                <input 
                  type="email" 
                  value={newCust.email}
                  onChange={e => setNewCust({...newCust, email: e.target.value})}
                  placeholder="billing@acme.com" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Office Hotline</label>
                <input 
                  type="text" 
                  value={newCust.phone}
                  onChange={e => setNewCust({...newCust, phone: e.target.value})}
                  placeholder="555-0100" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">HQ Corporate Address</label>
                <input 
                  type="text" 
                  value={newCust.address}
                  onChange={e => setNewCust({...newCust, address: e.target.value})}
                  placeholder="Street 102, Building A" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2 pt-2 flex items-center gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddCustomer(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Confirm Registry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LAUNCH DEAL FORM */}
        {showAddDeal && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm transition space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-100/50 pb-2">
              <PlusCircle className="w-4 h-4 text-indigo-600" /> Initiate Deal Opportunity
            </h3>
            <form onSubmit={handleAddDeal} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Opportunity Nomenclature *</label>
                <input 
                  type="text" 
                  required
                  value={newDeal.title}
                  onChange={e => setNewDeal({...newDeal, title: e.target.value})}
                  placeholder="e.g. Q3 Core Piston Fleet Agreement" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Associate Account Representative *</label>
                <select
                  required
                  value={newDeal.customerId}
                  onChange={e => setNewDeal({...newDeal, customerId: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="">-- Choose registered customer --</option>
                  {erpData.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Contract Valuation ({currency})</label>
                <input 
                  type="number" 
                  value={newDeal.value}
                  onChange={e => setNewDeal({...newDeal, value: Number(e.target.value) || 0})}
                  placeholder="0" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Pipeline Entry Stage</label>
                <select
                  value={newDeal.stage}
                  onChange={e => setNewDeal({...newDeal, stage: e.target.value as DealStage})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="Lead">Lead Identification</option>
                  <option value="Contacted">First Outreach</option>
                  <option value="Proposal">Proposal Submitted</option>
                  <option value="Negotiation">Active Bargaining</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Closure Deadline</label>
                <input 
                  type="date" 
                  value={newDeal.closeDate}
                  onChange={e => setNewDeal({...newDeal, closeDate: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Internal Pipeline Notes</label>
                <input 
                  type="text" 
                  value={newDeal.notes}
                  onChange={e => setNewDeal({...newDeal, notes: e.target.value})}
                  placeholder="e.g. Needs competitive analysis docs..." 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2 pt-2 flex items-center gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddDeal(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Launch Opportunity
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* CRM Customer List and Filters */}
      <div id="crm-customer-hub" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        
        {/* Search header bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-500" /> Enrolled Accounts Registry
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{erpData.customers.length}</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search inputs */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Lookup name or sector..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            {/* Segment select */}
            <select
              value={selectedSegment}
              onChange={e => setSelectedSegment(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Segments</option>
              <option value="SMB">SMBs</option>
              <option value="Enterprise">Enterprises</option>
              <option value="Key Account">Key Accounts</option>
              <option value="Wholesaler">Wholesalers</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No customers match the current search filters.
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Sector / Role</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{c.company}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <p>{c.email}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={c.balance > 0 ? 'text-rose-600' : c.balance < 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {c.balance > 0 ? '+' : ''}{currency}{c.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] ${
                        c.segment === 'Enterprise' ? 'bg-indigo-50 text-indigo-600' :
                        c.segment === 'Key Account' ? 'bg-blue-50 text-blue-600' :
                        c.segment === 'Wholesaler' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kanban Board Opportunity Process Funnel */}
      <div id="crm-kanban-pipeline" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 text-base">Commercial Sales Pipeline</h3>
          </div>
          <p className="text-xs text-slate-500 font-sans">Quickly track and progress pending client deals through CRM pipelines by clicking on them.</p>
        </div>

        {/* Board grid lanes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const dealsInStage = erpData.deals.filter(d => d.stage === stage);
            const totalStageValue = dealsInStage.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage} className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3 flex flex-col h-96 min-w-[150px] space-y-3">
                
                {/* Lane Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">{stage}</h4>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">{currency}{totalStageValue.toLocaleString()}</p>
                  </div>
                  <span className="font-mono text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                    {dealsInStage.length}
                  </span>
                </div>

                {/* Lane Cards container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-none">
                  {dealsInStage.map(deal => {
                    const client = erpData.customers.find(c => c.id === deal.customerId);
                    return (
                      <div 
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition cursor-pointer space-y-2 group"
                      >
                        <h5 className="font-bold text-slate-800 text-[11px] leading-tight group-hover:text-indigo-600">{deal.title}</h5>
                        <p className="text-[10px] text-slate-500 leading-tight truncate">{client ? client.company : 'Direct Client'}</p>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                          <span className="font-mono font-bold text-slate-700">{currency}{deal.value.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400">{dialDateShortener(deal.closeDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dealsInStage.length === 0 && (
                    <div className="flex-1 h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 text-center p-3">
                      Lanes empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal modal details editor */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Update Deal Milestone</h4>
                <p className="text-[11px] text-slate-400">Opportunity ID: {selectedDeal.id}</p>
              </div>
              <button 
                onClick={() => setSelectedDeal(null)} 
                className="text-slate-400 hover:text-slate-600 transition font-mono font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1">Deal Name</p>
                <p className="text-sm font-bold text-slate-800">{selectedDeal.title}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5">Configure Milestone Stage</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {STAGES.map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateDealStage(selectedDeal.id, st)}
                      className={`py-1.5 border rounded font-semibold text-[10px] hover:bg-slate-50 transition cursor-pointer ${
                        selectedDeal.stage === st 
                          ? 'bg-indigo-600 hover:bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold m-0 z-10">Sales Estimate value</p>
                  <p className="text-sm font-bold text-slate-800">{currency}{selectedDeal.value.toLocaleString()}</p>
                </div>
                {selectedDeal.stage === 'Won' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : selectedDeal.stage === 'Lost' ? (
                  <XCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <Sliders className="w-5 h-5 text-indigo-500 animate-pulse" />
                )}
              </div>

              {selectedDeal.notes && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-500 text-[11px] leading-relaxed">
                  <strong>Pipeline Manager notes:</strong> {selectedDeal.notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-between border-t border-slate-100 pt-4 text-xs mt-3">
              <button
                onClick={() => handleDeleteDeal(selectedDeal.id)}
                className="inline-flex items-center gap-1 py-1.5 px-3 hover:bg-rose-50 text-rose-600 rounded font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Close Opportunity
              </button>
              
              <button
                onClick={() => setSelectedDeal(null)}
                className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold transition cursor-pointer"
              >
                Quit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Utility to beauty dates in cards
function dialDateShortener(dt: string): string {
  if (!dt) return 'N/A';
  try {
    const parts = dt.split('-');
    if (parts.length < 3) return dt;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[parseInt(parts[1], 10) - 1];
    return `${m} ${parts[2]}`;
  } catch {
    return dt;
  }
}
