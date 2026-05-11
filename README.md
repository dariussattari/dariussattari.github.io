# dariussattari.github.io

This repo is a **GitHub Pages** personal site (plain HTML/CSS/JS).

## Deploy (GitHub Pages)

1. Create a repo named `username.github.io` (or rename this one).
2. Push this code to the `main` branch.
3. In GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**
4. Select `main` (root) and save.

Your site will be live at `https://username.github.io/`.

## Customize

- Edit `site.config.js`
- Add AI posts in `content/ai/` and update `content/ai/index.json`
- Add writing in `content/writing/` and update `content/writing/index.json`
- Add fitness content in `content/fitness/` and recipes in `content/fitness/recipes.json`

## Local preview

Run a local server (recommended so `fetch()` works):

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.
