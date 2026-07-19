import { prisma } from "@/lib/db";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  conditional?: string[];
}

interface FormConfig {
  title: string;
  fields: FormField[];
}

function buildFieldHtml(field: FormField): string {
  switch (field.type) {
    case "select":
      return `<select id="${field.id}" name="${field.id}">
        ${(field.options ?? []).map((o) => `<option value="${o}">${o}</option>`).join("")}
      </select>`;

    case "checkbox":
      return `<label>
        <input type="checkbox" id="${field.id}" name="${field.id}" />
        <span>${field.label}</span>
      </label>`;

    case "radio":
      return (field.options ?? [])
        .map(
          (o) =>
            `<label>
              <input type="radio" name="${field.id}" value="${o}" /><span>${o}</span>
            </label>`
        )
        .join("");

    case "textarea":
      return `<textarea id="${field.id}" name="${field.id}" rows="3" placeholder="${field.placeholder ?? ""}"></textarea>`;

    default:
      return `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder ?? ""}" />`;
  }
}

function buildRsvpHtml(formConfig: FormConfig | null, slug: string, isPast: boolean, isFull: boolean): string {
  const isOpen = !isPast && !isFull;

  const statusHtml = isPast
    ? `<p>This event has ended. Registration is closed.</p>`
    : isFull
      ? `<p>Registration is closed — event is full.</p>`
      : "";

  if (!isOpen) {
    return `<section id="__rsvp">${statusHtml}</section>`;
  }

  if (!formConfig?.fields?.length) {
    return `<section id="__rsvp"><p>RSVP form coming soon.</p></section>`;
  }

  // Split into regular fields and checkbox-triggered conditional fields
  const checkboxConditionals = new Set(
    formConfig.fields.filter((f) => f.type === "checkbox" && f.conditional?.length).flatMap((f) => f.conditional ?? [])
  );
  const regularFields = formConfig.fields.filter((f) => !checkboxConditionals.has(f.id));

  const fieldsHtml = regularFields
    .map((field) => {
      const isCheckbox = field.type === "checkbox";
      const label = isCheckbox
        ? ""
        : `<label for="${field.id}">${field.label}${field.required ? " *" : ""}</label>`;

      const conditionalFields = field.conditional?.length
        ? `<div id="__cond_${field.id}" style="display:none;">
            ${(field.conditional ?? [])
              .map((condId) => {
                const condField = formConfig.fields.find((f) => f.id === condId);
                if (!condField) return "";
                return `<div>
                  ${
                    condField.id === "plusOneGuests"
                      ? `<div id="__guests_wrap"></div>
                         <button type="button" onclick="__addGuest()">+ Add Guest</button>`
                      : `<label>${condField.label}${condField.required ? " *" : ""}</label>${buildFieldHtml(condField)}`
                  }
                </div>`;
              })
              .join("")}
          </div>`
        : "";

      return `<div id="__wrap_${field.id}">
        ${label}
        ${buildFieldHtml(field)}
        <div id="__err_${field.id}" style="display:none;"></div>
        ${conditionalFields}
      </div>`;
    })
    .join("");

  const hasPlusOne = formConfig.fields.some((f) => f.id === "plusOne" && f.type === "checkbox");

  return `
<section id="__rsvp">
  <h2>${formConfig.title || "RSVP"}</h2>
  <div id="__rsvp_form_wrap">
    <div id="__rsvp_error" style="display:none;"></div>
    <form id="__rsvp_form" novalidate>
      ${fieldsHtml}
      <button type="submit" id="__rsvp_btn">Register</button>
    </form>
  </div>
  <div id="__rsvp_success" style="display:none;">
    <div style="font-size:48px;">🎉</div>
    <h3>Registration Successful!</h3>
    <p>Thank you for registering. We look forward to celebrating with you!</p>
  </div>
  <p style="font-family:'Cormorant Garamond',serif;font-size:18px;margin:44px auto 0;max-width:560px;color:oklch(0.45 0.03 70);">Questions? Call Dr. Deborah Odunze (<a href="tel:+2349139243949" style="color:oklch(0.5 0.09 82);text-decoration:none;">+234 913 924 3949</a>) or Olabisi Aweda (<a href="tel:+2349020664053" style="color:oklch(0.5 0.09 82);text-decoration:none;">+234 902 066 4053</a>).</p>
</section>

<script>
(function() {
  var E164 = /^\\+[1-9][0-9]{7,14}$/;
  var guestCount = 1;
  var MAX_GUESTS = 5;

  function showError(fieldId, msg) {
    var el = document.getElementById('__err_' + fieldId);
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  }

  function clearErrors() {
    document.querySelectorAll('[id^="__err_"]').forEach(function(el) {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  ${
    hasPlusOne
      ? `
  window.__addGuest = function() {
    if (guestCount >= MAX_GUESTS) return;
    var wrap = document.getElementById('__guests_wrap');
    if (!wrap) return;
    var i = guestCount++;
    var div = document.createElement('div');
    div.id = '__guest_' + i;
    div.innerHTML =
      '<div>' +
        '<strong>Guest ' + i + '</strong>' +
        '<button type="button" onclick="this.closest(\\'[id^=__guest_]\\').remove();guestCount--;">Remove</button>' +
      '</div>' +
      '<div>' +
        '<div><label>Title</label>' +
          '<select name="guest_' + i + '_title">' +
            '<option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>' +
          '</select></div>' +
        '<div><label>Full Name *</label>' +
          '<input type="text" name="guest_' + i + '_fullname" placeholder="Jane Doe" /></div>' +
        '<div><label>Phone *</label>' +
          '<input type="tel" name="guest_' + i + '_phone" placeholder="+2348012345678" /></div>' +
        '<div><label>Email</label>' +
          '<input type="email" name="guest_' + i + '_email" placeholder="jane@email.com" /></div>' +
      '</div>';
    wrap.appendChild(div);
  };
  window.__addGuest();
  `
      : ""
  }

  document.querySelectorAll('#__rsvp_form input[type="checkbox"]').forEach(function(cb) {
    var condDiv = document.getElementById('__cond_' + cb.id);
    if (!condDiv) return;
    cb.addEventListener('change', function() {
      condDiv.style.display = this.checked ? 'block' : 'none';
    });
  });

  document.getElementById('__rsvp_form').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();

    var payload = {};
    var valid = true;
    var formEl = document.getElementById('__rsvp_form');

    formEl.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea').forEach(function(el) {
      if (el.name && !el.name.startsWith('guest_')) {
        payload[el.name] = el.value.trim();
      }
    });
    formEl.querySelectorAll('input[type="checkbox"]').forEach(function(el) {
      payload[el.name] = el.checked;
    });
    formEl.querySelectorAll('input[type="radio"]:checked').forEach(function(el) {
      payload[el.name] = el.value;
    });

    ${regularFields
      .filter((f) => f.required && f.type !== "checkbox")
      .map(
        (f) => `
    if (!payload['${f.id}'] || payload['${f.id}'] === '') {
      showError('${f.id}', '${f.label} is required');
      valid = false;
    }${
      f.type === "tel"
        ? ` else if (!E164.test(payload['${f.id}'])) {
      showError('${f.id}', 'Phone must be in E.164 format (e.g., +2348012345678)');
      valid = false;
    }`
        : f.type === "email"
          ? ` else if (payload['${f.id}'] && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload['${f.id}'])) {
      showError('${f.id}', 'Please enter a valid email address');
      valid = false;
    }`
          : ""
    }`
      )
      .join("")}

    ${
      hasPlusOne
        ? `
    if (payload['plusOne']) {
      var guests = [];
      document.querySelectorAll('[id^="__guest_"]').forEach(function(gDiv) {
        var idx = gDiv.id.replace('__guest_', '');
        var fn = gDiv.querySelector('[name="guest_' + idx + '_fullname"]');
        var ph = gDiv.querySelector('[name="guest_' + idx + '_phone"]');
        var em = gDiv.querySelector('[name="guest_' + idx + '_email"]');
        var ti = gDiv.querySelector('[name="guest_' + idx + '_title"]');
        if (!fn || !fn.value.trim()) { valid = false; return; }
        if (!ph || !E164.test(ph.value.trim())) { valid = false; return; }
        guests.push({ title: ti ? ti.value : 'Mr', fullname: fn.value.trim(), phone: ph.value.trim(), email: em ? em.value.trim() : '' });
      });
      payload['plusOneGuests'] = guests;
    } else {
      payload['plusOne'] = false;
      payload['plusOneGuests'] = [];
    }
    `
        : ""
    }

    if (!valid) return;

    var btn = document.getElementById('__rsvp_btn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      var res = await fetch('/events/${slug}/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json().catch(function() { return {}; });
      if (res.ok) {
        document.getElementById('__rsvp_form_wrap').style.display = 'none';
        document.getElementById('__rsvp_success').style.display = 'block';
      } else {
        var errEl = document.getElementById('__rsvp_error');
        errEl.textContent = data.error || 'Registration failed. Please try again.';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Register';
      }
    } catch (err) {
      var errEl = document.getElementById('__rsvp_error');
      errEl.textContent = 'Something went wrong. Please try again.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });
})();
</script>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      date: true,
      capacity: true,
      designContent: true,
      formConfig: true,
    },
  });

  if (!event?.designContent) {
    return new Response("Not found", { status: 404 });
  }

  const registrationCount = await prisma.registration.count({
    where: { eventId: event.id },
  });

  const eventDate = new Date(event.date);
  const now = new Date();
  const isPast = eventDate < now;
  const isFull =
    event.capacity !== null && event.capacity !== undefined
      ? registrationCount >= event.capacity
      : false;

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  let formConfig: FormConfig | null = null;
  if (event.formConfig) {
    try {
      formConfig = JSON.parse(event.formConfig);
    } catch {
      // leave null
    }
  }

  const rsvpHtml = buildRsvpHtml(formConfig, slug, isPast, isFull);

  let html = event.designContent
    .replace(/\{\{eventTitle\}\}/g, event.title)
    .replace(/\{\{eventDate\}\}/g, formattedDate)
    .replace(/\{\{eventTime\}\}/g, formattedTime)
    .replace(/\{\{venue\}\}/g, "");

  // Strip leaked dc-runtime artifact content that may follow {{rsvpForm}} in stored templates.
  // Pattern: {{rsvpForm}} immediately followed by non-whitespace junk up to a </section>.
  if (html.includes("{{rsvpForm}}") && !html.match(/\{\{rsvpForm\}\}\s*\n/)) {
    html = html.replace(/\{\{rsvpForm\}\}[\s\S]*?<\/section>/, "{{rsvpForm}}");
  }

  // Ensure the countdown section (identified by __cd_days) is closed before {{rsvpForm}}.
  // If {{rsvpForm}} appears directly inside the countdown flex container, close it and add
  // an event details section in between.
  if (html.includes("__cd_days") && html.includes("{{rsvpForm}}")) {
    // Check if </section> appears between the countdown heading and {{rsvpForm}}
    const cdIdx = html.indexOf("__cd_days");
    const rsvpIdx = html.indexOf("{{rsvpForm}}");
    const sectionCloseBetween = html.indexOf("</section>", cdIdx);
    if (sectionCloseBetween === -1 || sectionCloseBetween > rsvpIdx) {
      // No </section> before {{rsvpForm}} — countdown section is unclosed; inject close + details
      const DETAILS = `
  </section>

  <!-- EVENT DETAILS -->
  <section style="padding:clamp(60px,8vw,100px) 24px;background:oklch(0.965 0.018 88);text-align:center;">
    <div style="max-width:860px;margin:0 auto;">
      <div style="font-family:'Cinzel',serif;letter-spacing:0.25em;font-size:12px;color:oklch(0.55 0.1 82);margin-bottom:44px;">CELEBRATE WITH US</div>
      <div style="display:flex;justify-content:center;gap:clamp(32px,6vw,80px);flex-wrap:wrap;">
        <div style="min-width:180px;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:oklch(0.6 0.08 82);margin-bottom:12px;">THE DATE</div>
          <p style="font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.2vw,24px);margin:0;color:oklch(0.32 0.04 70);">Saturday, December 26, 2026</p>
        </div>
        <div style="min-width:180px;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:oklch(0.6 0.08 82);margin-bottom:12px;">THE TIME</div>
          <p style="font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.2vw,24px);margin:0;color:oklch(0.32 0.04 70);">Promptly at 11:00 AM</p>
        </div>
        <div style="min-width:180px;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:oklch(0.6 0.08 82);margin-bottom:12px;">THE PLACE</div>
          <p style="font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.2vw,24px);margin:0;color:oklch(0.32 0.04 70);">Lagos, Nigeria</p>
        </div>
      </div>
    </div>
  </section>

  `;
      html = html.slice(0, rsvpIdx) + DETAILS + html.slice(rsvpIdx);
    }
  }

  // Upgrade the __rsvp_styles block to the current version (handles stored old templates)
  const RSVP_STYLES = `<style id="__rsvp_styles">
#__rsvp{padding:clamp(72px,10vw,120px) 24px;background:oklch(0.93 0.025 88);text-align:center;}
#__rsvp h2{font-family:'Cinzel',serif;font-weight:400;font-size:clamp(30px,4.5vw,48px);color:oklch(0.3 0.04 70);margin:0 0 26px;}
#__rsvp_form_wrap{max-width:560px;margin:0 auto;background:oklch(0.965 0.018 88);padding:clamp(32px,5vw,52px);border-top:3px solid oklch(0.72 0.11 82);box-shadow:0 12px 34px oklch(0.3 0.04 70 / 0.1);text-align:left;}
#__rsvp form>div{margin-bottom:22px;}
#__rsvp label:not([style]):not(:has(input[type=checkbox])):not(:has(input[type=radio])){display:block;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.12em;color:oklch(0.5 0.06 70);margin-bottom:8px;text-transform:uppercase;}
#__rsvp label:has(input[type=checkbox]){display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:14px 0;border-top:1px solid oklch(0.88 0.03 88);}
#__rsvp label:has(input[type=checkbox]) span{font-family:'Cormorant Garamond',serif;font-size:19px;color:oklch(0.32 0.04 70);line-height:1.4;}
#__rsvp input[type=text],#__rsvp input[type=email],#__rsvp input[type=tel],#__rsvp select,#__rsvp textarea{width:100%;box-sizing:border-box;padding:14px 16px;font-family:'Cormorant Garamond',serif;font-size:19px;color:oklch(0.28 0.03 70);background:#fff;border:1px solid oklch(0.8 0.05 82);border-radius:2px;outline:none;margin-top:6px;}
#__rsvp input[type=text]:focus,#__rsvp input[type=email]:focus,#__rsvp input[type=tel]:focus,#__rsvp select:focus,#__rsvp textarea:focus{border-color:oklch(0.55 0.1 82);outline:none;}
#__rsvp input[type=checkbox]{width:20px;height:20px;min-width:20px;accent-color:oklch(0.55 0.1 82);cursor:pointer;margin-top:3px;}
#__rsvp [id^=__cond_]{padding:16px;margin-top:8px;background:oklch(0.955 0.015 88);border-left:2px solid oklch(0.78 0.08 82);}
#__rsvp [id^=__cond_]>div{margin-bottom:14px;}
#__rsvp [id^=__cond_] label{display:block !important;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.12em;color:oklch(0.5 0.06 70);margin-bottom:8px;text-transform:uppercase;padding:0 !important;border:none !important;}
#__rsvp_btn{width:100%;margin-top:22px;padding:17px;font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.14em;color:oklch(0.96 0.02 88);background:oklch(0.4 0.06 70);border:none;border-radius:2px;cursor:pointer;transition:background 0.2s;}
#__rsvp_btn:hover{background:oklch(0.34 0.07 70);}
#__rsvp_btn:disabled{opacity:.65;cursor:not-allowed;}
#__rsvp_error{padding:10px 14px;margin-bottom:16px;background:rgba(192,57,43,.08);border-left:3px solid #c0392b;color:#c0392b;text-align:left;font-family:'Cormorant Garamond',serif;font-size:17px;}
#__rsvp_success{padding:48px 24px;text-align:center;}
#__rsvp_success h3{font-family:'Cinzel',serif;font-weight:400;font-size:clamp(22px,3vw,32px);color:oklch(0.3 0.04 70);margin:16px 0 12px;}
#__rsvp_success p{font-family:'Cormorant Garamond',serif;font-size:20px;color:oklch(0.45 0.03 70);}
[id^=__err_]{font-family:'Cormorant Garamond',serif;font-size:15px;color:#c0392b;margin-top:4px;}
</style>`;
  if (html.includes('<style id="__rsvp_styles">')) {
    html = html.replace(/<style id="__rsvp_styles">[\s\S]*?<\/style>/, RSVP_STYLES);
  } else {
    html = html.replace("</head>", `${RSVP_STYLES}\n</head>`);
  }

  if (html.includes("{{rsvpForm}}")) {
    html = html.replace("{{rsvpForm}}", rsvpHtml);
  } else if (html.includes("</body>")) {
    html = html.replace("</body>", `${rsvpHtml}</body>`);
  } else {
    html += rsvpHtml;
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
