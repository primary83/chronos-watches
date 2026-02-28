#!/usr/bin/env node
/**
 * Add social share buttons to all content pages:
 * - blog-*.html
 * - comparison-*.html
 * - brand-story-*.html
 * - guide-*.html
 * - gift-guide-*.html
 *
 * Places share bars after the title/hero and at the bottom of the article,
 * with inline CSS matching the dark/gold luxury aesthetic.
 */

const fs = require('fs');
const path = require('path');
const glob = require('path');

const DIR = __dirname;

// Gather all target files
const allFiles = fs.readdirSync(DIR).filter(f => {
    return (
        f.startsWith('blog-') ||
        f.startsWith('comparison-') ||
        f.startsWith('brand-story-') ||
        f.startsWith('guide-') ||
        f.startsWith('gift-guide-')
    ) && f.endsWith('.html');
});

// Skip empty placeholder files (< 200 bytes)
const targetFiles = allFiles.filter(f => {
    const stat = fs.statSync(path.join(DIR, f));
    return stat.size > 200;
});

console.log(`Found ${allFiles.length} total content files, ${targetFiles.length} with real content.`);

// --- Share button CSS (injected once into <style> or as inline block) ---
const SHARE_CSS = `
/* Social Share Buttons */
.aw-share-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:18px 0;margin:20px 0}
.aw-share-bar .aw-share-label{font-family:'Cormorant Garamond',Georgia,serif;font-size:0.95rem;color:var(--gold,var(--gold-light,#c4a35a));letter-spacing:0.1em;text-transform:uppercase;margin-right:6px}
.aw-share-bar a{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border:1px solid rgba(196,163,90,0.35);color:rgba(196,163,90,0.8);text-decoration:none;transition:all 0.3s;background:transparent}
.aw-share-bar a:hover{background:rgba(196,163,90,0.15);color:#d4b86a;border-color:#d4b86a}
.aw-share-bar a svg{width:18px;height:18px;fill:currentColor}
.aw-share-bar-bottom{border-top:1px solid rgba(196,163,90,0.2);margin-top:40px;padding-top:8px}
`;

// --- Share button HTML (uses JS to fill in dynamic URL/title) ---
const SHARE_HTML_TOP = `
<div class="aw-share-bar aw-share-bar-top">
    <span class="aw-share-label">Share</span>
    <a href="#" class="aw-share-fb" title="Share on Facebook" aria-label="Share on Facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    </a>
    <a href="#" class="aw-share-tw" title="Share on X (Twitter)" aria-label="Share on X (Twitter)" onclick="window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(location.href)+'&text='+encodeURIComponent(document.title),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>
    <a href="#" class="aw-share-pin" title="Share on Pinterest" aria-label="Share on Pinterest" onclick="window.open('https://pinterest.com/pin/create/button/?url='+encodeURIComponent(location.href)+'&description='+encodeURIComponent(document.title),'_blank','width=600,height=500');return false">
        <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
    </a>
    <a href="#" class="aw-share-reddit" title="Share on Reddit" aria-label="Share on Reddit" onclick="window.open('https://www.reddit.com/submit?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
    </a>
    <a href="#" class="aw-share-email" title="Share via Email" aria-label="Share via Email" onclick="location.href='mailto:?subject='+encodeURIComponent(document.title)+'&body='+encodeURIComponent('Check out this article: '+location.href);return false">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </a>
</div>`;

const SHARE_HTML_BOTTOM = `
<div class="aw-share-bar aw-share-bar-bottom">
    <span class="aw-share-label">Share This Article</span>
    <a href="#" class="aw-share-fb" title="Share on Facebook" aria-label="Share on Facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    </a>
    <a href="#" class="aw-share-tw" title="Share on X (Twitter)" aria-label="Share on X (Twitter)" onclick="window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(location.href)+'&text='+encodeURIComponent(document.title),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>
    <a href="#" class="aw-share-pin" title="Share on Pinterest" aria-label="Share on Pinterest" onclick="window.open('https://pinterest.com/pin/create/button/?url='+encodeURIComponent(location.href)+'&description='+encodeURIComponent(document.title),'_blank','width=600,height=500');return false">
        <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
    </a>
    <a href="#" class="aw-share-reddit" title="Share on Reddit" aria-label="Share on Reddit" onclick="window.open('https://www.reddit.com/submit?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank','width=600,height=400');return false">
        <svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
    </a>
    <a href="#" class="aw-share-email" title="Share via Email" aria-label="Share via Email" onclick="location.href='mailto:?subject='+encodeURIComponent(document.title)+'&body='+encodeURIComponent('Check out this article: '+location.href);return false">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </a>
</div>`;


let modified = 0;
let skipped = 0;
let errors = [];

targetFiles.forEach(filename => {
    const filepath = path.join(DIR, filename);
    let html = fs.readFileSync(filepath, 'utf8');

    // Skip if already has share buttons
    if (html.includes('aw-share-bar')) {
        skipped++;
        console.log(`  SKIP (already has share buttons): ${filename}`);
        return;
    }

    // --- 1. Inject CSS before closing </style> tag ---
    const lastStyleClose = html.lastIndexOf('</style>');
    if (lastStyleClose === -1) {
        errors.push(`${filename}: no </style> tag found`);
        return;
    }
    html = html.substring(0, lastStyleClose) + SHARE_CSS + html.substring(lastStyleClose);

    // --- 2. Inject TOP share bar after first <p> inside article ---
    // Find the article opening tag
    let articleMatch = html.match(/<article\s+class="(?:article-content|content)"[^>]*>/);
    if (!articleMatch) {
        errors.push(`${filename}: no <article> tag found`);
        return;
    }
    const articleStart = html.indexOf(articleMatch[0]) + articleMatch[0].length;

    // Find the first <p> after article start, then insert after it
    // But first check for back-link anchor — skip past it
    let insertPos = articleStart;
    const afterArticle = html.substring(articleStart);

    // Find first paragraph that has real content (not just a back link)
    const firstContentP = afterArticle.match(/<p[\s>][^]*?<\/p>/);
    if (firstContentP) {
        const pEnd = afterArticle.indexOf(firstContentP[0]) + firstContentP[0].length;
        insertPos = articleStart + pEnd;
    }

    html = html.substring(0, insertPos) + '\n' + SHARE_HTML_TOP + '\n' + html.substring(insertPos);

    // --- 3. Inject BOTTOM share bar before </article> ---
    const articleClose = html.lastIndexOf('</article>');
    if (articleClose === -1) {
        errors.push(`${filename}: no </article> closing tag`);
        return;
    }
    html = html.substring(0, articleClose) + '\n' + SHARE_HTML_BOTTOM + '\n' + html.substring(articleClose);

    fs.writeFileSync(filepath, html, 'utf8');
    modified++;
    console.log(`  OK: ${filename}`);
});

console.log(`\nDone! Modified: ${modified}, Skipped: ${skipped}, Errors: ${errors.length}`);
if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log('  ' + e));
}
