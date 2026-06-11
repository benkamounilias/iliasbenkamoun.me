# Ilias Ben Kamoun — Portfolio + Blog

A simple static portfolio and blog website ready for GitHub Pages.

## What is included
- Portfolio homepage with CV content
- Blog landing page
- 3 sample blog posts
- Custom domain file for `iliasbenkamoun.me`
- Responsive layout and simple mobile navigation

## Local use
This is a static site, so you can open `index.html` directly in a browser.

For a better local preview, use any static server. Example:
- VS Code Live Server extension, or
- Python/Node static server if you already have one installed

## Deploy on GitHub Pages
1. Create a GitHub repository and push these files to the default branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch that contains this site and the root folder `/`.
5. Save.
6. Wait for GitHub Pages to publish the site.

## Custom domain setup
1. Keep the `CNAME` file in the repository root with:
   - `iliasbenkamoun.me`
2. In Namecheap DNS, add these A records for the root domain:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a `www` CNAME record pointing to your GitHub Pages domain if you want `www.iliasbenkamoun.me` too.
4. In GitHub Pages settings, add the custom domain `iliasbenkamoun.me`.
5. Enable HTTPS once GitHub finishes validating the domain.

## Edit content
- Update your email and social links in `index.html`
- Replace placeholder blog text with your real posts
- Add more posts in the `blog/` folder

## Recommended next improvement
If you want easier blog management later, this static site can be migrated to Astro or Next.js.
