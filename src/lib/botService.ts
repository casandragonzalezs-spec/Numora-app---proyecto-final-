export interface BotStatus {
  ema_fast: number;
  ema_slow: number;
  last_price: number;
  last_update: string;
  position_type: 'LONG' | 'SHORT' | 'NEUTRAL';
  rsi: number;
  symbol: string;
}

let mockSymbol = localStorage.getItem('numora_mock_symbol') || "BIMBOAMX";

export const getBotStatus = async (): Promise<BotStatus> => {
  try {
    const response = await fetch('/api/bot/status', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("Received non-JSON response from server");
    }
  } catch (error) {
    // FALLBACK: Simulate bot if server is unreachable
    console.warn(`[PROXY] Simulated symbol ${mockSymbol} (Bot server unreachable)`);
    
    // Generate some dynamic mock data
    const now = new Date();
    return {
      ema_fast: 45.32 + Math.random(),
      ema_slow: 44.98 + Math.random(),
      last_price: 45.15 + (Math.random() - 0.5) * 0.5,
      last_update: now.toISOString(),
      position_type: Math.random() > 0.5 ? 'LONG' : 'NEUTRAL',
      rsi: 45 + Math.random() * 20,
      symbol: mockSymbol
    };
  }
};

export const changeSymbol = async (symbol: string): Promise<any> => {
  mockSymbol = symbol;
  localStorage.setItem('numora_mock_symbol', symbol);
  try {
    const response = await fetch('/api/bot/symbol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    });
    
    if (!response.ok) {
      throw new Error(`Error changing symbol: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[PROXY] Simulated symbol change to ${symbol} (Bot server unreachable)`);
    return { success: true, message: `Símbolo cambiado a ${symbol} (Mock)` };
  }
};

export const executeOrder = async (action: 'BUY' | 'SELL', shares: number): Promise<any> => {
  try {
    const response = await fetch('/api/bot/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, shares })
    });
    
    if (!response.ok) {
      throw new Error(`Error executing order: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[PROXY] Simulated ${action} order for ${shares} shares (Bot server unreachable)`);
    return { success: true, message: `Orden de ${action} ejecutada (Mock)` };
  }
};
