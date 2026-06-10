/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Package, 
  Share2, 
  Truck, 
  AlertTriangle, 
  RefreshCw, 
  ShoppingBag, 
  HelpCircle,
  Inbox
} from 'lucide-react';
import { ERPDatabase, InventoryItem, Supplier, InventoryType } from '../types';

interface InventoryProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
}

export function Inventory({ erpData, updateData }: InventoryProps) {
  const currency = erpData.profile.currency;

  // Catalog Item States
  const [catalogSearch, setCatalogSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [newCatalogItem, setNewCatalogItem] = useState({
    name: '',
    type: 'product' as InventoryType,
    stock: 10,
    unit: 'pcs',
    buyPrice: 0,
    sellPrice: 0,
    reorderLevel: 5,
    sku: '',
    supplierId: ''
  });

  // Supplier States
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Simple quick stock increase incrementor
  const handleQuickRestock = (itemId: string, incrementValue: number) => {
    const updated = erpData.inventory.map(item => {
      if (item.id === itemId) {
        // Increment stock
        const nextStock = item.stock + incrementValue;
        
        // Also book a general ledger COGS cost payment transaction automatically!
        if (item.buyPrice > 0) {
          const costOfBatch = item.buyPrice * incrementValue;
          const ledgerEntry = {
            id: `ldgr-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Auto-Book batch restock cost: ${incrementValue}x SKU ${item.sku}`,
            category: 'COGS' as const,
            type: 'debit' as const,
            amount: costOfBatch
          };
          updateData({
            ledger: [...erpData.ledger, ledgerEntry]
          });
        }

        return { ...item, stock: nextStock };
      }
      return item;
    });

    updateData({ inventory: updated });
  };

  // Add Catalog Item
  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatalogItem.name || !newCatalogItem.sku) return;

    const added: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newCatalogItem.name,
      type: newCatalogItem.type,
      stock: Number(newCatalogItem.stock) || 0,
      unit: newCatalogItem.unit || 'pcs',
      buyPrice: Number(newCatalogItem.buyPrice) || 0,
      sellPrice: Number(newCatalogItem.sellPrice) || 0,
      reorderLevel: Number(newCatalogItem.reorderLevel) || 0,
      sku: newCatalogItem.sku,
      supplierId: newCatalogItem.supplierId || undefined
    };

    updateData({
      inventory: [...erpData.inventory, added]
    });

    setNewCatalogItem({
      name: '',
      type: 'product',
      stock: 10,
      unit: 'pcs',
      buyPrice: 0,
      sellPrice: 0,
      reorderLevel: 5,
      sku: '',
      supplierId: ''
    });
    setShowAddCatalog(false);
  };

  // Add Supplier
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name) return;

    const added: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplier.name,
      contactName: newSupplier.contactName || 'Primary Representative',
      email: newSupplier.email || 'N/A',
      phone: newSupplier.phone || 'N/A',
      address: newSupplier.address || 'N/A'
    };

    updateData({
      suppliers: [...erpData.suppliers, added]
    });

    setNewSupplier({ name: '', contactName: '', email: '', phone: '', address: '' });
    setShowAddSupplier(false);
  };

  const handleRemoveCatalogItem = (id: string) => {
    updateData({
      inventory: erpData.inventory.filter(item => item.id !== id)
    });
  };

  const handleRemoveSupplier = (id: string) => {
    updateData({
      suppliers: erpData.suppliers.filter(s => s.id !== id)
    });
  };

  // Filter Catalog
  const filteredCatalog = erpData.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          item.sku.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filter Suppliers
  const filteredSuppliers = erpData.suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.contactName.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div id="erp-inventory" className="space-y-8 font-sans">
      
      {/* Module Title Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Warehouse Inventory & Supply Chain</h2>
          <p className="text-xs text-slate-500 mt-1">Manage catalog item SKUs and purchase supplier accounts. Increments book costs automatically on General ledger!</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <button 
            onClick={() => setShowAddSupplier(!showAddSupplier)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg shadow-3xs transition cursor-pointer"
          >
            <Truck className="w-4 h-4 text-indigo-500" />
            <span>Enroll Supplier</span>
          </button>
          
          <button 
            onClick={() => setShowAddCatalog(!showAddCatalog)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create SKU</span>
          </button>
        </div>
      </div>

      {/* Insertion Forms fold-outs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADD SKU ENTRY FORM */}
        {showAddCatalog && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-150 pb-2">
              <Package className="w-4 h-4 text-indigo-600" /> Insert New Catalog SKU Entry
            </h3>

            <form onSubmit={handleAddCatalogItem} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">SKU nomenclature *</label>
                <input 
                  type="text" 
                  required
                  value={newCatalogItem.name}
                  onChange={e => setNewCatalogItem({...newCatalogItem, name: e.target.value})}
                  placeholder="e.g. Premium Ergonomic Laptop Stand" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800 animate-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Unique SKU Code *</label>
                <input 
                  type="text" 
                  required
                  value={newCatalogItem.sku}
                  onChange={e => setNewCatalogItem({...newCatalogItem, sku: e.target.value})}
                  placeholder="SKU-STAND-ERGO" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nomenclature Type</label>
                <select
                  value={newCatalogItem.type}
                  onChange={e => setNewCatalogItem({...newCatalogItem, type: e.target.value as InventoryType})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="product">Retail Product / Goods</option>
                  <option value="material">Raw Manufacturing Material</option>
                  <option value="service">Hourly Service Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Baseline Stock Volume</label>
                <input 
                  type="number" 
                  value={newCatalogItem.stock}
                  onChange={e => setNewCatalogItem({...newCatalogItem, stock: Number(e.target.value) || 0})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Measuring Unit</label>
                <input 
                  type="text" 
                  value={newCatalogItem.unit}
                  onChange={e => setNewCatalogItem({...newCatalogItem, unit: e.target.value})}
                  placeholder="pcs, hrs, kg, box" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Purchasing Cost ({currency})</label>
                <input 
                  type="number" 
                  value={newCatalogItem.buyPrice}
                  onChange={e => setNewCatalogItem({...newCatalogItem, buyPrice: Number(e.target.value) || 0})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">Selling Value ({currency})</label>
                <input 
                  type="number" 
                  value={newCatalogItem.sellPrice}
                  onChange={e => setNewCatalogItem({...newCatalogItem, sellPrice: Number(e.target.value) || 0})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 font-sans text-amber-600">Reorder Alert Limits</label>
                <input 
                  type="number" 
                  value={newCatalogItem.reorderLevel}
                  onChange={e => setNewCatalogItem({...newCatalogItem, reorderLevel: Number(e.target.value) || 0})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assigned Wholesaler Supplier</label>
                <select
                  value={newCatalogItem.supplierId}
                  onChange={e => setNewCatalogItem({...newCatalogItem, supplierId: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="">-- No Supplier Assigned --</option>
                  {erpData.suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 pt-2 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddCatalog(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ADD SUPPLIER FORM */}
        {showAddSupplier && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-150 pb-2">
              <Truck className="w-4 h-4 text-indigo-600" /> Register Partner Wholesaler Supplier
            </h3>

            <form onSubmit={handleAddSupplier} className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Corporate Title / Firm Name *</label>
                <input 
                  type="text" 
                  required
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="e.g. Global Tech Distributors" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Key Account Contact Person</label>
                <input 
                  type="text" 
                  value={newSupplier.contactName}
                  onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})}
                  placeholder="Hans Gruber" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Corporate Mail Address</label>
                <input 
                  type="email" 
                  value={newSupplier.email}
                  onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                  placeholder="purchase@globaltech.com" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Support Phone</label>
                <input 
                  type="text" 
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                  placeholder="+49 30 152" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 text-slate-600">HQ Physical Address</label>
                <input 
                  type="text" 
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                  placeholder="Avenue 12, Munich, Germany" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2 pt-2 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddSupplier(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Catalog Registry List */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Package className="w-4 h-4 text-slate-500" /> Active Stock SKU Listings
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{filteredCatalog.length}</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search inputs */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Lookup SKU or Name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            {/* Filter types */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="product">Finished Products</option>
              <option value="material">Raw Materials</option>
              <option value="service">Hourly Services</option>
            </select>
          </div>
        </div>

        {/* Catalog Table */}
        {filteredCatalog.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No SKU lines found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-250 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Catalog Item (SKU)</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse stock count</th>
                  <th className="py-3 px-4">Commercial Cost Margins</th>
                  <th className="py-3 px-4">Sub Supplier</th>
                  <th className="py-3 px-4">Batch Order Action</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.map(item => {
                  const isLow = item.stock <= item.reorderLevel && item.type !== 'service';
                  const supplier = erpData.suppliers.find(s => s.id === item.supplierId);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-sans">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">SKU Code: {item.sku}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] capitalize ${
                          item.type === 'product' ? 'bg-indigo-50 text-indigo-600' :
                          item.type === 'material' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.type === 'service' ? (
                          <span className="text-slate-400 italic">Billable Service (Unlimited)</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold text-sm ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                              {item.stock}
                            </span>
                            <span className="text-slate-400 text-[10px]"> / {item.unit}</span>
                            {isLow && (
                              <span className="flex items-center gap-0.5 text-[9px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-100 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Reorder limit!
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700">
                        <p className="font-mono">Buy Price: <span className="font-bold">{currency}{item.buyPrice}</span></p>
                        <p className="font-mono text-indigo-600">Sell Price: <span className="font-bold">{currency}{item.sellPrice}</span></p>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-sans">{supplier ? supplier.name : 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        {item.type !== 'service' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickRestock(item.id, 10)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 font-mono font-bold text-[10px] rounded transition cursor-pointer"
                            >
                              +10 Units
                            </button>
                            <button
                              onClick={() => handleQuickRestock(item.id, 50)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 font-mono font-bold text-[10px] rounded transition cursor-pointer"
                            >
                              +50 Units
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveCatalogItem(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Inbox className="w-4 h-4 text-rose-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier Section Directory */}
      <div id="supplier-directory-hub" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-500" /> Registered Supply Partners Log
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{erpData.suppliers.length}</span>
          </h3>

          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              value={supplierSearch}
              onChange={e => setSupplierSearch(e.target.value)}
              placeholder="Search supply partners..."
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No registered suppliers match your lookup search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition space-y-3 bg-slate-50/20 shadow-4xs">
                <div className="flex items-start justify-between border-b border-slate-105 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {s.id}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveSupplier(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600 font-sans">
                  <p>👤 <strong>Representative:</strong> {s.contactName}</p>
                  <p>✉️ <strong>Email:</strong> {s.email}</p>
                  <p>📞 <strong>Tel:</strong> {s.phone}</p>
                  <p className="truncate text-slate-400 text-[10px]">📍 {s.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
