# Shashwat Sharma — Portfolio

My personal portfolio: a premium, animated one-page site with a pinned project story, a contact form, and full SEO, AI-search and security setup.

It's plain HTML, CSS and JavaScript with a tiny Python build step. Open it in VS Code, push it to GitHub, and deploy it on Netlify (recommended) or Vercel.

---

## 1. Run it locally

```bash
cd portfolio
python3 build.py              # bundles the CSS (run again after editing any .css file)
python3 -m http.server 8000   # then open http://localhost:8000
```

In VS Code you can use the **Live Server** extension instead: right-click `index.html` and choose **Open with Live Server**. Run `python3 build.py` after CSS edits.

## 2. Before you deploy (one-time checklist)

- [ ] **Set your real address.** The site uses `https://shashwatsharma.netlify.app` everywhere. If your final URL is different, find and replace it in `index.html`, `privacy.html`, `credits.html`, `robots.txt`, `sitemap.xml` and `llms.txt`.
- [ ] **Resume (optional, any time):** save the PDF as `assets/resume/Shashwat-Sharma-Resume.pdf`, then in `index.html` change `<meta name="resume-available" content="no">` to `content="yes"`. All "Download resume" buttons switch on.
- [ ] **GitHub links (optional, any time):** see section 5.

## 3. Deploy

### Netlify (recommended: the contact form works with no extra setup)

1. Push this folder to a GitHub repository.
2. On app.netlify.com, choose **Add new site → Import from Git** and pick the repo. `netlify.toml` already sets the build command (`python3 build.py`) and the publish folder.
3. Under **Site configuration → Change site name**, use `shashwatsharma` so the URL matches the one used in the files, or replace it as described in section 2.
4. Under **Forms**, click **Enable form detection**, then redeploy. Messages from the contact form appear under **Forms**, and you can turn on email notifications to `shashwatdogra13@gmail.com` there.

### Vercel or GitHub Pages

The site works the same way. The contact form can't receive messages on these hosts, so it automatically falls back to opening the visitor's email app with their message pre-filled to you.

## 4. Folder structure

```
portfolio/
├── index.html              ← all page content (edit text here)
├── privacy.html            ← privacy notice (the form collects personal data)
├── credits.html            ← fonts/libraries and their licenses
├── thanks.html             ← shown after a form submission without JavaScript
├── 404.html                ← "page not found"
├── robots.txt  sitemap.xml ← search engines
├── llms.txt                ← plain-text summary for AI assistants (ChatGPT, Claude, Perplexity…)
├── site.webmanifest        ← app icon / install metadata
├── netlify.toml            ← Netlify build, security headers, caching
├── vercel.json             ← the same for Vercel
├── build.py                ← bundles the CSS into assets/css/site.min.css
├── licenses/               ← license texts for the bundled fonts and libraries
└── assets/
    ├── css/                ← source styles (edit these) + site.min.css (generated)
    │   ├── fonts.css  tokens.css  base.css  components.css  sections.css  visuals.css
    │   └── page.css        ← styles for the small text pages
    ├── js/
    │   ├── main.js         ← nav, reveals, modals, gallery, contact form, resume switch
    │   ├── work-scroll.js  ← the pinned "Selected work" scroll story
    │   ├── effects.js      ← cursor, magnetic buttons, 3D tilt, orbit, drag wall
    │   └── vendor/         ← GSAP 3.13 + Lenis (bundled locally)
    ├── fonts/              ← Inter Tight + JetBrains Mono
    ├── img/                ← photos, icons, social share image
    ├── media/              ← hero video loops (desktop + mobile) and posters
    └── resume/             ← put your resume PDF here
```

## 5. Common edits

- **Text:** `index.html`. Search for the words you want to change.
- **Colors and fonts:** `assets/css/tokens.css` (the accent is `--orange`). Run `python3 build.py` afterwards.
- **Hero / final-section video:** replace the files in `assets/media/` and keep the same names.
- **Photos:** replace the files in `assets/img/` and keep the same names.
- **Turn on a GitHub button:** in `index.html`, search for `Coming soon` and replace that element with:

  ```html
  <a class="chip-btn" href="https://github.com/Dogra56/REPO" target="_blank" rel="noopener noreferrer">
    <span><svg class="i"><use href="#i-github"/></svg> View on GitHub</span>
    <i><svg class="i"><use href="#i-arrow-up-right"/></svg></i>
  </a>
  ```

  Do the same inside that project's modal (`<template id="m-…">`).

## 6. What's built in

| Area | Details |
|------|---------|
| **SEO** | Unique title and description, canonical URL, Open Graph and Twitter cards, sitemap, robots.txt, one H1, image sizes (no layout shift), alt text |
| **AEO / GEO** | Schema.org structured data (Person, WebSite, ProfilePage, project list, FAQPage), a visible FAQ, `llms.txt`, AI crawlers explicitly allowed |
| **Security** | Strict Content-Security-Policy (no third-party scripts), HSTS, no-sniff, clickjacking protection, Referrer and Permissions policies, `noopener noreferrer` on external links, form honeypot against spam bots |
| **Privacy** | No cookies, no analytics, no trackers, so no cookie banner is needed. The privacy notice covers the contact form. |
| **Accessibility** | Keyboard focus styles, labelled form fields with error messages, focus trapped inside modals, reduced-motion support, AA color contrast |
| **Performance** | Self-hosted fonts and libraries, a single CSS file, AVIF posters, lazy video, animations paused off-screen |

Lighthouse (tested before delivery): desktop scored 99 performance, 100 accessibility, 100 best practices and 100 SEO. Mobile scored 100 on accessibility, best practices and SEO, with performance around 75–80 under Lighthouse's simulated slow phone.

## 7. Licenses

The fonts are under the SIL Open Font License, GSAP under the GreenSock Standard "No Charge" License, and Lenis under MIT. Details are on `credits.html` and in `/licenses`. The photos, video and all original code and content are © Shashwat Sharma.
