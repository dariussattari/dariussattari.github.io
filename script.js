/* global SITE_CONFIG */
(function () {
  const config = window.SITE_CONFIG || {};

  const el = (id) => document.getElementById(id);
  const $modal = el("modal");
  const $modalTitle = el("modalTitle");
  const $modalBody = el("modalBody");

  function setText(id, value) {
    const node = el(id);
    if (!node) return;
    node.textContent = value ?? "";
  }

  function safeUrl(url) {
    try {
      return new URL(url).toString();
    } catch {
      return "";
    }
  }

  function isSameOriginHttp(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function normalize(text) {
    return String(text ?? "").toLowerCase();
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    const icon = el("themeIcon");
    if (icon) icon.textContent = theme === "light" ? "◑" : "◐";
  }

  function initTheme() {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      return;
    }

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  function initHeader() {
    setText("heroEyebrow", config.role || "Engineer • Builder • Lifelong learner");
    setText("heroSubtitle", config.tagline || "");
    setText("footerName", config.name || "");
    setText("year", String(new Date().getFullYear()));

    const githubUsername = config.githubUsername || "";
    const githubUrl = githubUsername ? `https://github.com/${githubUsername}` : "";
    const $githubProfileLink = el("githubProfileLink");
    if ($githubProfileLink) {
      $githubProfileLink.href = githubUrl || "#";
      $githubProfileLink.style.pointerEvents = githubUrl ? "auto" : "none";
      $githubProfileLink.style.opacity = githubUrl ? "1" : "0.6";
    }

    const $chips = el("socialChips");
    if ($chips && Array.isArray(config.socials)) {
      $chips.replaceChildren(
        ...config.socials
          .filter((s) => isSameOriginHttp(s?.href || "") || safeUrl(s?.href || ""))
          .map((s) => {
            const a = document.createElement("a");
            a.className = "chip";
            a.target = "_blank";
            a.rel = "noreferrer";
            a.href = s.href;
            a.textContent = s.label;
            return a;
          })
      );
    }

    const $contactLinks = el("contactLinks");
    if ($contactLinks) {
      const items = [];
      const emails = Array.isArray(config.emails)
        ? config.emails.filter(Boolean)
        : config.email
          ? [config.email]
          : [];
      for (const email of emails) {
        items.push({ label: email, href: `mailto:${email}`, meta: "Email" });
      }
      if (githubUrl) {
        items.push({ label: "GitHub", href: githubUrl, meta: `@${githubUsername}` });
      }
      if (Array.isArray(config.socials)) {
        for (const s of config.socials) {
          if (!s?.href || s?.label === "GitHub") continue;
          items.push({ label: s.label, href: s.href, meta: "" });
        }
      }

      $contactLinks.replaceChildren(...items.map(toListItem));
    }

  }

  function toListItem(item) {
    const li = document.createElement("li");
    li.className = "list__item";

    const a = document.createElement("a");
    a.href = item.href;
    a.target = item.href.startsWith("http") ? "_blank" : "_self";
    if (a.target === "_blank") a.rel = "noreferrer";
    a.textContent = item.label;

    const meta = document.createElement("span");
    meta.className = "list__meta";
    meta.textContent = item.meta || "";

    li.append(a, meta);
    return li;
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return res.json();
  }

  async function fetchText(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return res.text();
  }

  async function ensureMarked() {
    if (window.marked?.parse) return window.marked;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js";
    script.defer = true;
    document.head.appendChild(script);
    for (let i = 0; i < 60; i++) {
      if (window.marked?.parse) return window.marked;
      await sleep(50);
    }
    throw new Error("Markdown renderer failed to load");
  }

  async function openMarkdownModal({ title, mdPath }) {
    $modalTitle.textContent = title || "Post";
    $modalBody.innerHTML = `<p class="muted">Loading…</p>`;
    $modal.showModal();

    try {
      const [marked, md] = await Promise.all([ensureMarked(), fetchText(mdPath)]);
      $modalBody.innerHTML = marked.parse(md, { mangle: false, headerIds: true });
    } catch (err) {
      $modalBody.innerHTML = `<p class="muted">Couldn’t load this post.</p><pre><code>${escapeHtml(
        err?.message || String(err)
      )}</code></pre>`;
    }
  }

  function renderPostList({ listEl, index, emptyMessage }) {
    if (!listEl) return;
    if (!Array.isArray(index?.items) || index.items.length === 0) {
      const li = document.createElement("li");
      li.className = "list__item";
      li.textContent = emptyMessage || "Nothing here yet.";
      listEl.replaceChildren(li);
      return;
    }

    listEl.replaceChildren(
      ...index.items.map((post) => {
        const li = document.createElement("li");
        li.className = "list__item";
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = post.title || "Untitled";
        a.addEventListener("click", (e) => {
          e.preventDefault();
          openMarkdownModal({ title: post.title, mdPath: post.path });
        });
        const meta = document.createElement("span");
        meta.className = "list__meta";
        meta.textContent = post.date || "";
        li.append(a, meta);
        return li;
      })
    );
  }

  async function initContent() {
    const [$researchIndex, $fitnessIndex, $mediaIndex] = await Promise.all([
      fetchJson("content/research/index.json"),
      fetchJson("content/fitness/index.json"),
      fetchJson("content/media.json"),
    ]);

    const undergradIndex = { items: Array.isArray($researchIndex?.undergrad) ? $researchIndex.undergrad : [] };
    const gradIndex = { items: Array.isArray($researchIndex?.grad) ? $researchIndex.grad : [] };
    renderPostList({
      listEl: el("undergradResearchList"),
      index: undergradIndex,
      emptyMessage: "Add items to content/research/index.json (undergrad).",
    });
    renderPostList({
      listEl: el("gradResearchList"),
      index: gradIndex,
      emptyMessage: "Add items to content/research/index.json (grad).",
    });
    renderPostList({
      listEl: el("fitnessList"),
      index: $fitnessIndex,
      emptyMessage: "Add Markdown resources to content/fitness/.",
    });

    const mediaList = el("mediaList");
    if (mediaList) {
      const items = Array.isArray($mediaIndex?.items) ? $mediaIndex.items : [];
      mediaList.replaceChildren(...items.map(toListItem));
    }
  }

  function subjectMatchesRepo(subject, repo) {
    if (!subject || subject.id === "all") return true;
    const languages = subject?.match?.languages || [];
    const keywords = subject?.match?.keywords || [];

    if (languages.length > 0 && repo.language && languages.includes(repo.language)) return true;

    const hay = normalize(`${repo.name} ${repo.description || ""}`);
    return keywords.some((k) => hay.includes(normalize(k)));
  }

  function buildSubjectOptions() {
    const subjects = Array.isArray(config.projectSubjects) ? config.projectSubjects : [];
    const select = el("subjectFilter");
    if (!select) return [];

    select.replaceChildren(
      ...subjects.map((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.label;
        return opt;
      })
    );
    select.value = subjects[0]?.id || "all";
    return subjects;
  }

  function repoCard(repo) {
    const card = document.createElement("article");
    card.className = "card";

    const top = document.createElement("div");
    top.className = "card__top";

    const h = document.createElement("h3");
    h.className = "card__title";
    const a = document.createElement("a");
    a.className = "link";
    a.href = repo.html_url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = repo.name;
    h.appendChild(a);

    const right = document.createElement("div");
    right.className = "meta";
    if (repo.language) right.appendChild(tag(repo.language));
    if (repo.stargazers_count) right.appendChild(tag(`★ ${repo.stargazers_count}`));
    top.append(h, right);

    const desc = document.createElement("p");
    desc.className = "card__desc";
    desc.textContent = repo.description || "—";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(tag(repo.fork ? "fork" : "repo"));
    if (repo.archived) meta.appendChild(tag("archived"));
    if (repo.updated_at) meta.appendChild(tag(`updated ${new Date(repo.updated_at).toLocaleDateString()}`));

    card.append(top, desc, meta);
    return card;
  }

  function tag(text) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = text;
    return span;
  }

  async function fetchAllRepos(username, maxRepos) {
    const perPage = 100;
    const repos = [];

    for (let page = 1; ; page++) {
      const url = `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?per_page=${perPage}&page=${page}&sort=updated`;

      const res = await fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
      });

      if (res.status === 403) {
        const reset = res.headers.get("X-RateLimit-Reset");
        const msg = reset
          ? `GitHub API rate limit hit. Try again after ${new Date(Number(reset) * 1000).toLocaleTimeString()}.`
          : "GitHub API rate limit hit. Try again later.";
        throw new Error(msg);
      }

      if (!res.ok) throw new Error(`GitHub API error (${res.status})`);
      const pageRepos = await res.json();
      repos.push(...pageRepos);
      if (pageRepos.length < perPage) break;
      if (Number.isFinite(maxRepos) && maxRepos > 0 && repos.length >= maxRepos) break;
    }

    if (Number.isFinite(maxRepos) && maxRepos > 0) return repos.slice(0, maxRepos);
    return repos;
  }

  function initProjects() {
    const subjectSelect = el("subjectFilter");
    const search = el("projectSearch");
    const grid = el("projectGrid");
    const meta = el("projectMeta");

    const subjects = buildSubjectOptions();
    const username = config.githubUsername || "";
    if (!username || !grid || !meta) {
      meta.textContent = "Set your GitHub username in site.config.js to load projects.";
      return;
    }

    const settings = config.projectSettings || {};
    const excludeRepoNames = Array.isArray(config.excludeRepoNames) ? config.excludeRepoNames : [];
    const excludeSet = new Set(excludeRepoNames.map((n) => normalize(n)));

    let allRepos = [];
    let lastRenderedCount = 0;

    function getSelectedSubject() {
      const selected = subjectSelect?.value || "all";
      return subjects.find((s) => s.id === selected) || subjects[0];
    }

    function applyFilters() {
      const q = normalize(search?.value || "");
      const subject = getSelectedSubject();
      const includeForks = true;

      const filtered = allRepos
        .filter((r) => (includeForks ? true : !r.fork))
        .filter((r) => (settings.includeArchived ? true : !r.archived))
        .filter((r) => (excludeSet.size ? !excludeSet.has(normalize(r.name)) : true))
        .filter((r) => subjectMatchesRepo(subject, r))
        .filter((r) => {
          if (!q) return true;
          const hay = normalize(`${r.name} ${r.language || ""} ${r.description || ""}`);
          return hay.includes(q);
        })
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      grid.replaceChildren(...filtered.map(repoCard));
      lastRenderedCount = filtered.length;
      meta.textContent = `${filtered.length} repos shown • ${allRepos.length} fetched`;
    }

    async function load() {
      meta.textContent = "Loading projects from GitHub…";
      try {
        const maxRepos =
          Number.isFinite(settings.maxRepos) && settings.maxRepos >= 0 ? settings.maxRepos : 0;
        allRepos = await fetchAllRepos(username, maxRepos);
        meta.textContent = `Loaded ${allRepos.length} repos.`;
        applyFilters();
      } catch (err) {
        meta.textContent = err?.message || "Couldn’t load GitHub repos.";
      }
    }

    subjectSelect?.addEventListener("change", applyFilters);
    search?.addEventListener("input", () => {
      applyFilters();
      if (lastRenderedCount === 0) meta.textContent = "No matching repos.";
    });

    load();
  }

  function initThemeToggle() {
    const btn = el("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initExternalLinkSafety() {
    document.addEventListener("click", (e) => {
      const a = e.target?.closest?.("a");
      if (!a) return;
      if (!a.href) return;
      if (a.target !== "_blank") return;
      if (!a.rel.includes("noreferrer")) a.rel = `${a.rel} noreferrer`.trim();
    });
  }

  async function main() {
    initTheme();
    initThemeToggle();
    initHeader();
    initExternalLinkSafety();

    try {
      await initContent();
    } catch {
      // Non-fatal: site still usable without posts loaded.
    }

    initProjects();
  }

  window.addEventListener("DOMContentLoaded", main);
})();
