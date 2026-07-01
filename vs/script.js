const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyp7d0qYzx2SfFHKU8y4BWBfPE8m-tqwscnmokJ_nD7OVyC-T5rJACHwbIM2xwsQ5sY/exec';
const WHISH_NUMBER = '+961 03 868418';

const BUNGALOWS = {
  b1: { name: 'B1 – Cozy & Intimate', overnightPrice: 100, dayUsePrice: 70, capacity: '1–2 guests', maxGuests: 2 },
  b2: { name: 'B2 – Family-friendly Comfort', overnightPrice: 150, dayUsePrice: 110, capacity: '2–4 guests', maxGuests: 4 },
  b3: { name: 'B3 – Spacious Luxury', overnightPrice: 200, dayUsePrice: 150, capacity: '4–6 guests', maxGuests: 6 }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const formatUsd = (amount) => `$${Number(amount || 0).toLocaleString('en-US')}`;

function getTodayISO() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split('T')[0];
}

function getOvernightPeriods(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 1;
  const start = new Date(`${checkInDate}T00:00:00`);
  const end = new Date(`${checkOutDate}T00:00:00`);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function calculateBooking() {
  const bungalowKey = $('#bungalow')?.value || 'b1';
  const bookingType = $('#bookingType')?.value || 'overnight';
  const bungalow = BUNGALOWS[bungalowKey];
  let periods = 1;
  let unitPrice = bungalow.overnightPrice;
  let label = '24-hour stay';

  if (bookingType === 'day-use') {
    unitPrice = bungalow.dayUsePrice;
    label = 'day use, strict 8 hours';
  } else {
    periods = getOvernightPeriods($('#checkInDate')?.value, $('#checkOutDate')?.value);
  }

  return { bungalowKey, bungalow, bookingType, periods, unitPrice, label, total: unitPrice * periods };
}

function updatePriceSummary() {
  const calc = calculateBooking();
  $('#estimatedTotal').textContent = formatUsd(calc.total);
  $('#summaryText').textContent = `${calc.bungalow.name}, ${calc.label}, ${calc.periods} ${calc.periods === 1 ? 'period' : 'periods'}.`;

  const guestsInput = $('#guests');
  guestsInput.max = calc.bungalow.maxGuests;
  if (Number(guestsInput.value) > calc.bungalow.maxGuests) guestsInput.value = calc.bungalow.maxGuests;
}

function toggleBookingFields() {
  const type = $('#bookingType').value;
  const overnightFields = $('#overnightFields');
  const dayUseFields = $('#dayUseFields');
  const checkIn = $('#checkInDate');
  const checkOut = $('#checkOutDate');
  const dayUseDate = $('#dayUseDate');
  const startTime = $('#preferredStartTime');

  if (type === 'day-use') {
    overnightFields.classList.add('hidden');
    dayUseFields.classList.remove('hidden');
    checkIn.required = false;
    checkOut.required = false;
    dayUseDate.required = true;
    startTime.required = true;
  } else {
    overnightFields.classList.remove('hidden');
    dayUseFields.classList.add('hidden');
    checkIn.required = true;
    checkOut.required = true;
    dayUseDate.required = false;
    startTime.required = false;
  }
  updatePriceSummary();
}

function showCalendar(bungalowKey) {
  $$('.calendar-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.calendar === bungalowKey));
  $$('.google-calendar').forEach(calendar => calendar.classList.toggle('active', calendar.id === `${bungalowKey}-calendar`));
}

function openBooking(bungalowKey) {
  $('#bungalow').value = bungalowKey;
  showCalendar(bungalowKey);
  updatePriceSummary();
  $('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateContactMethod() {
  const phone = $('#phone').value.trim();
  const email = $('#email').value.trim();
  if (!phone && !email) throw new Error('Please enter at least one contact method: WhatsApp phone or email.');
}

function validateDates() {
  const type = $('#bookingType').value;
  if (type === 'overnight') {
    const checkIn = $('#checkInDate').value;
    const checkOut = $('#checkOutDate').value;
    if (!checkIn || !checkOut) throw new Error('Please select check-in and check-out dates.');
    if (new Date(checkOut) <= new Date(checkIn)) throw new Error('Check-out date must be after check-in date.');
  } else {
    if (!$('#dayUseDate').value || !$('#preferredStartTime').value) throw new Error('Please select day-use date and preferred start time.');
  }
}

function buildWhatsAppMessage(payload) {
  return [
    'Hello DhourShweirBungalows, I submitted a booking request through the website.',
    `Booking ID: ${payload.bookingId}`,
    `Type: ${payload.bookingType}`,
    `Bungalow: ${payload.bungalow}`,
    `Name: ${payload.guestName}`,
    `Phone: ${payload.phone || 'N/A'}`,
    `Email: ${payload.email || 'N/A'}`,
    payload.bookingType === '24-hour stay' ? `Dates: ${payload.checkInDate} to ${payload.checkOutDate}` : `Day use: ${payload.dayUseDate}, preferred start ${payload.preferredStartTime}`,
    `Guests: ${payload.guests}`,
    `Estimated total: $${payload.totalPrice}`,
    '',
    `I understand the booking is confirmed only after full Whish payment to ${WHISH_NUMBER}.`
  ].join('\n');
}

async function submitBooking(event) {
  event.preventDefault();
  const status = $('#formStatus');
  status.textContent = '';
  status.className = 'form-status';

  try {
    validateContactMethod();
    validateDates();

    const calc = calculateBooking();
    const bookingId = `DSB-${Date.now()}`;
    const bookingTypeLabel = calc.bookingType === 'overnight' ? '24-hour stay' : 'Day use - strict 8 hours';

    const payload = {
      bookingId,
      bookingType: bookingTypeLabel,
      bungalow: calc.bungalow.name,
      guestName: $('#guestName').value.trim(),
      phone: $('#phone').value.trim(),
      email: $('#email').value.trim(),
      checkInDate: $('#checkInDate').value || '',
      checkOutDate: $('#checkOutDate').value || '',
      dayUseDate: $('#dayUseDate').value || '',
      preferredStartTime: $('#preferredStartTime').value || '',
      guests: $('#guests').value,
      periods: calc.periods,
      unitPrice: calc.unitPrice,
      totalPrice: calc.total,
      paymentStatus: 'Pending full Whish payment',
      bookingStatus: 'Request received - pending manual confirmation',
      notes: $('#notes').value.trim(),
      source: 'Website v2 cinematic'
    };

    status.textContent = 'Submitting your booking request...';

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const whatsappUrl = `https://wa.me/9613868418?text=${encodeURIComponent(buildWhatsAppMessage(payload))}`;
    status.classList.add('success');
    status.innerHTML = `Request submitted. Estimated total: <strong>${formatUsd(calc.total)}</strong>. Continue on WhatsApp to confirm availability and send the Whish payment screenshot: <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Open WhatsApp</a>.`;

    event.target.reset();
    $('#bookingType').value = 'overnight';
    $('#bungalow').value = calc.bungalowKey;
    toggleBookingFields();
    updatePriceSummary();
  } catch (error) {
    status.classList.add('error');
    status.textContent = error.message || 'Something went wrong. Please try again or contact us on WhatsApp.';
  }
}

function initRevealAnimations() {
  const elements = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}

function initScrollProgress() {
  const bar = $('.scroll-progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${Math.max(0, Math.min(1, window.scrollY / max)) * 100}%`;
  }, { passive: true });
}

function initCursorGlow() {
  const glow = $('.cursor-glow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.magnetic-btn, .submit-btn, .book-chip').forEach(button => {
    button.addEventListener('mousemove', event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px) translateY(-3px)`;
    });
    button.addEventListener('mouseleave', () => { button.style.transform = ''; });
  });
}

function initTiltCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

function initMobileMenu() {
  const button = $('.menu-toggle');
  const links = $('.nav-links');
  button.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    button.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    button.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }));
}

function initImageFallbacks() {
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) parent.style.background = 'linear-gradient(135deg, #123322, #b98549)';
    });
  });
}

function init() {
  const today = getTodayISO();
  ['checkInDate', 'checkOutDate', 'dayUseDate'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.min = today;
  });

  $('#bookingType').addEventListener('change', toggleBookingFields);
  $('#bungalow').addEventListener('change', () => {
    showCalendar($('#bungalow').value);
    updatePriceSummary();
  });
  ['checkInDate', 'checkOutDate', 'dayUseDate', 'preferredStartTime', 'guests'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.addEventListener('input', updatePriceSummary);
  });
  $$('.calendar-tab').forEach(tab => tab.addEventListener('click', () => showCalendar(tab.dataset.calendar)));
  $$('[data-open-booking]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.openBooking)));
  $('#bookingForm').addEventListener('submit', submitBooking);

  initScrollProgress();
  initCursorGlow();
  initRevealAnimations();
  initMagneticButtons();
  initTiltCards();
  initMobileMenu();
  initImageFallbacks();
  toggleBookingFields();
  updatePriceSummary();
}

document.addEventListener('DOMContentLoaded', init);
