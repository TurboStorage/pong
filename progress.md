Original prompt: the game preview image doesnt show on the software page, seems broken, but works on the show case page. also, we also need to deploy my pong game the same way - both games need to be showcased, visible on gitlab, and have their own in browser play

## 2026-09-05

- Porting Pong from the original tkinter implementation to a browser-playable HTML5 Canvas edition while preserving `Pong.py`.
- Validated the browser game with the required Playwright game client: match start, scoring, pause, resume, and Player 2 movement all work; no browser console errors were reported. Reviewed both game and paused-state screenshots.
- TODO: publish to GitLab and Cloudflare Pages, then link it from the Eyes on Flash software page.
