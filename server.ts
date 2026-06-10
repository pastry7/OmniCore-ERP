/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI Assistant will operate in fallback mock mode.");
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// AI ERP Consultant Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], erpData = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let ai;
    try {
      ai = getAI();
    } catch (keyErr: any) {
      // Graceful fallback for demo or missing key times
      return res.json({
        text: `🤖 **[Mock Consultant Mode]** I am running in fallback mode because the developer API key is not yet configured.\n\nHere is what I've analyzed in your ERP:\n- **Company Name**: *${erpData.profile?.name || 'Unnamed Business'}*\n- **Industry**: *${erpData.profile?.industry?.toUpperCase() || 'General Enterprise'}*\n- **KPI Quick Diagnostics**: You have ${erpData.customers?.length || 0} customers, ${erpData.inventory?.length || 0} items in your catalog, and ${erpData.invoices?.length || 0} invoice records.\n\n*How to get fully dynamic AI? Provide your GEMINI_API_KEY in the AI Studio Settings under Secrets!*`
      });
    }

    // Embed current ERP context into system instructions
    const systemInstruction = `You are "Astra", a world-class AI ERP Intelligent Strategist & Business Advisor builtin directly to this enterprise resources planning dashboard.
The company is currently loaded with the following operational data:
- Profile: Business Name: "${erpData.profile?.name || 'Unnamed'}", Industry Type: "${erpData.profile?.industry || 'general'}", Currency: "${erpData.profile?.currency || '$'}", Primary Location: "${erpData.profile?.address || 'Primary Site'}".
- Summary: Has ${erpData.customers?.length || 0} customers, ${erpData.inventory?.length || 0} catalog SKU entries, ${erpData.suppliers?.length || 0} supplier profiles, ${erpData.deals?.length || 0} active sales deals, ${erpData.invoices?.length || 0} invoices, ${erpData.purchaseOrders?.length || 0} purchase orders, ${erpData.ledger?.length || 0} general ledger transactions, ${erpData.employees?.length || 0} registered staff.
- Low Stock Items: ${JSON.stringify((erpData.inventory || []).filter((i: any) => i.stock <= i.reorderLevel))}

When answering:
1. Provide highly professional, corporate-level, helpful, and quantitative business diagnostics.
2. If asked to write emails (e.g. collection invoices or supplier purchase orders), format them elegantly so the user can easily copy them.
3. If asked to run calculations (margins, profit and loss, tax ratios), present lists or neat markdown tables.
4. Suggest concrete steps to optimize inventory, streamline HR payroll, improve cash flows, or advance sales deal pipelines.
5. Keep your tone helpful, technical, strategic and actionable.`;

    // Map history to Google GenAI schema structure
    // Google Gen AI chats.create takes history in its config/contents
    // To make it simple and reliable, we'll run generateContent with the full compiled prompt
    // combining instructions, context, history, and message. This is highly robust!
    
    let chatPromptContext = "";
    if (history.length > 0) {
      chatPromptContext = "Here is the conversation history:\n" + history.map((h: any) => `${h.role === 'user' ? 'Client' : 'Assistant'}: ${h.text}`).join('\n') + "\n\n";
    }

    const prompt = `${chatPromptContext}Client asks: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || 'Error processing AI consult request' });
  }
});

// Configure Vite or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Started in DEVELOPMENT mode with Vite Middleware");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Started in PRODUCTION mode serving directory: ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP Express Server running at http://localhost:${PORT}`);
  });
}

startServer();
