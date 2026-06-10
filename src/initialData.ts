/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ERPDatabase, Customer, InventoryItem, Supplier, SalesDeal, Invoice, LedgerTransaction, Employee, LeaveRequest } from './types';

export const INDUSTY_PRESETS = {
  general: {
    name: "Nexus Multi-Corp LLC",
    currency: "$",
    taxRate: 12,
    address: "742 Evergreen Terrace, Springfield, OR",
    email: "contact@nexuscorp.com",
    phone: "+1 (555) 019-2831",
  },
  retail: {
    name: "Urban Outfitters & Tech Store",
    currency: "$",
    taxRate: 8,
    address: "450 Broadway Ave, New York, NY",
    email: "retail-billing@urbanoutfitters.com",
    phone: "+1 (212) 555-8321",
  },
  service: {
    name: "Apex Consulting Solutions Ltd",
    currency: "£",
    taxRate: 20,
    address: "88 Kingsway, London, WC2B 6XD, UK",
    email: "accounts@apexsolutions.co.uk",
    phone: "+44 20 7946 0958",
  },
  manufacturing: {
    name: "Titan Castings & Assembly Corp",
    currency: "€",
    taxRate: 19,
    address: "Kaiserstraße 12, 60311 Frankfurt am Main, Germany",
    email: "logistics@titancastings.de",
    phone: "+49 69 9460 2198",
  }
};

export function generateSampleData(industry: 'retail' | 'service' | 'manufacturing' | 'general'): ERPDatabase {
  let customers: Customer[] = [];
  let inventory: InventoryItem[] = [];
  let suppliers: Supplier[] = [];
  let deals: SalesDeal[] = [];
  let invoices: Invoice[] = [];
  let ledger: LedgerTransaction[] = [];
  let employees: Employee[] = [];
  let leaves: LeaveRequest[] = [];

  // Suppliers common & specific
  suppliers = [
    {
      id: "sup-1",
      name: "Global Logistics & Parts GMBH",
      contactName: "Hans Müller",
      email: "logistics@globalparts.de",
      phone: "+49 30 193859",
      address: "Industrial Park 4, Berlin, Germany"
    },
    {
      id: "sup-2",
      name: "Pinnacle Distributing LLC",
      contactName: "Sarah Jenkins",
      email: "order@pinnacledist.com",
      phone: "+1 (800) 555-0149",
      address: "102 Distribution Way, Dallas, TX"
    },
    {
      id: "sup-3",
      name: "Intellect Talent Agency",
      contactName: "Nadia Petrov",
      email: "contact@intellectagency.com",
      phone: "+44 113 496 0122",
      address: "44 Innovation Dr, Leeds, UK"
    }
  ];

  // Load industry items
  if (industry === 'retail') {
    customers = [
      { id: "cust-1", name: "Johnathan Doe", company: "Individual", email: "john.doe@gmail.com", phone: "555-0112", address: "12 Maple St, Albany, NY", balance: 0, status: "active", segment: "SMB" },
      { id: "cust-2", name: "Alice Sterling", company: "AeroSpace Media", email: "asterling@aerospace.co", phone: "555-0199", address: "508 Skyway Dr, Seattle, WA", balance: 2450, status: "active", segment: "Enterprise" },
      { id: "cust-3", name: "Robert Chen", company: "Chen Retail Hub", email: "robert@chenhub.com", phone: "555-0219", address: "44 Sunset Blvd, Los Angeles, CA", balance: -500, status: "active", segment: "Wholesaler" },
    ];

    inventory = [
      { id: "inv-1", name: "Zenith Pro Laptop 15\"", type: "product", stock: 18, unit: "pcs", buyPrice: 750, sellPrice: 1299, reorderLevel: 5, sku: "LAP-ZEN-15", supplierId: "sup-2" },
      { id: "inv-2", name: "Spectre Wireless Headphones", type: "product", stock: 45, unit: "pcs", buyPrice: 45, sellPrice: 120, reorderLevel: 10, sku: "HP-SPEC-W", supplierId: "sup-2" },
      { id: "inv-3", name: "UltraWide Curved Monitor 34\"", type: "product", stock: 3, unit: "pcs", buyPrice: 220, sellPrice: 449, reorderLevel: 5, sku: "MON-CURV-34", supplierId: "sup-2" },
      { id: "inv-4", name: "Ergonomic Office Chair Red", type: "product", stock: 12, unit: "pcs", buyPrice: 80, sellPrice: 189, reorderLevel: 3, sku: "CHR-ERGO-R", supplierId: "sup-1" },
    ];

    deals = [
      { id: "deal-1", title: "AeroSpace Office Equipment Batch 2", customerId: "cust-2", value: 4890, stage: "Proposal", closeDate: "2026-06-15", notes: "Negotiating wholesale discounts." },
      { id: "deal-2", title: "Chen Hub Holiday Electronics Retainer", customerId: "cust-3", value: 12000, stage: "Negotiation", closeDate: "2026-07-01" },
    ];
  } 
  else if (industry === 'service') {
    customers = [
      { id: "cust-1", name: "Clara Oswald", company: "Cyberdyne Systems", email: "coswald@cyberdyne.io", phone: "+1 (555) 902-1920", address: "101 Machine Way, Sunnyvale, CA", balance: 12500, status: "active", segment: "Enterprise" },
      { id: "cust-2", name: "Danny Pink", company: "Coal Hill Academy", email: "dpink@coalhill.edu", phone: "555-1039", address: "60 London Road, London, UK", balance: 4500, status: "active", segment: "Key Account" },
      { id: "cust-3", name: "Mervin Rose", company: "Rosewood Agency", email: "mervin@rosewood.com", phone: "555-2121", address: "99 Peach Ave, Atlanta, GA", balance: 0, status: "active", segment: "SMB" },
    ];

    inventory = [
      { id: "inv-1", name: "Senior UI/UX Strategy", type: "service", stock: 9999, unit: "hrs", buyPrice: 60, sellPrice: 150, reorderLevel: 0, sku: "SVC-UIUX-SR" },
      { id: "inv-2", name: "Full-Stack Development Sprint", type: "service", stock: 9999, unit: "hrs", buyPrice: 50, sellPrice: 125, reorderLevel: 0, sku: "SVC-DEV-SPRINT" },
      { id: "inv-3", name: "Cloud Architecture Audit", type: "service", stock: 9999, unit: "hrs", buyPrice: 80, sellPrice: 200, reorderLevel: 0, sku: "SVC-CLOUD-AUDIT" },
      { id: "inv-4", name: "Enterprise Agile Coaching", type: "service", stock: 9999, unit: "hrs", buyPrice: 40, sellPrice: 110, reorderLevel: 0, sku: "SVC-AGILE-COACH" },
    ];

    deals = [
      { id: "deal-1", title: "Cyberdyne App Re-Architecture", customerId: "cust-1", value: 75000, stage: "Proposal", closeDate: "2026-06-20", notes: "Awaiting final C-suite signoff on the proposal scope." },
      { id: "deal-2", title: "Coal Hill IT Infrastructure Deployment", customerId: "cust-2", value: 35000, stage: "Won", closeDate: "2026-05-25" },
    ];
  } 
  else if (industry === 'manufacturing') {
    customers = [
      { id: "cust-1", name: "Klaus Schmidt", company: "München Automotive AG", email: "k.schmidt@munichauto.de", phone: "+49 89 292839", address: "BMW Str. 44, Munich, Germany", balance: 25000, status: "active", segment: "Enterprise" },
      { id: "cust-2", name: "Hans Gruber", company: "Nakatomi Heavy Industries", email: "hgruber@nakatomi.co.jp", phone: "+81 3 555-9011", address: "Tokyo Towers, Shinagawa, Japan", balance: 142000, status: "active", segment: "Enterprise" },
    ];

    inventory = [
      { id: "inv-1", name: "High-Tensile Steel Plates (2x2m)", type: "material", stock: 240, unit: "pcs", buyPrice: 45, sellPrice: 85, reorderLevel: 50, sku: "MAT-STEEL-LP", supplierId: "sup-1" },
      { id: "inv-2", name: "Rotary Turbine Assembly", type: "product", stock: 14, unit: "pcs", buyPrice: 1200, sellPrice: 3100, reorderLevel: 5, sku: "PROD-ROT-TURB", supplierId: "sup-1" },
      { id: "inv-3", name: "Neodymium Magnets (Super-Grade)", type: "material", stock: 15, unit: "pcs", buyPrice: 15, sellPrice: 35, reorderLevel: 25, sku: "MAT-MAG-NEO", supplierId: "sup-2" },
      { id: "inv-4", name: "Industrial Hydraulic Piston HP-2", type: "product", stock: 8, unit: "pcs", buyPrice: 350, sellPrice: 650, reorderLevel: 10, sku: "PROD-HYD-P2", supplierId: "sup-1" },
    ];

    deals = [
      { id: "deal-1", title: "Munich Auto Q3 Piston Fleet", customerId: "cust-1", value: 125000, stage: "Proposal", closeDate: "2026-08-01" },
      { id: "deal-2", title: "Nakatomi Aerospace Turbine Contract", customerId: "cust-2", value: 310000, stage: "Negotiation", closeDate: "2026-07-15" },
    ];
  } 
  else { // General business
    customers = [
      { id: "cust-1", name: "Sarah Connor", company: "Cyber System Corp", email: "sconnor@cybersys.com", phone: "555-5021", address: "Main St 101, Pasadena, CA", balance: 8400, status: "active", segment: "Enterprise" },
      { id: "cust-2", name: "Bruce Wayne", company: "Wayne Enterprises", email: "bruce@waynecorp.com", phone: "555-0100", address: "Wayne Tower, Gotham City, NJ", balance: 45000, status: "active", segment: "Enterprise" },
    ];

    inventory = [
      { id: "inv-1", name: "Consulting Package A", type: "service", stock: 9999, unit: "pcs", buyPrice: 200, sellPrice: 500, reorderLevel: 0, sku: "CONS-PKG-A" },
      { id: "inv-2", name: "Premium Enterprise Server Node", type: "product", stock: 8, unit: "pcs", buyPrice: 1500, sellPrice: 2999, reorderLevel: 2, sku: "SRV-NODE-PREM", supplierId: "sup-2" },
      { id: "inv-3", name: "Copper Wiring Reel (100m)", type: "material", stock: 85, unit: "pcs", buyPrice: 30, sellPrice: 65, reorderLevel: 20, sku: "MAT-COP-100", supplierId: "sup-1" },
    ];

    deals = [
      { id: "deal-1", title: "Wayne Tower Server Overhaul", customerId: "cust-2", value: 120000, stage: "Proposal", closeDate: "2026-06-30" },
    ];
  }

  // Load standard employees and salaries across industries
  employees = [
    { id: "emp-1", fullName: "Elizabeth Bennet", email: "e.bennet@company.com", phone: "555-4012", role: "VP of Operations", department: "Operations", salary: 7500, hireDate: "2024-03-12", status: "Active" },
    { id: "emp-2", fullName: "Fitzwilliam Darcy", email: "f.darcy@company.com", phone: "555-1212", role: "Chief Financial Officer", department: "Finance", salary: 9200, hireDate: "2023-01-15", status: "Active" },
    { id: "emp-3", fullName: "Jane Bennet", email: "j.bennet@company.com", phone: "555-4013", role: "HR Generalist", department: "HR", salary: 4500, hireDate: "2024-06-01", status: "Active" },
    { id: "emp-4", fullName: "Charles Bingley", email: "c.bingley@company.com", phone: "555-9988", role: "Account Executive", department: "Sales", salary: 4800, hireDate: "2025-02-18", status: "Active" },
    { id: "emp-5", fullName: "George Wickham", email: "g.wickham@company.com", phone: "555-0077", role: "Support Engineer", department: "Engineering", salary: 3800, hireDate: "2025-11-01", status: "OnLeave" }
  ];

  leaves = [
    { id: "leave-1", employeeId: "emp-5", type: "Maternity/Paternity", startDate: "2026-05-15", endDate: "2026-06-15", reason: "Family leaves", status: "Approved" },
    { id: "leave-2", employeeId: "emp-1", type: "Annual", startDate: "2026-07-01", endDate: "2026-07-10", reason: "Summer vacation", status: "Pending" }
  ];

  // Invoices & Ledger entries matching initial customer balances
  const currencySymbol = INDUSTY_PRESETS[industry].currency;
  
  if (customers.length > 0) {
    // Generate invoices
    invoices = [
      {
        id: "inv-rec-1",
        invoiceNumber: "INV-2026-0001",
        customerId: customers[0].id,
        date: "2026-05-10",
        dueDate: "2026-06-10",
        items: [
          { itemId: inventory[0].id, name: inventory[0].name, qty: 10, unitPrice: inventory[0].sellPrice }
        ],
        taxRate: INDUSTY_PRESETS[industry].taxRate,
        discount: 0,
        total: Math.round(10 * inventory[0].sellPrice * (1 + INDUSTY_PRESETS[industry].taxRate / 100)),
        status: customers[0].balance > 0 ? "Sent" : "Paid"
      }
    ];

    if (customers[1]) {
      invoices.push({
        id: "inv-rec-2",
        invoiceNumber: "INV-2026-0002",
        customerId: customers[1].id,
        date: "2026-05-15",
        dueDate: "2026-06-15",
        items: [
          { itemId: inventory[1]?.id || inventory[0].id, name: inventory[1]?.name || inventory[0].name, qty: 2, unitPrice: inventory[1]?.sellPrice || inventory[0].sellPrice }
        ],
        taxRate: INDUSTY_PRESETS[industry].taxRate,
        discount: 10,
        total: Math.round(2 * (inventory[1]?.sellPrice || inventory[0].sellPrice) * 0.9 * (1 + INDUSTY_PRESETS[industry].taxRate / 100)),
        status: customers[1].balance > 0 ? "Sent" : "Paid"
      });
    }

    // Ledger History
    ledger = [
      { id: "ldgr-1", date: "2026-04-01", description: "Capital Injection from Founders", category: "Equity", type: "credit", amount: 120000 },
      { id: "ldgr-2", date: "2026-04-10", description: "Office Lease Rental payment", category: "Operating_Expense", type: "debit", amount: 4500 },
      { id: "ldgr-3", date: "2026-05-01", description: "April Payroll Disbursements", category: "Salaries", type: "debit", amount: 25000 },
      { id: "ldgr-4", date: "2026-05-08", description: "Supplier Restocking PO-901", category: "COGS", type: "debit", amount: 12500 },
      { id: "ldgr-5", date: "2026-05-12", description: "Cleared Balance Invoice INV-2026-0001", category: "Revenue", type: "credit", amount: invoices[0].total }
    ];
  }

  return {
    profile: {
      ...INDUSTY_PRESETS[industry],
      industry
    },
    customers,
    inventory,
    suppliers,
    deals,
    invoices,
    purchaseOrders: [],
    ledger,
    employees,
    leaves
  };
}
