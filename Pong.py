import tkinter as tk
import random

# ── Constants ──────────────────────────────────────────────────────────────────
W, H         = 900, 600
PAD_W, PAD_H = 14, 90
BALL_R       = 10
PAD_SPEED    = 6
BALL_SPEED   = 5
MAX_SPEED    = 14
FPS          = 60

BG    = "#0a0a0f"
FG    = "#e8e8ff"
PAD1  = "#4fc3f7"
PAD2  = "#ef5350"
BALL  = "#ffffff"
NET   = "#2a2a3a"
SCORE = "#e8e8ff"


class Pong:
    def __init__(self, root):
        self.root = root
        root.title("Pong")
        root.resizable(False, False)
        root.configure(bg=BG)

        self.cv = tk.Canvas(root, width=W, height=H, bg=BG, highlightthickness=0)
        self.cv.pack()

        self._build_scene()
        self._reset_ball(1)

        # Key state tracking
        self.keys = {}
        root.bind("<KeyPress>",   self._key_down)
        root.bind("<KeyRelease>", self._key_up)
        root.bind("<Escape>",     lambda e: root.destroy())

        self.running  = False
        self.paused   = False
        self.score    = [0, 0]

        self._show_start()
        self._loop()

    # ── Scene construction ────────────────────────────────────────────────────

    def _build_scene(self):
        # Net
        for y in range(10, H, 28):
            self.cv.create_rectangle(W//2 - 2, y, W//2 + 2, y + 16,
                                     fill=NET, outline="", tags="net")

        # Scores
        self.score_l = self.cv.create_text(W//4,     60, text="0",
                                           font=("Courier", 56, "bold"),
                                           fill=SCORE, tags="score")
        self.score_r = self.cv.create_text(3*W//4,   60, text="0",
                                           font=("Courier", 56, "bold"),
                                           fill=SCORE, tags="score")

        # Labels
        self.cv.create_text(W//4,   108, text="W / S",
                            font=("Courier", 11), fill="#404060", tags="label")
        self.cv.create_text(3*W//4, 108, text="↑ / ↓",
                            font=("Courier", 11), fill="#404060", tags="label")

        # Paddles
        self.pad1 = self.cv.create_rectangle(
            30, H//2 - PAD_H//2,
            30 + PAD_W, H//2 + PAD_H//2,
            fill=PAD1, outline="", tags="paddle")

        self.pad2 = self.cv.create_rectangle(
            W - 30 - PAD_W, H//2 - PAD_H//2,
            W - 30,         H//2 + PAD_H//2,
            fill=PAD2, outline="", tags="paddle")

        # Ball
        self.ball = self.cv.create_oval(
            W//2 - BALL_R, H//2 - BALL_R,
            W//2 + BALL_R, H//2 + BALL_R,
            fill=BALL, outline="", tags="ball")

        # Overlay text
        self.overlay = self.cv.create_text(W//2, H//2,
                                           text="", font=("Courier", 22, "bold"),
                                           fill=FG, tags="overlay", justify="center")

    # ── Overlays ──────────────────────────────────────────────────────────────

    def _show_start(self):
        self.cv.itemconfig(self.overlay,
            text="PONG\n\nPlayer 1 · W / S\nPlayer 2 · ↑ / ↓\n\nPress SPACE to start")

    def _hide_overlay(self):
        self.cv.itemconfig(self.overlay, text="")

    # ── Ball reset ────────────────────────────────────────────────────────────

    def _reset_ball(self, direction=None):
        cx, cy = W//2, H//2
        self.cv.coords(self.ball,
                       cx - BALL_R, cy - BALL_R,
                       cx + BALL_R, cy + BALL_R)
        if direction is None:
            direction = random.choice((-1, 1))
        angle  = random.uniform(-0.6, 0.6)   # radians from horizontal
        import math
        self.bvx = direction * BALL_SPEED * math.cos(angle)
        self.bvy = BALL_SPEED * math.sin(angle)

    # ── Paddle clamping ───────────────────────────────────────────────────────

    def _clamp_pad(self, tag, dy):
        coords = list(self.cv.coords(tag))
        ny1 = coords[1] + dy
        ny2 = coords[3] + dy
        if ny1 < 0:
            ny1, ny2 = 0, PAD_H
        if ny2 > H:
            ny1, ny2 = H - PAD_H, H
        self.cv.coords(tag, coords[0], ny1, coords[2], ny2)

    # ── Collision helper ──────────────────────────────────────────────────────

    def _overlaps(self, r1, r2):
        return not (r1[2] < r2[0] or r1[0] > r2[2] or
                    r1[3] < r2[1] or r1[1] > r2[3])

    # ── Key handlers ─────────────────────────────────────────────────────────

    def _key_down(self, e):
        self.keys[e.keysym] = True
        if e.keysym == "space":
            if not self.running:
                self.running = True
                self._hide_overlay()
                self._reset_ball(1)
                self.score = [0, 0]
                self._update_score()
                self._reset_paddles()
            else:
                self.paused = not self.paused
                if self.paused:
                    self.cv.itemconfig(self.overlay, text="PAUSED\n\nSPACE to resume")
                else:
                    self._hide_overlay()

    def _key_up(self, e):
        self.keys[e.keysym] = False

    # ── Score display ─────────────────────────────────────────────────────────

    def _update_score(self):
        self.cv.itemconfig(self.score_l, text=str(self.score[0]))
        self.cv.itemconfig(self.score_r, text=str(self.score[1]))

    def _reset_paddles(self):
        self.cv.coords(self.pad1,
                       30, H//2 - PAD_H//2,
                       30 + PAD_W, H//2 + PAD_H//2)
        self.cv.coords(self.pad2,
                       W - 30 - PAD_W, H//2 - PAD_H//2,
                       W - 30,         H//2 + PAD_H//2)

    # ── Main loop ─────────────────────────────────────────────────────────────

    def _loop(self):
        if self.running and not self.paused:
            self._update()
        self.root.after(1000 // FPS, self._loop)

    def _update(self):
        import math

        # ── Move paddles ──
        if self.keys.get("w") or self.keys.get("W"):
            self._clamp_pad(self.pad1, -PAD_SPEED)
        if self.keys.get("s") or self.keys.get("S"):
            self._clamp_pad(self.pad1,  PAD_SPEED)
        if self.keys.get("Up"):
            self._clamp_pad(self.pad2, -PAD_SPEED)
        if self.keys.get("Down"):
            self._clamp_pad(self.pad2,  PAD_SPEED)

        # ── Move ball ──
        bx1, by1, bx2, by2 = self.cv.coords(self.ball)
        bx1 += self.bvx; bx2 += self.bvx
        by1 += self.bvy; by2 += self.bvy
        self.cv.coords(self.ball, bx1, by1, bx2, by2)

        # ── Wall bounce (top / bottom) ──
        if by1 <= 0:
            self.bvy = abs(self.bvy)
        if by2 >= H:
            self.bvy = -abs(self.bvy)

        # ── Paddle collision ──
        ball_r = [bx1, by1, bx2, by2]

        for pad, direction in ((self.pad1, 1), (self.pad2, -1)):
            px1, py1, px2, py2 = self.cv.coords(pad)
            if self._overlaps(ball_r, [px1, py1, px2, py2]):
                # Relative hit position (-1 top … +1 bottom)
                pad_cy  = (py1 + py2) / 2
                ball_cy = (by1 + by2) / 2
                rel     = (ball_cy - pad_cy) / (PAD_H / 2)
                rel     = max(-1.0, min(1.0, rel))

                speed   = min(math.hypot(self.bvx, self.bvy) + 0.4, MAX_SPEED)
                angle   = rel * 1.1           # up to ~63°
                self.bvx = direction * speed * math.cos(angle)
                self.bvy = speed * math.sin(angle)

                # Nudge ball out of paddle
                if direction == 1:
                    self.cv.coords(self.ball, px2 + 1, by1, px2 + 1 + BALL_R*2, by2)
                else:
                    self.cv.coords(self.ball, px1 - 1 - BALL_R*2, by1, px1 - 1, by2)

        # ── Scoring ──
        bx1, by1, bx2, by2 = self.cv.coords(self.ball)
        if bx2 < 0:
            self.score[1] += 1
            self._update_score()
            self._point_reset(1)
        elif bx1 > W:
            self.score[0] += 1
            self._update_score()
            self._point_reset(-1)

        # ── Win check ──
        for i, s in enumerate(self.score):
            if s >= 7:
                winner = "Player 1" if i == 0 else "Player 2"
                color  = PAD1 if i == 0 else PAD2
                self.cv.itemconfig(self.overlay,
                    text=f"{winner} wins!\n\nSPACE to play again", fill=color)
                self.running = False

    def _point_reset(self, direction):
        self._reset_paddles()
        self._reset_ball(direction)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    root = tk.Tk()
    Pong(root)
    root.mainloop()
