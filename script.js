const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyp7d0qYzx2SfFHKU8y4BWBfPE8m-tqwscnmokJ_nD7OVyC-T5rJACHwbIM2xwsQ5sY/exec';
const WHISH_NUMBER = '+961 03 868418';

const BUNGALOWS = {
  b1: {
    name: 'B1 – Cozy & Intimate',
    overnightPrice: 100,
    dayUsePrice: 100,
    capacity: '1–2 guests',
    maxGuests: 2
  },
  b2: {
    name: 'B2 – Family-friendly Comfort',
    overnightPrice: 150,
    dayUsePrice: 110,
    capacity: '2–4 guests',
    maxGuests: 4
  },
  b3: {
    name: 'B3 – Spacious Luxury',
    overnightPrice: 200,
    dayUsePrice: 150,
    capacity: '4–6 guests',
    maxGuests: 6
  }
};

function $(selector) {
  return document.querySelector(selector);
}

function formatUsd(amount) {
  return `$${Number(amount || 0).toLocaleString('en-US')}`;
}

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
  const checkInDate = $('#checkInDate')?.value;
  const checkOutDate = $('#checkOutDate')?.value;

  let periods = 1;
  let unitPrice = bungalow.overnightPrice;
  let label = '24-hour stay';

  if (bookingType === 'day-use') {
    unitPrice = bungalow.dayUsePrice;
    label = 'day use, strict 8 hours';
  } else {
    periods = getOvernightPeriods(checkInDate, checkOutDate);
  }

  const total = unitPrice * periods;
  return { bungalowKey, bungalow, bookingType, periods, unitPrice, label, total };
}

function updatePriceSummary() {
  const calc = calculateBooking();
  $('#estimatedTotal').textContent = formatUsd(calc.total);
  $('#summaryText').textContent = `${calc.bungalow.name}, ${calc.label}, ${calc.periods} ${calc.periods === 1 ? 'period' : 'periods'}.`;

  const guestsInput = $('#guests');
  if (guestsInput) {
    guestsInput.max = calc.bungalow.maxGuests;
    if (Number(guestsInput.value) > calc.bungalow.maxGuests) guestsInput.value = calc.bungalow.maxGuests;
  }
}

function toggleBookingFields() {
  const type = $('#bookingType').value;
  const overnight = $('#overnightFields');
  const dayUse = $('#dayUseFields');
  const checkIn = $('#checkInDate');
  const checkOut = $('#checkOutDate');
  const dayUseDate = $('#dayUseDate');
  const startTime = $('#preferredStartTime');

  if (type === 'day-use') {
    overnight.classList.add('hidden');
    dayUse.classList.remove('hidden');
    checkIn.required = false;
    checkOut.required = false;
    dayUseDate.required = true;
    startTime.required = true;
  } else {
    overnight.classList.remove('hidden');
    dayUse.classList.add('hidden');
    checkIn.required = true;
    checkOut.required = true;
    dayUseDate.required = false;
    startTime.required = false;
  }

  updatePriceSummary();
}

function openBooking(bungalowKey) {
  $('#bungalow').value = bungalowKey;
  showCalendar(bungalowKey);
  updatePriceSummary();
  document.querySelector('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showCalendar(bungalowKey) {
  document.querySelectorAll('.calendar-button').forEach(button => {
    button.classList.toggle('active', button.dataset.calendar === bungalowKey);
  });

  document.querySelectorAll('.google-calendar').forEach(calendar => {
    calendar.classList.toggle('active', calendar.id === `${bungalowKey}-calendar`);
  });
}

function validateContactMethod() {
  const phone = $('#phone').value.trim();
  const email = $('#email').value.trim();
  if (!phone && !email) {
    throw new Error('Please enter at least one contact method: WhatsApp phone or email.');
  }
}

function validateDates() {
  const type = $('#bookingType').value;

  if (type === 'overnight') {
    const checkIn = $('#checkInDate').value;
    const checkOut = $('#checkOutDate').value;
    if (!checkIn || !checkOut) throw new Error('Please select check-in and check-out dates.');
    if (new Date(checkOut) <= new Date(checkIn)) throw new Error('Check-out date must be after check-in date.');
  } else {
    if (!$('#dayUseDate').value || !$('#preferredStartTime').value) {
      throw new Error('Please select day-use date and preferred start time.');
    }
  }
}

function buildWhatsAppMessage(payload) {
  const lines = [
    'Hello DhourShweirBungalows, I submitted a booking request through the website.',
    `Booking ID: ${payload.bookingId || 'Pending'}`,
    `Type: ${payload.bookingType}`,
    `Bungalow: ${payload.bungalow}`,
    `Name: ${payload.guestName}`,
    `Phone: ${payload.phone || 'N/A'}`,
    `Email: ${payload.email || 'N/A'}`,
    payload.bookingType === '24-hour stay'
      ? `Dates: ${payload.checkInDate} to ${payload.checkOutDate}`
      : `Day use: ${payload.dayUseDate}, preferred start ${payload.preferredStartTime}`,
    `Guests: ${payload.guests}`,
    `Estimated total: $${payload.totalPrice}`,
    '',
    `I understand the booking is confirmed only after full Whish payment to ${WHISH_NUMBER}.`
  ];

  return lines.join('\n');
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
      source: 'Website'
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
    status.innerHTML = `Request submitted. Your estimated total is <strong>${formatUsd(calc.total)}</strong>. Please continue on WhatsApp to confirm availability and send the Whish payment screenshot: <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Open WhatsApp</a>.`;

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

function initMobileNav() {
  const button = $('.mobile-menu-button');
  const links = $('.nav-links');

  button.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }));
}

function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(element => observer.observe(element));
}

function initImageFallbacks() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const parent = img.parentElement;
      if (parent) parent.classList.add('missing-image');
      img.remove();
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

  document.querySelectorAll('.calendar-button').forEach(button => {
    button.addEventListener('click', () => showCalendar(button.dataset.calendar));
  });

  $('#bookingForm').addEventListener('submit', submitBooking);
  initMobileNav();
  initRevealAnimations();
  initImageFallbacks();
  toggleBookingFields();
  updatePriceSummary();
}

document.addEventListener('DOMContentLoaded', init);
