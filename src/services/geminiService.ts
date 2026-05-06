/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAI } from "../lib/gemini";
import { Transaction, Account } from "../types";

export async function generateFinancialAdvisory(
  transactions: Transaction[], 
  accounts: Account[],
  userName: string
) {
  const context = `
    User: ${userName}
    Accounts: ${JSON.stringify(accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance })))}
    Recent Transactions: ${JSON.stringify(transactions.slice(0, 10).map(t => ({ desc: t.description, amount: t.amount, type: t.type, cat: t.category })))}
  `;

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ 
      role: "user", 
      parts: [{ text: `Analyze these financial records and provide one actionable insight or piece of advice for the user. Be professional, concise, and helpful. Return a JSON object with 'title' and 'content' fields.\n\nCONTEXT:\n${context}` }]
    }],
    config: {
      systemInstruction: "You are Numora's AI Financial Advisor. You specialize in wealth management and budget optimization.",
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}
