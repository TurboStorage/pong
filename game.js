(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const keys = new Set();
  const state = { mode: 'start', score: [0, 0], p1: H / 2, p2: H / 2, ball: null, last: 0 };
  const paddle = { width: 15, height: 104, margin: 38, speed: 430 };
  const ballRadius = 10;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function resetBall(direction = Math.random() < .5 ? -1 : 1) {
    const angle = (Math.random() * .8) - .4;
    state.ball = { x: W / 2, y: H / 2, vx: direction * 390 * Math.cos(angle), vy: 390 * Math.sin(angle), speed: 390 };
  }
  function resetRound(direction = 1) { state.p1 = H / 2; state.p2 = H / 2; resetBall(direction); }
  function startGame() { state.score = [0, 0]; state.mode = 'playing'; resetRound(1); }
  function pauseGame() { state.mode = state.mode === 'playing' ? 'paused' : 'playing'; }
  function point(player) {
    state.score[player]++;
    if (state.score[player] >= 7) { state.mode = `winner-${player + 1}`; return; }
    resetRound(player === 0 ? -1 : 1);
  }
  function update(dt) {
    if (state.mode !== 'playing') return;
    if (keys.has('KeyW')) state.p1 -= paddle.speed * dt;
    if (keys.has('KeyS')) state.p1 += paddle.speed * dt;
    if (keys.has('ArrowUp')) state.p2 -= paddle.speed * dt;
    if (keys.has('ArrowDown')) state.p2 += paddle.speed * dt;
    state.p1 = clamp(state.p1, paddle.height / 2 + 18, H - paddle.height / 2 - 18);
    state.p2 = clamp(state.p2, paddle.height / 2 + 18, H - paddle.height / 2 - 18);
    const b = state.ball;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y - ballRadius <= 18 || b.y + ballRadius >= H - 18) { b.vy *= -1; b.y = clamp(b.y, 18 + ballRadius, H - 18 - ballRadius); }
    const paddles = [{ x: paddle.margin, y: state.p1, direction: 1 }, { x: W - paddle.margin - paddle.width, y: state.p2, direction: -1 }];
    for (const p of paddles) {
      const insideY = b.y + ballRadius >= p.y - paddle.height / 2 && b.y - ballRadius <= p.y + paddle.height / 2;
      const approaching = p.direction === 1 ? b.vx < 0 : b.vx > 0;
      const touchX = p.direction === 1 ? b.x - ballRadius <= p.x + paddle.width && b.x > p.x : b.x + ballRadius >= p.x && b.x < p.x + paddle.width;
      if (insideY && approaching && touchX) {
        const hit = clamp((b.y - p.y) / (paddle.height / 2), -1, 1);
        b.speed = Math.min(b.speed + 26, 760);
        const angle = hit * 1.05;
        b.vx = p.direction * b.speed * Math.cos(angle); b.vy = b.speed * Math.sin(angle);
        b.x = p.direction === 1 ? p.x + paddle.width + ballRadius + 1 : p.x - ballRadius - 1;
      }
    }
    if (b.x + ballRadius < 0) point(1);
    if (b.x - ballRadius > W) point(0);
  }
  function text(value, x, y, size, color = '#e8eee9') { ctx.fillStyle = color; ctx.font = `700 ${size}px "Courier New", monospace`; ctx.textAlign = 'center'; ctx.fillText(value, x, y); }
  function drawPaddle(x, y, color) { ctx.fillStyle = color; ctx.fillRect(x, y - paddle.height / 2, paddle.width, paddle.height); }
  function render() {
    ctx.fillStyle = '#071015'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0c2027'; for (let x = 0; x < W; x += 48) ctx.fillRect(x, 0, 1, H);
    ctx.fillStyle = '#1d4a53'; for (let y = 18; y < H - 18; y += 28) ctx.fillRect(W / 2 - 2, y, 4, 16);
    text(String(state.score[0]), W * .25, 82, 56, '#76dfd6'); text(String(state.score[1]), W * .75, 82, 56, '#f1ad66');
    ctx.font = '12px "Courier New", monospace'; ctx.fillStyle = '#6f9296'; ctx.textAlign = 'center'; ctx.fillText('W / S', W * .25, 110); ctx.fillText('↑ / ↓', W * .75, 110);
    drawPaddle(paddle.margin, state.p1, '#76dfd6'); drawPaddle(W - paddle.margin - paddle.width, state.p2, '#f1ad66');
    const b = state.ball || { x: W / 2, y: H / 2 }; ctx.fillStyle = '#f5f1df'; ctx.beginPath(); ctx.arc(b.x, b.y, ballRadius, 0, Math.PI * 2); ctx.fill();
    if (state.mode !== 'playing') {
      ctx.fillStyle = 'rgba(3, 12, 16, .78)'; ctx.fillRect(0, 0, W, H);
      const win = state.mode.startsWith('winner');
      text(win ? `PLAYER ${state.mode.endsWith('1') ? '1' : '2'} WINS` : state.mode === 'paused' ? 'PAUSED' : 'PONG', W / 2, H / 2 - 42, 36, win && state.mode.endsWith('2') ? '#f1ad66' : '#76dfd6');
      text(win ? 'PRESS SPACE TO PLAY AGAIN' : state.mode === 'paused' ? 'PRESS SPACE TO RESUME' : 'PRESS SPACE TO START', W / 2, H / 2 + 18, 16);
      if (state.mode === 'start') text('FIRST TO 7 · TWO PLAYERS', W / 2, H / 2 + 55, 14, '#9dbbb8');
    }
  }
  function tick(time) { const dt = Math.min((time - state.last) / 1000 || 0, .03); state.last = time; update(dt); render(); requestAnimationFrame(tick); }
  window.render_game_to_text = () => JSON.stringify({ coordinateSystem: 'origin at upper-left; x right, y down', mode: state.mode, score: state.score, paddles: { player1Y: Math.round(state.p1), player2Y: Math.round(state.p2) }, ball: state.ball && { x: Math.round(state.ball.x), y: Math.round(state.ball.y), vx: Math.round(state.ball.vx), vy: Math.round(state.ball.vy) }, controls: 'W/S, ArrowUp/ArrowDown, Space, F' });
  window.advanceTime = (ms) => { const steps = Math.max(1, Math.round(ms / (1000 / 60))); for (let i = 0; i < steps; i++) update(1 / 60); render(); };
  document.addEventListener('keydown', event => {
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
    if (event.code === 'Space' && !event.repeat) { if (state.mode === 'start' || state.mode.startsWith('winner')) startGame(); else pauseGame(); }
    if (event.code === 'KeyF' && !event.repeat) { document.fullscreenElement ? document.exitFullscreen() : canvas.requestFullscreen?.(); }
    keys.add(event.code);
  });
  document.addEventListener('keyup', event => keys.delete(event.code));
  resetBall(1); render(); requestAnimationFrame(tick);
})();
