import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function MarketPulse() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [authUser, setAuthUser] = useState(undefined); // undefined=loading, null=no auth

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => setAuthUser(user || null))
      .catch(() => setAuthUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
  };

  const toggleSection = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Error ${res.status}`);
      }
      const parsed = await res.json();
      setData(parsed);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sigColor = (s) => s === "bull" ? "#00d28c" : s === "bear" ? "#ef4444" : "#f59e0b";
  const sigBg = (s) => s === "bull" ? "rgba(0,210,140,0.1)" : s === "bear" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.08)";
  const chgColor = (v) => {
    if (!v) return "#3d5a73";
    const n = parseFloat(String(v).replace(/[^-0-9.]/g, ""));
    return n > 0 ? "#00d28c" : n < 0 ? "#ef4444" : "#3d5a73";
  };
  const scoreStyle = (sc) => {
    if (sc >= 7) return { border: "3px solid #00d28c", bg: "rgba(0,210,140,0.12)", color: "#00d28c" };
    if (sc >= 5) return { border: "3px solid #f59e0b", bg: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    return { border: "3px solid #ef4444", bg: "rgba(239,68,68,0.1)", color: "#ef4444" };
  };

  const sections = data ? [
    { id: "indices", title: "Índices", icon: "📈", items: data.indices, cols: ["name", "ticker", "value", "change", "changePercent", "signal"] },
    { id: "rates", title: "Tasas & Bonos", icon: "🏦", items: data.rates, cols: ["name", "value", "change", "signal", "note"] },
    { id: "commodities", title: "Commodities", icon: "🌾", items: data.commodities, cols: ["name", "value", "unit", "change", "changePercent", "signal"] },
    { id: "currencies", title: "Monedas & FX", icon: "💱", items: data.currencies, cols: ["name", "value", "change", "changePercent", "signal"] },
    { id: "crypto", title: "Crypto", icon: "₿", items: data.crypto, cols: ["name", "ticker", "value", "change", "changePercent", "signal"] },
  ] : [];

  const colLabel = { name: "Instrumento", ticker: "Ticker", value: "Precio", change: "Cambio", changePercent: "%", signal: "Señal", unit: "Unidad", note: "Nota" };
  const colAlign = { value: "right", change: "right", changePercent: "right", signal: "center", ticker: "center", unit: "center" };

  const renderCell = (item, col) => {
    if (col === "signal") return (
      <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "3px", display: "inline-block", letterSpacing: "0.1em", color: sigColor(item.signal), background: sigBg(item.signal) }}>
        {item.signal?.toUpperCase() || "—"}
      </span>
    );
    if (col === "name") return <span style={{ fontWeight: 500, color: "#c0d4e8", fontSize: "13px" }}>{item.name}</span>;
    if (col === "ticker") return <span style={{ fontFamily: "monospace", color: "#2e4a63", fontSize: "11px" }}>{item.ticker || item.unit || "—"}</span>;
    if (col === "unit") return <span style={{ fontFamily: "monospace", color: "#2e4a63", fontSize: "11px" }}>{item.unit || "—"}</span>;
    if (col === "note") return <span style={{ fontSize: "11px", color: "#2e4a63", maxWidth: "200px", display: "inline-block", whiteSpace: "normal", lineHeight: 1.4 }}>{item.note || "—"}</span>;
    if (col === "change" || col === "changePercent") return <span style={{ fontFamily: "monospace", fontSize: "12px", color: chgColor(item[col]) }}>{item[col] || "—"}</span>;
    return <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#c0d4e8" }}>{item[col] || "—"}</span>;
  };

  const ss = data?.summary ? scoreStyle(data.summary.score) : {};

  return (
    <>
      <Head>
        <title>MarketPulse — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        @keyframes mp-pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes mp-shimmer { to { background-position: -200% 0; } }
        @keyframes mp-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .mp-spin { animation: mp-spin 0.8s linear infinite; display: inline-block; }
        .mp-pulse { animation: mp-pulse 1.4s ease-in-out infinite; }
        .mp-fade { animation: mp-fadein 0.3s ease; }
        .sec-hdr:hover { background: #0d1f33 !important; }
        tr:hover td { background: #0c1e32; }
        .mp-btn:hover { background: #1e4a72 !important; border-color: #3b82f6 !important; color: #93c5fd !important; }
        .mp-btn:active { transform: scale(0.97); }
        .mp-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#060d1a", backgroundImage: "radial-gradient(ellipse 60% 40% at 15% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 85% 100%, rgba(0,210,140,0.05) 0%, transparent 60%)", fontFamily: "'DM Sans', sans-serif", color: "#b8ccdf", padding: "20px 20px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #0f2035", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
              MARKET<span style={{ color: "#3b82f6" }}>PULSE</span>
            </div>
            <div style={{ fontSize: "10px", color: "#2e4a63", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, marginTop: "3px" }}>Panel de mercado · Siembra a Futuro</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {lastUpdate && (
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#2e4a63" }}>
                ↺ {lastUpdate.toLocaleDateString("es-AR")} {lastUpdate.toLocaleTimeString("es-AR")}
              </div>
            )}
            <button className="mp-btn" onClick={fetchData} disabled={loading} style={{ background: "#1a3a5c", border: "1px solid #254d74", color: "#7ab3e0", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", transition: "all 0.18s", display: "flex", alignItems: "center", gap: "7px" }}>
              <span className={loading ? "mp-spin" : ""}>⟳</span>
              {loading ? "Buscando datos..." : "Actualizar mercado"}
            </button>
            {authUser === undefined ? null : authUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link href={authUser.role === "ADMIN" ? "/admin" : "/mi-cuenta"} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#7ab3e0", textDecoration: "none", padding: "7px 14px", borderRadius: "6px", border: "1px solid #1a3a5c", background: "#0d1f33" }}>
                  {authUser.role === "ADMIN" ? "⚙ Admin" : "👤 Mi cuenta"}
                </Link>
                <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #0f2035", color: "#2e4a63", padding: "7px 12px", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px" }}>
                  Salir
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link href="/login" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#7ab3e0", textDecoration: "none", padding: "7px 14px", borderRadius: "6px", border: "1px solid #1a3a5c", background: "#0d1f33" }}>
                  Iniciar sesión
                </Link>
                <Link href="/registro" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#fff", textDecoration: "none", padding: "7px 14px", borderRadius: "6px", background: "#3b82f6", fontWeight: 600 }}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 16px", color: "#f87171", fontSize: "12px", marginBottom: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* Summary */}
        {data?.summary && (
          <div className="mp-fade" style={{ background: "#0a1628", border: "1px solid #0f2035", borderRadius: "12px", padding: "20px 24px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #3b82f6 0%, #00d28c 60%, #3b82f6 100%)", backgroundSize: "200% 100%", animation: "mp-shimmer 3s linear infinite" }} />
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: ss.bg, border: ss.border }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", fontWeight: 700, color: ss.color, lineHeight: 1 }}>{data.summary.score}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", marginTop: "1px" }}>/ 10</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px", color: sigColor(data.summary.overall) }}>{data.summary.label}</div>
                <div style={{ fontSize: "13px", color: "#6e8fa8", lineHeight: 1.65 }}>{data.summary.recommendation}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {data.summary.riskLevel && (
                <div style={{ background: "#0d1f33", border: "1px solid #132840", borderRadius: "5px", padding: "5px 11px", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#2e4a63", fontWeight: 500 }}>Riesgo:</span>
                  <span style={{ fontWeight: 600, color: data.summary.riskLevel === "alto" ? "#ef4444" : data.summary.riskLevel === "bajo" ? "#00d28c" : "#f59e0b" }}>{data.summary.riskLevel.toUpperCase()}</span>
                </div>
              )}
              {data.summary.watchout && (
                <div style={{ background: "#0d1f33", border: "1px solid #132840", borderRadius: "5px", padding: "5px 11px", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#2e4a63", fontWeight: 500 }}>⚠ Vigilar:</span>
                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>{data.summary.watchout}</span>
                </div>
              )}
              {data.timestamp && (
                <div style={{ background: "#0d1f33", border: "1px solid #132840", borderRadius: "5px", padding: "5px 11px", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#2e4a63", fontWeight: 500 }}>Datos al:</span>
                  <span style={{ fontWeight: 600, color: "#4a7096" }}>{data.timestamp}</span>
                </div>
              )}
            </div>
            {data.summary.keyPoints?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {data.summary.keyPoints.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start", fontSize: "12px", color: "#5d7e96", lineHeight: 1.5 }}>
                    <div style={{ width: "5px", height: "5px", background: "#3b82f6", borderRadius: "50%", marginTop: "5px", flexShrink: 0 }} />
                    {pt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sections */}
        {sections.map((sec) => (
          <div key={sec.id} className="mp-fade" style={{ background: "#0a1628", border: "1px solid #0f2035", borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
            <div className="sec-hdr" onClick={() => toggleSection(sec.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#4a7096", textTransform: "uppercase" }}>
                <span style={{ fontSize: "14px" }}>{sec.icon}</span>
                {sec.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#1e3550", background: "#0d1f33", padding: "2px 7px", borderRadius: "3px" }}>{sec.items?.length || 0}</span>
                <span style={{ fontSize: "10px", color: "#2e4a63", transition: "transform 0.2s", display: "inline-block", transform: collapsed.has(sec.id) ? "none" : "rotate(180deg)" }}>▼</span>
              </div>
            </div>
            {!collapsed.has(sec.id) && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #0f2035" }}>
                      {sec.cols.map((c) => (
                        <th key={c} style={{ padding: "7px 14px", fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.14em", color: "#1e3550", fontWeight: 400, textTransform: "uppercase", textAlign: colAlign[c] || "left" }}>{colLabel[c]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sec.items || []).map((item, i) => (
                      <tr key={i}>
                        {sec.cols.map((c) => (
                          <td key={c} style={{ padding: "9px 14px", fontSize: "12px", borderBottom: "1px solid #08172a", whiteSpace: "nowrap", textAlign: colAlign[c] || "left" }}>
                            {renderCell(item, c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Empty / loading */}
        {!data && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", opacity: 0.4 }}>📊</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#4a7096" }}>Bienvenido a MarketPulse</div>
            <div style={{ fontSize: "12px", color: "#1e3550", maxWidth: "280px", lineHeight: 1.7 }}>
              Presioná <strong style={{ color: "#3b82f6" }}>Actualizar mercado</strong> para obtener todos los indicadores en tiempo real con análisis operativo para Argentina.
            </div>
          </div>
        )}

        {loading && !data && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "12px", textAlign: "center" }}>
            <div className="mp-pulse" style={{ fontSize: "40px" }}>⟳</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#4a7096" }}>Buscando datos de mercado...</div>
            <div style={{ fontSize: "12px", color: "#1e3550", maxWidth: "280px", lineHeight: 1.7 }}>Consultando índices, bonos, commodities, monedas y crypto. Puede tomar 20-30 segundos.</div>
          </div>
        )}

      </div>
    </>
  );
}
