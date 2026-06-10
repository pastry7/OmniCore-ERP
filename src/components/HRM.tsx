/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Users, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  Check, 
  X, 
  Wallet, 
  Plus, 
  RefreshCw,
  HelpCircle,
  Inbox
} from 'lucide-react';
import { ERPDatabase, Employee, LeaveRequest, LedgerTransaction } from '../types';

interface HRMProps {
  erpData: ERPDatabase;
  updateData: (data: Partial<ERPDatabase>) => void;
}

export function HRM({ erpData, updateData }: HRMProps) {
  const currency = erpData.profile.currency;

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('All');
  
  // Employee Form Onboarding States
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmp, setNewEmp] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    department: 'Operations' as Employee['department'],
    salary: 2000,
    status: 'Active' as Employee['status']
  });

  // Leave Form States
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    type: 'Annual' as LeaveRequest['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    reason: ''
  });

  // Onboard personnel
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.fullName || !newEmp.role) return;

    const added: Employee = {
      id: `emp-${Date.now()}`,
      fullName: newEmp.fullName,
      email: newEmp.email || 'N/A',
      phone: newEmp.phone || 'N/A',
      role: newEmp.role,
      department: newEmp.department,
      salary: Number(newEmp.salary) || 2000,
      hireDate: new Date().toISOString().split('T')[0],
      status: newEmp.status
    };

    updateData({
      employees: [...erpData.employees, added]
    });

    setNewEmp({
      fullName: '',
      email: '',
      phone: '',
      role: '',
      department: 'Operations',
      salary: 2000,
      status: 'Active'
    });
    setShowAddEmployee(false);
  };

  // Submit new leave request
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employeeId || !newLeave.reason) return;

    const addedLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: newLeave.employeeId,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'Pending'
    };

    updateData({
      leaves: [...erpData.leaves, addedLeave]
    });

    setNewLeave({
      employeeId: '',
      type: 'Annual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      reason: ''
    });
    setShowAddLeave(false);
  };

  const handleUpdateLeaveStatus = (leaveId: string, nextStatus: LeaveRequest['status']) => {
    const nextLeaves = erpData.leaves.map(lv => {
      if (lv.id === leaveId) {
        // If approved, optionally switch employee status to OnLeave
        if (nextStatus === 'Approved') {
          updateData({
            employees: erpData.employees.map(emp => {
              if (emp.id === lv.employeeId) {
                return { ...emp, status: 'OnLeave' };
              }
              return emp;
            })
          });
        }
        return { ...lv, status: nextStatus };
      }
      return lv;
    });

    updateData({ leaves: nextLeaves });
  };

  // ONE-CLICK WAGES PAYROLL PROCESSING
  const handleProcessPayroll = () => {
    const activeStaff = erpData.employees.filter(e => e.status !== 'Terminated');
    const totalWagePool = activeStaff.reduce((sum, e) => sum + e.salary, 0);

    if (totalWagePool <= 0) {
      alert("No active employees with registered salary to pay.");
      return;
    }

    // Auto book salaries general debit outlay in ledger accounting journals!
    const salariesPayment: LedgerTransaction = {
      id: `ldgr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Payroll Processing: Monthly wages disbursed to ${activeStaff.length} active staff`,
      category: 'Salaries',
      type: 'debit',
      amount: totalWagePool
    };

    updateData({
      ledger: [...erpData.ledger, salariesPayment]
    });

    alert(`Payroll Processed Successfully!\nDisbursed combined sum of ${currency}${totalWagePool.toLocaleString()} to ${activeStaff.length} active employee bank accounts.`);
  };

  const handleDeleteEmployee = (id: string) => {
    updateData({
      employees: erpData.employees.filter(e => e.id !== id),
      leaves: erpData.leaves.filter(lv => lv.employeeId !== id)
    });
  };

  // Filtering logs
  const filteredEmployees = erpData.employees.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(employeeSearch.toLowerCase()) || 
                          e.role.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesDept = filterDept === 'All' || e.department === filterDept;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div id="erp-hrm" className="space-y-8 font-sans">
      
      {/* Upper action header banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Personnel Directory & Monthly Payroll</h2>
          <p className="text-xs text-slate-500 mt-1">Onboard staff members, review vacation schedules, and disburse corporate wages directly to accounting spreadsheets.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <button 
            onClick={handleProcessPayroll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg shadow-3xs transition cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Process Salary Payroll</span>
          </button>

          <button 
            onClick={() => setShowAddLeave(!showAddLeave)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg shadow-3xs transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Submit Leave Request</span>
          </button>
          
          <button 
            onClick={() => setShowAddEmployee(!showAddEmployee)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard Personnel</span>
          </button>
        </div>
      </div>

      {/* HRM Forms and Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EMP ONBOARDING FORM */}
        {showAddEmployee && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <Users className="w-4 h-4 text-indigo-600" /> Onboard Human Capital Asset
            </h3>

            <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Employee Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={newEmp.fullName}
                  onChange={e => setNewEmp({...newEmp, fullName: e.target.value})}
                  placeholder="e.g. Elizabeth Bennet" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Corporate Role Title *</label>
                <input 
                  type="text" 
                  required
                  value={newEmp.role}
                  onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                  placeholder="VP of Development" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assigned Department</label>
                <select
                  value={newEmp.department}
                  onChange={e => setNewEmp({...newEmp, department: e.target.value as Employee['department']})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Software Engineering</option>
                  <option value="Sales">Sales & Marketing</option>
                  <option value="Finance">Corporate finance</option>
                  <option value="HR">Human Resources</option>
                  <option value="Executive">Executive Office</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Monthly Salary ({currency})</label>
                <input 
                  type="number" 
                  required
                  value={newEmp.salary}
                  onChange={e => setNewEmp({...newEmp, salary: Number(e.target.value) || 2000})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Personnel Status</label>
                <select
                  value={newEmp.status}
                  onChange={e => setNewEmp({...newEmp, status: e.target.value as Employee['status']})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="Active">Operational / Active</option>
                  <option value="OnLeave">Sabbatical / Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Work Mail address</label>
                <input 
                  type="email" 
                  value={newEmp.email}
                  onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                  placeholder="staff@company.com" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Mobile</label>
                <input 
                  type="text" 
                  value={newEmp.phone}
                  onChange={e => setNewEmp({...newEmp, phone: e.target.value})}
                  placeholder="555-0102" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="col-span-2 pt-2 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddEmployee(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Onboard Asset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBMIT LEAVE REQUEST FORM */}
        {showAddLeave && (
          <div className="bg-slate-50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-101 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Book Staff Time Out Leave
            </h3>

            <form onSubmit={handleAddLeave} className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Applicant Employee *</label>
                <select
                  required
                  value={newLeave.employeeId}
                  onChange={e => setNewLeave({...newLeave, employeeId: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 text-slate-80s outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Choose employee applicant --</option>
                  {erpData.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Leave Category</label>
                <select
                  value={newLeave.type}
                  onChange={e => setNewLeave({...newLeave, type: e.target.value as LeaveRequest['type']})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                >
                  <option value="Annual">Annual Vacation</option>
                  <option value="Sick">Medical / Sick Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                  <option value="Unpaid">Unpaid Hiatus</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Reason / Justification *</label>
                <input 
                  type="text" 
                  required
                  value={newLeave.reason}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                  placeholder="e.g. Summer holiday break" 
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Time Out Start</label>
                <input 
                  type="date" 
                  value={newLeave.startDate}
                  onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Expected Return End</label>
                <input 
                  type="date" 
                  value={newLeave.endDate}
                  onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                  className="w-full p-2 bg-white rounded border border-slate-200 outline-none text-slate-800 focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2 pt-2 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddLeave(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-white transition cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Staff Directory Directory list components representation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-slate-500" /> Active Employee Roster
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">{filteredEmployees.length}</span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search inputs */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
                placeholder="    Lookup personnel name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>

            {/* Department Picker */}
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales & Marketing</option>
              <option value="Finance">Corporate finance</option>
              <option value="HR">Human Resources</option>
              <option value="Executive">Executive Office</option>
            </select>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No employees recorded match departments criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Employee Full Name</th>
                  <th className="py-3 px-4 font-normal">Department Code</th>
                  <th className="py-3 px-4 font-normal">Onboard Date</th>
                  <th className="py-3 px-4 text-right">Monthly Wages</th>
                  <th className="py-3 px-4">Staff Status</th>
                  <th className="py-3 px-4 text-right">Terminations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-905">{emp.fullName}</p>
                          <p className="text-[10px] text-slate-400">{emp.role}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: {emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{emp.department}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{emp.hireDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-right">
                      {currency}{emp.salary.toLocaleString()}/mo
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-red-500 text-[10px] rounded transition cursor-pointer"
                      >
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Leave requests Approval Panel tracking scheduler */}
      <div id="hrm-leave-schedule-approvals" className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-3xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Calendar className="w-4.5 h-4.5 text-slate-500" /> Pending Vacation Scheduling Approvals
          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full font-bold">
            {erpData.leaves.filter(l => l.status === 'Pending').length} Request
          </span>
        </h3>

        {erpData.leaves.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No active vacation or leave request logs filed currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
            {erpData.leaves.map(lv => {
              const emp = erpData.employees.find(e => e.id === lv.employeeId);
              return (
                <div key={lv.id} className="p-4 rounded-xl border border-slate-205 space-y-3 bg-slate-50/30">
                  <div className="flex items-start justify-between border-b pb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{emp ? emp.fullName : 'Direct Applicant'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{emp?.role || 'Staff ID'}</p>
                    </div>
                    {/* Status badge representation */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${
                      lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                      lv.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-500 animate-pulse'
                    }`}>
                      {lv.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-650 space-y-1">
                    <p>🎯 <strong>Category Type:</strong> {lv.type} Leave</p>
                    <p>📅 <strong>Range Span:</strong> From {lv.startDate} to {lv.endDate}</p>
                    <p className="text-slate-500 italic mt-1 font-sans">" {lv.reason} "</p>
                  </div>

                  {lv.status === 'Pending' && (
                    <div className="flex items-center gap-1.5 pt-2 justify-end border-t border-slate-100">
                      <button
                        onClick={() => handleUpdateLeaveStatus(lv.id, 'Rejected')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleUpdateLeaveStatus(lv.id, 'Approved')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
