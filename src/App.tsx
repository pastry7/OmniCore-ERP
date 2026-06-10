/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Calculator, 
  Contact, 
  Settings as SettingsIcon,
  Brain,
  Menu,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  Bell,
  HelpCircle,
  FileCheck
} from 'lucide-react';

import { ERPDatabase, IndustryType } from './types';
import { generateSampleData } from './initialData';

// Modular Component imports
import { Dashboard } from './components/Dashboard';
import { CRM } from './components/CRM';
import { Inventory } from './components/Inventory';
import { Invoicing } from './components/Invoicing';
import { Accounting } from './components/Accounting';
import { HRM } from './components/HRM';
import { Settings } from './components/Settings';
import { AIAssistant } from './components/AIAssistant';

const STORAGE_KEY = 'universal_erp_db_v1';

export default function App() {
  const [erpData, setErpData] = useState<ERPDatabase | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState<boolean>(true);
  const [dbStatusLabel, setDbStatusLabel] = useState<string>('Synced');

  // Load database from localStorage on mounts
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setErpData(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading saved database. Rebuilding values.", err);
        const fallback = generateSampleData('general');
        setErpData(fallback);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      }
    } else {
      // First boot, hydrate gorgeous standard template values
      const initial = generateSampleData('general');
      setErpData(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  // Update State and Storage
  const updateData = (updatedFields: Partial<ERPDatabase>) => {
    if (!erpData) return;
    setDbStatusLabel('Writing...');
    
    const nextState = {
      ...erpData,
      ...updatedFields
    };
    
    setErpData(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    
    setTimeout(() => setDbStatusLabel('Synced'), 500);
  };

  // Reset database with specific industry presets
  const resetDatabaseWithIndustry = (ind: IndustryType) => {
    setDbStatusLabel('Formatting...');
    const hydrated = generateSampleData(ind);
    setErpData(hydrated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
    setTimeout(() => setDbStatusLabel('Synced'), 500);
  };

  const triggerHydrateAll = () => {
    if (!erpData) return;
    resetDatabaseWithIndustry(erpData.profile.industry);
  };

  if (!erpData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 font-mono text-xs space-y-3">
        <Database className="w-8 h-8 text-indigo-400 animate-bounce" />
        <span>Instantiating Enterprise ERP Data Schema...</span>
      </div>
    );
  }

  // Sidebar components links list
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'CRM & Sales', icon: Users },
    { name: 'Inventory & Supply', icon: Package },
    { name: 'Invoicing & Billing', icon: FileText },
    { name: 'Accounting Ledger', icon: Calculator },
    { name: 'HR Management', icon: Contact },
    { name: 'Settings Portfolio', icon: SettingsIcon }
  ];

  const handleNavClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div id="erp-application-root" className="min-h-screen bg-slate-50 flex flex-row overflow-hidden font-sans select-none antialiased">
      
      {/* 1. LEFT SIDEBAR NAVIGATION RAILS */}
      <div 
        className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 shadow-lg shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1 px-2.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-sm tracking-tighter">
                E
              </div>
              {!sidebarCollapsed && (
                <div className="leading-none shrink-0 border-none transition">
                  <h1 className="font-bold text-xs tracking-tight text-white uppercase">Modular ERP</h1>
                  <span className="text-[9px] font-mono font-semibold tracking-widest text-indigo-400">UNRESTRICTED</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav List links */}
          <nav className="p-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name || (activeTab === 'CRM' && item.name.includes('CRM')) || (activeTab === 'Inventory' && item.name.includes('Inventory')) || (activeTab === 'Invoicing' && item.name.includes('Invoicing')) || (activeTab === 'Accounting' && item.name.includes('Accounting')) || (activeTab === 'HRM' && item.name.includes('HR')) || (activeTab === 'Settings' && item.name.includes('Settings'));

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition text-left cursor-pointer group relative ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-205'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                  
                  {/* Tooltips if collapsed */}
                  {sidebarCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 transition px-2 py-1 bg-slate-950 text-white rounded text-[10px] whitespace-nowrap font-sans shadow-md z-50">
                      {item.name}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer branding */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 font-mono text-[9px] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>DB Sandbox:</span>
            <span className={`font-semibold ${dbStatusLabel === 'Synced' ? 'text-emerald-500' : 'text-indigo-400'}`}>{dbStatusLabel}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="text-slate-600 text-center select-none pt-1">
              v1.4.0 — Open Source Lic.
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN HUB WORKSPACE LAYOUT (Middle Panel) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Main upper header parameters */}
        <header id="erp-upper-bar" className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shadow-3xs shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-indigo-600" />
            <h2 className="font-bold text-sm tracking-tight text-slate-800 uppercase font-sans">
              {erpData.profile.name} <span className="text-[10px] lowercase font-mono px-2 py-0.5 bg-indigo-50 border border-indigo-100/55 rounded-full font-bold text-indigo-700">{erpData.profile.industry} suite</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 rounded border px-2 py-1">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>LocalDB: {erpData.customers.length} Act. Clients | {erpData.inventory.length} Skus</span>
            </div>

            {/* AI Assistant drawer toggler button */}
            <button 
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition cursor-pointer ${
                aiSidebarOpen 
                  ? 'bg-indigo-600 text-white border-indigo-600 border-none' 
                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200 shadow-3xs'
              }`}
            >
              <Brain className={`w-4 h-4 ${aiSidebarOpen ? 'text-white' : 'text-indigo-600'}`} />
              <span>Consult AI Advisor</span>
            </button>
          </div>
        </header>

        {/* Tab components display scrollable canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'Dashboard' && (
            <Dashboard 
              erpData={erpData} 
              setTab={(t) => {
                // Handle sub links safely
                if (t === 'CRM') setActiveTab('CRM & Sales');
                else if (t === 'Inventory') setActiveTab('Inventory & Supply');
                else if (t === 'Invoicing') setActiveTab('Invoicing & Billing');
                else if (t === 'Accounting') setActiveTab('Accounting Ledger');
                else setActiveTab(t);
              }}
              triggerDemoData={triggerHydrateAll}
            />
          )}

          {(activeTab === 'CRM & Sales' || activeTab === 'CRM') && (
            <CRM erpData={erpData} updateData={updateData} />
          )}

          {(activeTab === 'Inventory & Supply' || activeTab === 'Inventory') && (
            <Inventory erpData={erpData} updateData={updateData} />
          )}

          {(activeTab === 'Invoicing & Billing' || activeTab === 'Invoicing') && (
            <Invoicing erpData={erpData} updateData={updateData} />
          )}

          {(activeTab === 'Accounting Ledger' || activeTab === 'Accounting') && (
            <Accounting erpData={erpData} updateData={updateData} />
          )}

          {(activeTab === 'HR Management' || activeTab === 'HRM') && (
            <HRM erpData={erpData} updateData={updateData} />
          )}

          {(activeTab === 'Settings Portfolio' || activeTab === 'Settings') && (
            <Settings 
              erpData={erpData} 
              updateData={updateData} 
              resetDatabaseWithIndustry={resetDatabaseWithIndustry}
            />
          )}
        </main>

        {/* Footer Context Bar */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase shrink-0 font-mono tracking-wider">
          <div className="flex space-x-6">
            <span>Status: Stable</span>
            <span>Engine: LocalDB Sandboxed</span>
            <span>Latency: 1ms</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 inline-block"></span>
            <span>Sync: 100% Secure</span>
          </div>
        </footer>
      </div>

      {/* 3. RIGHT SIDEBAR AI COMPONENT DRAWER PANEL */}
      {aiSidebarOpen && (
        <AIAssistant erpData={erpData} />
      )}

    </div>
  );
}
