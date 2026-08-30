export function drawTitleTree(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
): void {
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.4, h * 0.55);
  g.addColorStop(0, "rgba(255,107,53,0.16)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0c0c18";
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 97) % w) + Math.sin(t * 0.2 + i) * 2;
    const sy = (i * 53) % (h * 0.7);
    ctx.globalAlpha = 0.35 + (i % 5) * 0.1;
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  const cx = w * 0.5;
  const base = h * 0.88;
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(0, base - 8, w, h - base + 8);

  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(cx, base);
  ctx.lineTo(cx - 4, h * 0.38);
  ctx.stroke();
  ctx.lineWidth = 5;
  const pulse = 0.5 + Math.sin(t * 2) * 0.5;
  ctx.strokeStyle = `rgba(255,107,53,${0.35 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(cx - 1, base - 4);
  ctx.lineTo(cx - 3, h * 0.4);
  ctx.stroke();

  const branches = [
    [-70, 0.55, -110, 0.4],
    [60, 0.52, 120, 0.36],
    [-40, 0.46, -20, 0.3],
    [36, 0.44, 50, 0.28],
    [-20, 0.38, -80, 0.26],
    [18, 0.36, 90, 0.24],
  ];
  for (const [dx, fy, dx2, fy2] of branches) {
    ctx.strokeStyle = "#24160e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, h * fy);
    ctx.lineTo(cx + dx, h * fy2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(233,69,96,${0.25 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, h * fy);
    ctx.lineTo(cx + dx2, h * (fy2 - 0.04));
    ctx.stroke();
  }

  ctx.fillStyle = "#102010";
  for (let i = 0; i < 18; i++) {
    const bx = cx + Math.sin(i * 1.7) * 90;
    const by = h * 0.28 + Math.cos(i * 1.3) * 40;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(bx, by, 28, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 24; i++) {
    const ax = cx + Math.sin(t * 0.7 + i) * 70 + Math.cos(i) * 40;
    const ay = h * 0.35 + Math.cos(t * 0.9 + i * 0.6) * 50;
    ctx.fillStyle = i % 2 ? "#ff6b35" : "#ffd700";
    ctx.globalAlpha = 0.4 + Math.sin(t * 3 + i) * 0.3;
    ctx.fillRect(ax, ay, 2, 2);
  }
  ctx.globalAlpha = 1;

  // roots
  ctx.strokeStyle = "#1a100c";
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, base);
    ctx.quadraticCurveTo(cx + i * 30, base + 10, cx + i * 55, h);
    ctx.stroke();
  }
}
