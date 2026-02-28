#!/usr/bin/env node
/**
 * SEO Upgrade Script for AuthenticWrist.com
 *
 * What it does:
 * 1. Trims meta descriptions over 160 chars (generates concise ones from title)
 * 2. Fixes title duplication bugs
 * 3. Upgrades JSON-LD: homepage gets WebSite+Organization, deals gets ItemList,
 *    brand stories get "about" subject, comparisons get enhanced Article
 * 4. Adds internal cross-links on brand story + comparison pages
 * 5. Rebuilds sitemap.xml to cover all pages
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const DOMAIN = 'https://authenticwrist.com';
const TODAY = '2026-02-27';

// ============================================================
// HELPERS
// ============================================================

function readFile(name) {
    return fs.readFileSync(path.join(DIR, name), 'utf8');
}

function writeFile(name, content) {
    fs.writeFileSync(path.join(DIR, name), content, 'utf8');
}

function allHtmlFiles() {
    return fs.readdirSync(DIR).filter(f => f.endsWith('.html')).sort();
}

function extractTitle(html) {
    const m = html.match(/<title>([^<]*)<\/title>/i);
    return m ? m[1].trim() : '';
}

function extractMetaDesc(html) {
    const m = html.match(/meta\s+name="description"\s+content="([^"]*)"/i);
    return m ? m[1] : '';
}

// Brand name normalizer: "brand-story-a-lange-sohne.html" -> "A. Lange & Söhne"
const BRAND_NAME_MAP = {
    'a-lange-sohne': 'A. Lange & Söhne',
    'alpina': 'Alpina',
    'amazfit': 'Amazfit',
    'anordain': 'Anordain',
    'apple-watch': 'Apple Watch',
    'armin-strom': 'Armin Strom',
    'audemars-piguet': 'Audemars Piguet',
    'ball': 'Ball',
    'baltic': 'Baltic',
    'baume-mercier': 'Baume & Mercier',
    'bell-ross': 'Bell & Ross',
    'blancpain': 'Blancpain',
    'bovet': 'Bovet',
    'breguet': 'Breguet',
    'breitling': 'Breitling',
    'bremont': 'Bremont',
    'bulgari': 'Bulgari',
    'bulova': 'Bulova',
    'carl-f-bucherer': 'Carl F. Bucherer',
    'cartier': 'Cartier',
    'casio': 'Casio',
    'certina': 'Certina',
    'chanel-j12': 'Chanel J12',
    'chopard': 'Chopard',
    'christopher-ward': 'Christopher Ward',
    'chronoswiss': 'Chronoswiss',
    'citizen': 'Citizen',
    'corum': 'Corum',
    'czapek': 'Czapek',
    'dan-henry': 'Dan Henry',
    'daniel-wellington': 'Daniel Wellington',
    'de-bethune': 'De Bethune',
    'doxa': 'Doxa',
    'ebel': 'Ebel',
    'eberhard': 'Eberhard',
    'edox': 'Edox',
    'eterna': 'Eterna',
    'farer': 'Farer',
    'favre-leuba': 'Favre-Leuba',
    'fitbit': 'Fitbit',
    'fortis': 'Fortis',
    'fossil': 'Fossil',
    'fp-journe': 'F.P. Journe',
    'franck-muller': 'Franck Muller',
    'frederique-constant': 'Frederique Constant',
    'furlan-marri': 'Furlan Marri',
    'garmin': 'Garmin',
    'girard-perregaux': 'Girard-Perregaux',
    'glashutte-original': 'Glashütte Original',
    'glycine': 'Glycine',
    'google-pixel-watch': 'Google Pixel Watch',
    'grand-seiko': 'Grand Seiko',
    'greubel-forsey': 'Greubel Forsey',
    'gronefeld': 'Grönefeld',
    'gucci-watches': 'Gucci',
    'h-moser': 'H. Moser & Cie',
    'habring2': 'Habring²',
    'hamilton': 'Hamilton',
    'harry-winston': 'Harry Winston',
    'hermes-watches': 'Hermès',
    'hublot': 'Hublot',
    'invicta': 'Invicta',
    'iwc': 'IWC',
    'jacob-co': 'Jacob & Co',
    'jaeger-lecoultre': 'Jaeger-LeCoultre',
    'jaquet-droz': 'Jaquet Droz',
    'junghans': 'Junghans',
    'kari-voutilainen': 'Kari Voutilainen',
    'laco': 'Laco',
    'laurent-ferrier': 'Laurent Ferrier',
    'longines': 'Longines',
    'louis-moinet': 'Louis Moinet',
    'louis-vuitton-watches': 'Louis Vuitton',
    'maurice-lacroix': 'Maurice Lacroix',
    'mbf': 'MB&F',
    'mido': 'Mido',
    'ming': 'MING',
    'mondaine': 'Mondaine',
    'montblanc': 'Montblanc',
    'moritz-grossmann': 'Moritz Grossmann',
    'movado': 'Movado',
    'muhle-glashutte': 'Mühle Glashütte',
    'mvmt': 'MVMT',
    'nomos': 'NOMOS',
    'norqain': 'Norqain',
    'omega': 'Omega',
    'orient': 'Orient',
    'oris': 'Oris',
    'panerai': 'Panerai',
    'parmigiani-fleurier': 'Parmigiani Fleurier',
    'patek-philippe': 'Patek Philippe',
    'perrelet': 'Perrelet',
    'philippe-dufour': 'Philippe Dufour',
    'piaget': 'Piaget',
    'rado': 'Rado',
    'raymond-weil': 'Raymond Weil',
    'ressence': 'Ressence',
    'richard-mille': 'Richard Mille',
    'roger-dubuis': 'Roger Dubuis',
    'rolex': 'Rolex',
    'samsung-galaxy-watch': 'Samsung Galaxy Watch',
    'seagull': 'Seagull',
    'seiko': 'Seiko',
    'shinola': 'Shinola',
    'sinn': 'Sinn',
    'speake-marin': 'Speake-Marin',
    'squale': 'Squale',
    'steinhart': 'Steinhart',
    'stowa': 'Stowa',
    'swatch': 'Swatch',
    'tag-heuer': 'TAG Heuer',
    'timex': 'Timex',
    'tissot': 'Tissot',
    'tudor': 'Tudor',
    'tutima': 'Tutima',
    'ulysse-nardin': 'Ulysse Nardin',
    'universal-geneve': 'Universal Genève',
    'urwerk': 'Urwerk',
    'vacheron-constantin': 'Vacheron Constantin',
    'victorinox': 'Victorinox',
    'vostok': 'Vostok',
    'vulcain': 'Vulcain',
    'yema': 'Yema',
    'zenith': 'Zenith',
    'zodiac': 'Zodiac'
};

function brandSlugFromFile(filename) {
    let slug = filename.replace('brand-story-', '').replace('.html', '');
    return slug;
}

function brandNameFromSlug(slug) {
    return BRAND_NAME_MAP[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ============================================================
// 1. FIX TITLE DUPLICATION BUGS
// ============================================================

const TITLE_FIXES = {
    'blog-best-dive-watches.html': 'Best Dive Watches for Every Budget — AUTHENTIC WRIST',
    'blog-first-luxury-watch-guide.html': 'Your First Luxury Watch: Complete Beginner\'s Guide 2026 | AuthenticWrist.com',
    'blog-how-to-spot-fake-watch.html': 'How to Spot a Fake Watch — AUTHENTIC WRIST',
    'comparison-rolex-vs-omega-complete.html': 'Rolex vs Omega: Complete Comparison Guide 2026 | AuthenticWrist.com',
    'comparison-speedmaster-vs-daytona.html': 'Speedmaster vs Daytona: Complete Comparison | AuthenticWrist.com'
};

function fixTitleBugs(filename, html) {
    if (TITLE_FIXES[filename]) {
        const oldTitle = extractTitle(html);
        if (oldTitle !== TITLE_FIXES[filename]) {
            html = html.replace(/<title>[^<]*<\/title>/i, `<title>${TITLE_FIXES[filename]}</title>`);
        }
    }
    return html;
}

// ============================================================
// 2. TRIM LONG META DESCRIPTIONS
// ============================================================

function generateShortDesc(filename, title) {
    // Generate a concise <160 char description from the page title/filename
    const clean = title
        .replace(/\s*[—|]\s*(AUTHENTIC WRIST|AuthenticWrist\.com|Authentic Wrist)\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (filename.startsWith('brand-story-')) {
        const slug = brandSlugFromFile(filename);
        const name = brandNameFromSlug(slug);
        return `Explore the history and heritage of ${name}. From founding to iconic models, discover what makes ${name} watches special.`;
    }
    if (filename.startsWith('comparison-')) {
        return `${clean}. Side-by-side comparison of specs, value, heritage, and which is right for you.`;
    }
    if (filename.startsWith('blog-best-')) {
        return `${clean}. Expert picks with specs, pricing, and buying advice from Authentic Wrist.`;
    }
    if (filename.startsWith('blog-')) {
        return `${clean}. Expert advice and insights from Authentic Wrist.`;
    }
    if (filename.startsWith('guide-')) {
        return `${clean}. Comprehensive guide with expert tips from Authentic Wrist.`;
    }
    if (filename.startsWith('directory-')) {
        return `${clean}. Browse models, compare prices, and find authorized retailers.`;
    }
    if (filename.startsWith('gift-guide-')) {
        return `${clean}. Curated gift picks with pricing and buying advice.`;
    }
    // Fallback
    return `${clean}. Curated luxury watch content from Authentic Wrist.`;
}

function trimMetaDesc(filename, html) {
    const desc = extractMetaDesc(html);
    if (desc.length <= 160) return html;

    const title = extractTitle(html);
    let newDesc = generateShortDesc(filename, title);
    // Ensure under 160
    if (newDesc.length > 160) {
        newDesc = newDesc.substring(0, 157) + '...';
    }

    html = html.replace(
        /meta\s+name="description"\s+content="[^"]*"/i,
        `meta name="description" content="${newDesc.replace(/"/g, '&quot;')}"`
    );
    return html;
}

// ============================================================
// 3. UPGRADE JSON-LD STRUCTURED DATA
// ============================================================

function makeHomepageLD() {
    return JSON.stringify([
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Authentic Wrist",
            "url": DOMAIN,
            "description": "Discover luxury watches and smart watches from the world's finest brands. Expert guides, comparisons, and deals.",
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${DOMAIN}/search.html?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Authentic Wrist",
            "url": DOMAIN,
            "logo": `${DOMAIN}/favicon.svg`,
            "sameAs": []
        }
    ], null, 2);
}

function makeDealsLD(desc) {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Watch Deal Hunter",
        "description": desc,
        "url": `${DOMAIN}/deals.html`,
        "numberOfItems": 36,
        "itemListOrder": "https://schema.org/ItemListUnordered",
        "publisher": {
            "@type": "Organization",
            "name": "Authentic Wrist",
            "url": DOMAIN
        }
    }, null, 2);
}

function makeBrandStoryLD(filename, title, desc) {
    const slug = brandSlugFromFile(filename);
    const brandName = brandNameFromSlug(slug);
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title.replace(/\s*[—|]\s*(AUTHENTIC WRIST|AuthenticWrist\.com|Authentic Wrist)\s*/gi, '').trim(),
        "description": desc,
        "url": `${DOMAIN}/${filename}`,
        "datePublished": "2025-11-01",
        "dateModified": TODAY,
        "author": { "@type": "Organization", "name": "Authentic Wrist" },
        "publisher": { "@type": "Organization", "name": "Authentic Wrist", "url": DOMAIN },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${DOMAIN}/${filename}` },
        "about": { "@type": "Brand", "name": brandName }
    }, null, 2);
}

function makeComparisonLD(filename, title, desc) {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title.replace(/\s*[—|]\s*(AUTHENTIC WRIST|AuthenticWrist\.com|Authentic Wrist)\s*/gi, '').trim(),
        "description": desc,
        "url": `${DOMAIN}/${filename}`,
        "datePublished": "2025-11-01",
        "dateModified": TODAY,
        "articleSection": "Watch Comparisons",
        "author": { "@type": "Organization", "name": "Authentic Wrist" },
        "publisher": { "@type": "Organization", "name": "Authentic Wrist", "url": DOMAIN },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${DOMAIN}/${filename}` }
    }, null, 2);
}

function upgradeJsonLd(filename, html) {
    const title = extractTitle(html);
    const desc = extractMetaDesc(html);

    let newLd = null;

    if (filename === 'index.html') {
        newLd = makeHomepageLD();
    } else if (filename === 'deals.html') {
        newLd = makeDealsLD(desc);
    } else if (filename.startsWith('brand-story-')) {
        newLd = makeBrandStoryLD(filename, title, desc);
    } else if (filename.startsWith('comparison-')) {
        newLd = makeComparisonLD(filename, title, desc);
    } else {
        return html; // Leave other pages' JSON-LD as-is
    }

    // Replace existing JSON-LD block
    const ldRegex = /<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i;
    if (ldRegex.test(html)) {
        html = html.replace(ldRegex, `<script type="application/ld+json">\n${newLd}\n    </script>`);
    } else {
        // Insert before </head>
        html = html.replace('</head>', `    <script type="application/ld+json">\n${newLd}\n    </script>\n</head>`);
    }

    return html;
}

// ============================================================
// 4. INTERNAL CROSS-LINKS
// ============================================================

// Build maps of what exists
function buildCrossLinkMaps() {
    const files = allHtmlFiles();

    const brandStories = {};   // slug -> filename
    const comparisons = [];    // [{file, brands:[slug1,slug2]}]
    const blogPosts = {};      // slug -> [filenames mentioning that brand]

    // Brand stories
    files.filter(f => f.startsWith('brand-story-')).forEach(f => {
        const slug = brandSlugFromFile(f);
        brandStories[slug] = f;
    });

    // Comparisons — extract brand slugs from filename
    const brandSlugs = Object.keys(BRAND_NAME_MAP);
    files.filter(f => f.startsWith('comparison-')).forEach(f => {
        const body = f.replace('comparison-', '').replace('.html', '');
        const parts = body.split('-vs-');
        if (parts.length === 2) {
            // Try to match each part to a brand slug
            const matchBrand = (part) => {
                // Try exact match first, then partial
                for (const slug of brandSlugs) {
                    if (part === slug || part.startsWith(slug + '-') || part.endsWith('-' + slug) || part.includes(slug)) {
                        return slug;
                    }
                }
                // Special cases
                const specialMap = {
                    'apple-watch': 'apple-watch',
                    'samsung': 'samsung-galaxy-watch',
                    'fitbit': 'fitbit',
                    'garmin': 'garmin',
                    'black-bay': 'tudor',
                    'seamaster': 'omega',
                    'submariner': 'rolex',
                    'speedmaster': 'omega',
                    'daytona': 'rolex',
                    'el-primero': 'zenith',
                    'tank': 'cartier',
                    'reverso': 'jaeger-lecoultre',
                    'datejust': 'rolex',
                    'aqua-terra': 'omega',
                    'planet-ocean': 'omega',
                    'seamaster-300': 'omega',
                    'frederique-constant': 'frederique-constant',
                    'bell-ross': 'bell-ross',
                    'tag-heuer': 'tag-heuer',
                    'grand-seiko': 'grand-seiko',
                    'rolex-submariner': 'rolex',
                    'tudor-black-bay': 'tudor',
                    'fitbit-sense': 'fitbit',
                    'apple-watch-se': 'apple-watch',
                    'garmin-fenix': 'garmin',
                    'garmin-epix': 'garmin',
                    'glashutte-original': 'glashutte-original',
                    'lange': 'a-lange-sohne',
                    'rolex-complete': 'rolex',
                    'omega-complete': 'omega',
                    'tissot-prx': 'tissot',
                    'seiko-presage': 'seiko',
                    'tudor-tag-heuer': 'tudor'
                };
                for (const [key, val] of Object.entries(specialMap)) {
                    if (part === key || part.startsWith(key)) return val;
                }
                // Try first word
                const first = part.split('-')[0];
                if (BRAND_NAME_MAP[first]) return first;
                return null;
            };

            const b1 = matchBrand(parts[0]);
            const b2 = matchBrand(parts[1]);
            comparisons.push({ file: f, brands: [b1, b2].filter(Boolean) });
        }
    });

    // Blog posts mentioning brands (by filename heuristic)
    files.filter(f => f.startsWith('blog-')).forEach(f => {
        const lower = f.toLowerCase();
        for (const slug of brandSlugs) {
            const brandLower = slug.replace(/-/g, '');
            const brandDash = slug;
            if (lower.includes(brandDash) || lower.includes(brandLower)) {
                if (!blogPosts[slug]) blogPosts[slug] = [];
                blogPosts[slug].push(f);
            }
        }
    });

    return { brandStories, comparisons, blogPosts };
}

function makeRelatedLinksHtml(links, sectionTitle) {
    if (links.length === 0) return '';
    const items = links.map(l =>
        `<a href="${l.url}" style="display:inline-block;padding:8px 18px;margin:4px;border:1px solid var(--gold,#C9A962);color:var(--gold,#C9A962);text-decoration:none;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.3s">${l.label}</a>`
    ).join('');
    return `
    <div style="padding:40px;background:var(--charcoal,#1A1A1A);border-top:1px solid var(--slate,#2A2A2A);margin-top:30px">
        <div style="max-width:1400px;margin:0 auto">
            <h3 style="font-family:var(--font-display,'Cormorant Garamond',Georgia,serif);font-size:1.3rem;font-weight:400;color:var(--gold,#C9A962);margin-bottom:15px;letter-spacing:0.05em">${sectionTitle}</h3>
            <div style="display:flex;flex-wrap:wrap;gap:0">${items}</div>
        </div>
    </div>`;
}

function addCrossLinks(filename, html, maps) {
    const { brandStories, comparisons, blogPosts } = maps;

    if (filename.startsWith('brand-story-')) {
        const slug = brandSlugFromFile(filename);
        const brandName = brandNameFromSlug(slug);
        const links = [];

        // Find comparisons involving this brand
        comparisons.forEach(c => {
            if (c.brands.includes(slug)) {
                const title = extractTitle(readFile(c.file))
                    .replace(/\s*[—|]\s*(AUTHENTIC WRIST|AuthenticWrist\.com|Authentic Wrist)\s*/gi, '')
                    .trim();
                links.push({ url: c.file, label: title.length > 50 ? title.substring(0, 47) + '...' : title });
            }
        });

        // Find blog posts about this brand (max 5)
        const blogs = (blogPosts[slug] || []).slice(0, 5);
        blogs.forEach(b => {
            const title = extractTitle(readFile(b))
                .replace(/\s*[—|]\s*(AUTHENTIC WRIST|AuthenticWrist\.com|Authentic Wrist)\s*/gi, '')
                .trim();
            links.push({ url: b, label: title.length > 50 ? title.substring(0, 47) + '...' : title });
        });

        if (links.length > 0) {
            const section = makeRelatedLinksHtml(links, `More About ${brandName}`);
            html = html.replace('</main>', section + '\n    </main>');
        }
    }

    if (filename.startsWith('comparison-')) {
        // Find the two brands from the comparison map
        const comp = comparisons.find(c => c.file === filename);
        if (comp && comp.brands.length > 0) {
            const links = [];
            comp.brands.forEach(slug => {
                if (brandStories[slug]) {
                    const name = brandNameFromSlug(slug);
                    links.push({ url: brandStories[slug], label: `${name} Brand Story` });
                }
            });
            if (links.length > 0) {
                const section = makeRelatedLinksHtml(links, 'Explore These Brands');
                html = html.replace('</main>', section + '\n    </main>');
            }
        }
    }

    return html;
}

// ============================================================
// 5. REBUILD SITEMAP
// ============================================================

function rebuildSitemap() {
    const files = allHtmlFiles();
    // Exclude utility pages
    const exclude = ['googlec4a4992cd41a409a.html', 'homepage-authenticwrist.html', 'aboutpage-authenticwrist.html'];

    const entries = files
        .filter(f => !exclude.includes(f))
        .map(f => {
            let priority = '0.6';
            let changefreq = 'monthly';
            if (f === 'index.html') { priority = '1.0'; changefreq = 'daily'; }
            else if (f === 'deals.html') { priority = '0.9'; changefreq = 'daily'; }
            else if (f === 'blog.html' || f === 'directories.html' || f === 'compare.html') { priority = '0.8'; changefreq = 'weekly'; }
            else if (f.startsWith('blog-') || f.startsWith('guide-')) { priority = '0.7'; changefreq = 'monthly'; }
            else if (f.startsWith('brand-story-')) { priority = '0.7'; changefreq = 'monthly'; }
            else if (f.startsWith('comparison-')) { priority = '0.7'; changefreq = 'monthly'; }
            else if (f.startsWith('directory-')) { priority = '0.7'; changefreq = 'weekly'; }
            else if (f.startsWith('gift-guide-')) { priority = '0.7'; changefreq = 'monthly'; }
            return `  <url>
    <loc>${DOMAIN}/${f}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
    writeFile('sitemap.xml', xml);
    return entries.length;
}

// ============================================================
// MAIN
// ============================================================

function main() {
    console.log('SEO Upgrade Script for AuthenticWrist.com');
    console.log('==========================================\n');

    const files = allHtmlFiles();
    console.log(`Found ${files.length} HTML files.\n`);

    // Build cross-link maps
    console.log('Building cross-link maps...');
    const maps = buildCrossLinkMaps();
    console.log(`  Brand stories: ${Object.keys(maps.brandStories).length}`);
    console.log(`  Comparisons: ${maps.comparisons.length}`);
    console.log(`  Blog-brand associations: ${Object.keys(maps.blogPosts).length}\n`);

    let titlesFixed = 0;
    let descsTrimmed = 0;
    let ldUpgraded = 0;
    let crossLinked = 0;

    for (const f of files) {
        let html = readFile(f);
        const origHtml = html;

        // 1. Fix title bugs
        const before1 = html;
        html = fixTitleBugs(f, html);
        if (html !== before1) titlesFixed++;

        // 2. Trim long meta descriptions
        const descBefore = extractMetaDesc(html);
        html = trimMetaDesc(f, html);
        const descAfter = extractMetaDesc(html);
        if (descBefore !== descAfter) descsTrimmed++;

        // 3. Upgrade JSON-LD (only key page types)
        const before3 = html;
        html = upgradeJsonLd(f, html);
        if (html !== before3) ldUpgraded++;

        // 4. Add cross-links
        const before4 = html;
        html = addCrossLinks(f, html, maps);
        if (html !== before4) crossLinked++;

        // Write if changed
        if (html !== origHtml) {
            writeFile(f, html);
        }
    }

    // 5. Rebuild sitemap
    console.log('Rebuilding sitemap.xml...');
    const sitemapCount = rebuildSitemap();
    console.log(`  ${sitemapCount} URLs in sitemap.\n`);

    console.log('=== RESULTS ===');
    console.log(`  Title bugs fixed: ${titlesFixed}`);
    console.log(`  Meta descriptions trimmed: ${descsTrimmed}`);
    console.log(`  JSON-LD schemas upgraded: ${ldUpgraded}`);
    console.log(`  Pages with cross-links added: ${crossLinked}`);
    console.log(`  Sitemap rebuilt: ${sitemapCount} URLs`);
    console.log('\nDone!');
}

main();
