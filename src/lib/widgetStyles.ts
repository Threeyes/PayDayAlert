export const WIDGET_CSS = `
html, body { margin: 0; padding: 0; height: 100%; background: #060a08; overflow: hidden; }
body.pw-body { font-family: 'Manrope Variable', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
* { box-sizing: border-box; }
.pw-root {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100vh;
  padding: 14px 16px;
  color: #f4fbf7;
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(76, 224, 168, 0.22), transparent 55%),
    radial-gradient(100% 80% at 0% 100%, rgba(242, 199, 119, 0.10), transparent 60%),
    #070b0a;
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
.pw-root::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
.pw-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
}
.pw-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: none;
  color: rgba(255, 255, 255, 0.78);
}
.pw-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #4ce0a8;
  box-shadow: 0 0 10px #4ce0a8;
  animation: pw-pulse 2.2s ease-in-out infinite;
}
.pw-body { display: flex; flex-direction: column; gap: 2px; }
.pw-label {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
}
.pw-amount {
  margin: 0;
  font-family: 'Outfit Variable', 'Outfit', sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: linear-gradient(180deg, #ffffff, #b9efd9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pw-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.38);
}
.pw-sep {
  width: 2px;
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
}
.pw-timer {
  color: #7df0c4;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.pw-btn {
  appearance: none;
  border: 0;
  width: 100%;
  padding: 9px 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #7df0c4, #2ec98f);
  color: #04120c;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 8px 20px -8px rgba(46, 201, 143, 0.8);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pw-btn:hover { box-shadow: 0 10px 26px -8px rgba(46, 201, 143, 0.95); }
.pw-btn:active { transform: scale(0.97); }
.pw-link {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.28);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 0;
  margin: -2px auto 0;
}
.pw-link:hover { color: rgba(255, 255, 255, 0.55); }
.pw-flash .pw-amount { animation: pw-pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pw-flash::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  animation: pw-flash 0.9s ease-out;
  background: radial-gradient(circle at 50% 45%, rgba(76, 224, 168, 0.28), transparent 62%);
}
@keyframes pw-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes pw-pop {
  0% { transform: scale(0.965); filter: brightness(1.35); }
  100% { transform: scale(1); filter: brightness(1); }
}
@keyframes pw-flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`
