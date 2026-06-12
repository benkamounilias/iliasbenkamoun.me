# Ilias Ben Kamoun — Portfolio scientifique + Blog

Un site statique de portfolio scientifique et de blog technique, prêt pour GitHub Pages.

## What is included
- Homepage portfolio avec contenu CV et recherche
- Page blog scientifique
- 3 articles d’exemple orientés IA et data
- Custom domain file for `iliasbenkamoun.me`
- Mise en page responsive et navigation mobile simple

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
- Mettre à jour votre email et vos liens sociaux dans `index.html`
- Remplacer les articles d’exemple par vos vraies publications
- Ajouter d’autres articles dans le dossier `blog/`

## Recommended next improvement
If you want easier blog management later, this static site can be migrated to Astro or Next.js.
