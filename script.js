/* Corsino Enterprises — shared behaviour across all pages */
(function () {
  'use strict';

  /* Sticky nav border */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Mobile menu */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) { setMenu(false); }
    });
  }

  /* Footer year */
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }

  /* ─────────────────────────────────────────────────────────────
     ENQUIRY FORM  (contact page only)

     Paste your Web3Forms access key between the quotes below and
     enquiries get delivered straight to corsinoenterprises@gmail.com.
     Get a free key in 30 seconds at https://web3forms.com

     Until a key is set, the form falls back to opening the visitor's
     email app with everything pre-filled.
     ───────────────────────────────────────────────────────────── */
  var ACCESS_KEY = 'PASTE_YOUR_WEB3FORMS_KEY_HERE';

  var form = document.getElementById('enquiryForm');
  if (!form) { return; }

  var btn = form.querySelector('.form-btn');
  var status = document.getElementById('formStatus');
  var BTN_LABEL = 'Submit Enquiry';

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status show ' + (kind || '');
  }
  function resetBtn() {
    btn.disabled = false;
    btn.textContent = BTN_LABEL;
    btn.style.background = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var get = function (id) { return (document.getElementById(id).value || '').trim(); };
    var fname = get('fname'), lname = get('lname'), email = get('email');

    if (!fname || !lname || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      say('Please fill in your name and a valid email address.', 'err');
      return;
    }
    if (document.getElementById('company_website').value) { return; }

    var service = get('service') || 'Not specified';
    var subject = 'Website enquiry — ' + service + ' — ' + fname + ' ' + lname;

    if (!ACCESS_KEY || ACCESS_KEY.indexOf('PASTE_YOUR') === 0) {
      var body = [
        'Name: ' + fname + ' ' + lname,
        'Email: ' + email,
        'Contact number: ' + (get('phone') || '—'),
        'Service required: ' + service,
        '',
        'Project details:',
        get('details') || '—'
      ].join('\n');
      window.location.href = 'mailto:corsinoenterprises@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      say('Opening your email app — press send to finish.', 'ok');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    say('Sending your enquiry…');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: subject,
        from_name: 'Corsino Enterprises website',
        replyto: email,
        'Name': fname + ' ' + lname,
        'Email': email,
        'Contact number': get('phone') || '—',
        'Service required': service,
        'Project details': get('details') || '—'
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        form.reset();
        btn.style.background = '#1a6b35';
        btn.textContent = 'Enquiry sent ✓';
        say('Thank you — your enquiry is in. We usually reply within one business day.', 'ok');
        setTimeout(resetBtn, 5000);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    })
    .catch(function () {
      resetBtn();
      say('Sorry — that did not send. Please email corsinoenterprises@gmail.com or call +63 947 862 4409.', 'err');
    });
  });
})();
