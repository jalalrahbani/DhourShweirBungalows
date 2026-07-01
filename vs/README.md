# DhourShweirBungalows — Cinematic V2 Test Site

This is an experimental, more animated GitHub Pages version of the DhourShweirBungalows website.

## What is included

- Cinematic hero section
- Animated aurora / mist / moving background
- Glassmorphism navigation and cards
- Marquee amenities strip
- 3D hover bungalow cards
- Scroll reveal animations
- Live Google Calendar embeds for B1, B2, and B3
- Booking form connected to the existing Google Apps Script URL
- Google Sheets booking collection
- Whish full-payment instructions
- WhatsApp follow-up link
- Mobile responsive layout

## Current pricing inside this version

### 24-hour stays
- B1: $100 / 24 hours
- B2: $150 / 24 hours
- B3: $200 / 24 hours

### Day use — strict 8 hours only
- B1: $70 / 8 hours
- B2: $110 / 8 hours
- B3: $150 / 8 hours

## Recommended way to test without touching the live site

Because your current website is already live from the repository root, the safest test method is to create a `v2/` folder inside your repo and upload this entire package inside it.

Your test URL will become:

```text
https://jalalrahbani.github.io/DhourShweirBungalows/v2/
```

When you approve V2, you can copy the V2 files to the root of the repository and replace the current live version.

## Alternative branch workflow

If you prefer using a branch:

```bash
git checkout -b cinematic-v2
# copy these files into the branch root
git add .
git commit -m "Add cinematic V2 website test"
git push origin cinematic-v2
```

Important: GitHub Pages normally serves only one selected branch/folder per repository. If you switch Pages to the `cinematic-v2` branch, it may replace the current live site. The `v2/` folder method is safer for public testing.

## Assets

The included placeholder assets are:

```text
assets/logo.png
assets/hero.jpg
assets/b1.jpg
assets/b2.jpg
assets/b3.jpg
assets/gallery/pines.jpg
assets/gallery/winter.jpg
assets/gallery/summer.jpg
assets/gallery/bbq.jpg
```

You can replace these images later with real photos using the exact same filenames.

## Google Apps Script URL

The booking form posts to the existing Apps Script URL already placed in `script.js`.

Do not change it unless you create a new deployment.
