# DhourShweirBungalows Premium Website

This is a GitHub Pages-ready static website for DhourShweirBungalows.

## Upload these files to your GitHub repository

Upload the full contents of this folder to the root of your repository:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`
- `GOOGLE_APPS_SCRIPT.gs` as backup/reference
- `assets/` folder

## What is included

- Premium mountain cabin visual design
- Animated hero background and soft mist effects
- Scroll reveal animations
- Responsive mobile design
- Local image assets so the website looks good immediately
- Bungalow pricing cards
- Day-use and 24-hour booking options
- Google Calendar availability embeds
- Booking request form connected to your Apps Script URL
- Whish full-payment instructions
- WhatsApp follow-up link
- Google Sheets structure for Bookings, Expenses, and Monthly P&L

## Prices on the site

### 24-hour stays

- B1: $100 / 24 hours
- B2: $150 / 24 hours
- B3: $200 / 24 hours

### Day use, strict 8 hours only

- B1: $70 / 8 hours
- B2: $110 / 8 hours
- B3: $150 / 8 hours

Christmas Eve and New Year’s Eve are not included in the standard prices.

## Assets folder

The current `assets/` folder includes starter visual images so the site does not look empty.

You can replace them anytime with your real photos, but keep the same filenames:

- `assets/logo.png`
- `assets/hero.jpg`
- `assets/b1.jpg`
- `assets/b2.jpg`
- `assets/b3.jpg`
- `assets/gallery/pines.jpg`
- `assets/gallery/winter.jpg`
- `assets/gallery/summer.jpg`
- `assets/gallery/bbq.jpg`

## Booking system

The booking form submits to this Google Apps Script Web App URL:

`https://script.google.com/macros/s/AKfycbyp7d0qYzx2SfFHKU8y4BWBfPE8m-tqwscnmokJ_nD7OVyC-T5rJACHwbIM2xwsQ5sY/exec`

Bookings are request-only. A booking is final only after manual confirmation and full Whish payment.

## Whish payment

Whish number shown on the website:

`+961 03 868418`

Guests are instructed to send the payment screenshot on WhatsApp after transfer.

## GitHub Pages deployment

1. Create a new public GitHub repository.
2. Upload all files and the assets folder.
3. Go to repository Settings → Pages.
4. Set source to Deploy from a branch.
5. Choose branch `main` and folder `/root`.
6. Save and wait a few minutes.

## Monthly P&L

The `GOOGLE_APPS_SCRIPT.gs` file creates these tabs in Google Sheets:

- `Bookings`
- `Expenses`
- `Monthly P&L`

To count confirmed revenue in the P&L tab, manually change a booking status in column Q to exactly:

`Confirmed`
