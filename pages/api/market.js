export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SYSTEM_PROMPT = `Eres un analista financiero senior especializado en mercados argentinos e internacionales.
Tu tarea: buscar en la web los valores ACTUALES de mercado y devolver ÚNICAMENTE un objeto JSON válido.
REGLA CRÍTICA: NO incluyas texto antes o después del JSON. NO uses markdown. NO uses backticks. SOLO el JSON puro.

Estructura exacta (rellena todos los campos con datos reales buscados ahora):
{
  "timestamp": "fecha y hora actual con timezone",
  "indices": [
    {"name": "S&P 500", "ticker": "SPX", "value": "5280.50", "change": "+12.30", "changePercent": "+0.23%", "signal": "bull"},
    {"name": "Nasdaq 100", "ticker": "NDX", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Dow Jones", "ticker": "DJI", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "Russell 2000", "ticker": "RUT", "value": "...", "change": "...", "changePercent": "...", "signal": "bear"},
    {"name": "Merval (USD CCL)", "ticker": "MERVAL", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "YPF", "ticker": "YPF", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Galicia", "ticker": "GGAL", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Banco Macro", "ticker": "BMA", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "Pampa Energía", "ticker": "PAM", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Tenaris", "ticker": "TS", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"}
  ],
  "rates": [
    {"name": "Treasury 2Y", "value": "4.82%", "change": "+0.03%", "signal": "bear", "note": "Corto plazo Fed"},
    {"name": "Treasury 10Y", "value": "...", "change": "...", "signal": "bear", "note": "Referencia global"},
    {"name": "Treasury 30Y", "value": "...", "change": "...", "signal": "bear", "note": "Largo plazo"},
    {"name": "Spread 10Y-2Y", "value": "...", "change": "...", "signal": "neutral", "note": "Curva inversión=recesión"},
    {"name": "CPI USA (YoY)", "value": "...", "change": "...", "signal": "bear", "note": "Alta inflación = más tasa = malo para ARG"},
    {"name": "Riesgo País EMBI", "value": "...", "change": "...", "signal": "bull", "note": "Baja = bueno para ARG"},
    {"name": "GD30 (precio)", "value": "...", "change": "...", "signal": "bull", "note": "Bono soberano ARG 2030"},
    {"name": "AL30 (precio)", "value": "...", "change": "...", "signal": "bull", "note": "Bono soberano ARG 2030 ley ARG"}
  ],
  "commodities": [
    {"name": "Soja", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/bu", "signal": "bull"},
    {"name": "Petróleo WTI", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/bbl", "signal": "neutral"},
    {"name": "Petróleo Brent", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/bbl", "signal": "neutral"},
    {"name": "Gas Natural", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/MMBtu", "signal": "neutral"},
    {"name": "Oro", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/oz", "signal": "bull"},
    {"name": "Plata", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/oz", "signal": "bull"},
    {"name": "Cobre", "value": "...", "change": "...", "changePercent": "...", "unit": "USD/lb", "signal": "neutral"}
  ],
  "currencies": [
    {"name": "DXY (Índice Dólar)", "value": "...", "change": "...", "changePercent": "...", "signal": "bear"},
    {"name": "EUR/USD", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "USD/BRL", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "USD/MXN", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "USD/CLP", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "ARS Oficial", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "Dólar MEP (GD30)", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "Dólar CCL", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "Dólar Blue", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"}
  ],
  "crypto": [
    {"name": "Bitcoin", "ticker": "BTC", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Ethereum", "ticker": "ETH", "value": "...", "change": "...", "changePercent": "...", "signal": "bull"},
    {"name": "Solana", "ticker": "SOL", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "BNB", "ticker": "BNB", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"},
    {"name": "XRP", "ticker": "XRP", "value": "...", "change": "...", "changePercent": "...", "signal": "neutral"}
  ],
  "summary": {
    "score": 7,
    "overall": "bull",
    "label": "Favorable para operar",
    "recommendation": "Texto 2-3 oraciones con análisis operativo concreto para inversores argentinos hoy.",
    "keyPoints": ["Punto clave 1 con dato concreto", "Punto clave 2", "Punto clave 3", "Punto clave 4"],
    "riskLevel": "medio",
    "watchout": "Principal factor de riesgo o evento a vigilar hoy"
  }
}

REGLAS señal: bull=positivo para ARG/riesgo, bear=negativo, neutral=mixto.
Tasas Tesoro subiendo=bear. DXY subiendo=bear. Riesgo País bajando=bull. Bonos ARG precio sube=bull.
Score: 1-3=muy malo, 4-5=precaución, 6-7=moderado ok, 8-10=excelente.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: "Busca ahora mismo en la web los datos actualizados de: índices SP500 Nasdaq Dow Russell Merval YPF GGAL BMA PAM TS; tasas bonos tesoro USA 2Y 10Y 30Y spread CPI USA y bonos argentinos GD30 AL30 precio y Riesgo País EMBI Argentina; commodities soja petróleo WTI Brent gas natural oro plata cobre; monedas DXY EUR/USD USD/BRL USD/MXN USD/CLP dólar oficial MEP CCL blue Argentina; crypto BTC ETH SOL BNB XRP. Devuelve SOLO el JSON."
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s === -1) return res.status(500).json({ error: "No JSON in response" });
    const parsed = JSON.parse(text.slice(s, e + 1));
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
