/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Building2, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  Sparkles
} from 'lucide-react';
import { ERPDatabase, BusinessProfile, IndustryType } from '../types';
import { generateSampleData, INDUSTY_PRESETS } from '../initialData';

interface SettingsProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
  resetDatabaseWithIndustry: (industry: IndustryType) => void;
}

export function Settings({ erpData, updateData, resetDatabaseWithIndustry }: SettingsProps) {
  const [profile, setProfile] = useState<BusinessProfile>({ ...erpData.profile });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ profile });
    
    setSuccessMsg('Corporate Business Profile updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Switch industries
  const handleIndustryChange = (ind: IndustryType) => {
    const doubleConfirm = window.confirm(`Reset ERP Database?\n\nThis will completely wipe current records and reload sample data optimized for ${ind.toUpperCase()} sector operations.`);
    if (doubleConfirm) {
      resetDatabaseWithIndustry(ind);
      setProfile({ ...INDUSTY_PRESETS[ind], industry: ind });
      
      setSuccessMsg(`Switched database to ${ind.toUpperCase()} template!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // EXPORT JSON DATABASE FILE
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(erpData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ERP_Backup_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // RESTORE DATABASE FROM JSON FILE
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.customers && parsed.inventory && parsed.ledger) {
          updateData(parsed);
          setProfile({ ...parsed.profile });
          
          alert("Database restored successfully from local JSON backup!");
        } else {
          alert("Format Error: Selected file is not a valid Universal Business ERP JSON backup.");
        }
      } catch (err) {
        alert("Failure parsing backup file. Ensure it is intact JSON format.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleWipeDatabase = () => {
    const wipeConfirm = window.confirm("CRITICAL WARNING:\n\nAre you sure you want to completely erase the entire active ERP dataset? This action is non-reversible.");
    if (wipeConfirm) {
      updateData({
        customers: [],
        inventory: [],
        suppliers: [],
        deals: [],
        invoices: [],
        purchaseOrders: [],
        ledger: [],
        employees: [],
        leaves: []
      });
      alert("Database wiped. Complete empty sandbox generated.");
    }
  };

  return (
    <div id="erp-settings" className="space-y-8 font-sans">
      
      {/* Title Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">System Settings & Data Portability</h2>
          <p className="text-xs text-slate-500 mt-1">Configure baseline taxes, load sector templates, download backups, or restore workspace databases.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROFILE EDITOR */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Building2 className="w-4.5 h-4.5 text-slate-500" /> Corporate Business Profile
          </h3>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Corporate Name *</label>
              <input 
                type="text" 
                required
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Sector Segment Type</label>
              <span className="block p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded font-mono uppercase font-bold select-none capitalize">
                {profile.industry} operations
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Functional Currency Symbol *</label>
              <input 
                type="text" 
                required
                value={profile.currency}
                onChange={e => setProfile({...profile, currency: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Baseline Standard Tax Rate (%) *</label>
              <input 
                type="number" 
                required
                value={profile.taxRate}
                onChange={e => setProfile({...profile, taxRate: Number(e.target.value) || 0})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Public Corporate Email</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1"> hotlines</label>
              <input 
                type="text" 
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">HQs Physical Address</label>
              <input 
                type="text" 
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div className="col-span-2 pt-2 flex justify-end">
              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold shadow-3xs cursor-pointer transition"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* INDUSTRIAL SECTORS SWAPPER */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500" /> Sector Configurator switcher
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            Choose a sector layout. Switching templates immediately clears current browser storage datasets and hydrates tables with sector-specific catalogs, client leads, invoices, and accounting totals.
          </p>

          <div className="space-y-2 text-xs font-sans">
            <button
              onClick={() => handleIndustryChange('retail')}
              className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                profile.industry === 'retail' 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold' 
                  : 'border-slate-150 hover:bg-slate-50 text-slate-705'
              }`}
            >
              <div>
                <p>🛒 Retail & e-Commerce Hub</p>
                <p className="text-[10px] text-slate-400 font-normal">Products catalogs, retail sales channels</p>
              </div>
              {profile.industry === 'retail' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => handleIndustryChange('service')}
              className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                profile.industry === 'service' 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold' 
                  : 'border-slate-150 hover:bg-slate-50 text-slate-705'
              }`}
            >
              <div>
                <p>💼 IT, Agencies & Service Providers</p>
                <p className="text-[10px] text-slate-400 font-normal">Timesheet-based hour services, high consult values</p>
              </div>
              {profile.industry === 'service' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => handleIndustryChange('manufacturing')}
              className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                profile.industry === 'manufacturing' 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold' 
                  : 'border-slate-150 hover:bg-slate-50 text-slate-705'
              }`}
            >
              <div>
                <p>🔧 Manufacturing & Wholesaling</p>
                <p className="text-[10px] text-slate-400 font-normal">Heavy raw material, wholesale contracts, parts safety</p>
              </div>
              {profile.industry === 'manufacturing' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => handleIndustryChange('general')}
              className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                profile.industry === 'general' 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold' 
                  : 'border-slate-150 hover:bg-slate-50 text-slate-705'
              }`}
            >
              <div>
                <p>🌐 Mixed General Enterprise</p>
                <p className="text-[10px] text-slate-400 font-normal">Standard corporate combination profiles</p>
              </div>
              {profile.industry === 'general' && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* PORTABILITY, BACKUPS AND RESTORE */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-5">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">ERP Database Backup Vault</h3>
          <p className="text-xs text-slate-500">Universal portability specifications. Save backup states locally or import backups compiled elsewhere.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Export JSON DB Backup
          </button>

          <input 
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportJSON}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-55 rounded-lg shadow-3xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-500" /> Upload / Restore DB 
          </button>

          <button
            onClick={handleWipeDatabase}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg transition ml-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Erase Sandboxes
          </button>
        </div>

        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-sans flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Portability Notice:</strong> This ERP adheres strictly to standard offline-first design protocols. Backup JSON schema exports are self-contained and universally supported, meaning they can be shared directly with colleagues, restored into another running instance of this exact software, or parsed into structured analytics spreadsheets. No SaaS subscription overhead required!
          </span>
        </div>
      </div>

    </div>
  );
}
