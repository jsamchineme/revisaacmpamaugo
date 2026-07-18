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
  const base = `style="width:100%;padding:10px 14px;border:1.5px solid #d4c5aa;border-radius:8px;font-size:.95rem;font-family:inherit;background:#fff;box-sizing:border-box;transition:.2s;" onfocus="this.style.borderColor='#b08642'" onblur="this.style.borderColor='#d4c5aa'"`;

  switch (field.type) {
    case "select":
      return `<select id="${field.id}" name="${field.id}" ${base}>
        ${(field.options ?? []).map((o) => `<option value="${o}">${o}</option>`).join("")}
      </select>`;

    case "checkbox":
      return `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.95rem;">
        <input type="checkbox" id="${field.id}" name="${field.id}" style="width:16px;height:16px;cursor:pointer;" />
        <span>${field.label}</span>
      </label>`;

    case "radio":
      return (field.options ?? [])
        .map(
          (o) =>
            `<label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.95rem;margin-bottom:6px;">
              <input type="radio" name="${field.id}" value="${o}" style="width:16px;height:16px;" /><span>${o}</span>
            </label>`
        )
        .join("");

    case "textarea":
      return `<textarea id="${field.id}" name="${field.id}" rows="3" placeholder="${field.placeholder ?? ""}" ${base} style="width:100%;padding:10px 14px;border:1.5px solid #d4c5aa;border-radius:8px;font-size:.95rem;font-family:inherit;background:#fff;box-sizing:border-box;resize:vertical;"></textarea>`;

    default:
      return `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder ?? ""}" ${base} />`;
  }
}

function buildRsvpHtml(formConfig: FormConfig | null, slug: string, isPast: boolean, isFull: boolean): string {
  const isOpen = !isPast && !isFull;

  const statusHtml = isPast
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;color:#b91c1c;font-size:.9rem;">This event has ended. Registration is closed.</div>`
    : isFull
      ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;color:#b91c1c;font-size:.9rem;">Registration is closed — event is full.</div>`
      : "";

  if (!isOpen) {
    return `<section id="__rsvp" style="padding:48px 24px;max-width:600px;margin:0 auto;font-family:inherit;">${statusHtml}</section>`;
  }

  if (!formConfig?.fields?.length) {
    return `<section id="__rsvp" style="padding:48px 24px;max-width:600px;margin:0 auto;font-family:inherit;"><p style="color:#888;">RSVP form coming soon.</p></section>`;
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
        ? "" // checkbox renders its own label
        : `<label for="${field.id}" style="display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:inherit;">${field.label}${field.required ? ' <span style="color:#e53e3e">*</span>' : ""}</label>`;

      const conditionalFields = field.conditional?.length
        ? `<div id="__cond_${field.id}" style="display:none;margin-top:12px;padding-left:26px;">
            ${(field.conditional ?? [])
              .map((condId) => {
                const condField = formConfig.fields.find((f) => f.id === condId);
                if (!condField) return "";
                return `<div style="margin-bottom:14px;">
                  ${
                    condField.id === "plusOneGuests"
                      ? `<div id="__guests_wrap"></div>
                         <button type="button" onclick="__addGuest()" style="font-size:.85rem;color:#b08642;background:none;border:none;cursor:pointer;padding:0;font-weight:600;">+ Add Guest</button>`
                      : `<label style="display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;">${condField.label}${condField.required ? ' <span style="color:#e53e3e">*</span>' : ""}</label>${buildFieldHtml(condField)}`
                  }
                </div>`;
              })
              .join("")}
          </div>`
        : "";

      return `<div style="margin-bottom:18px;" id="__wrap_${field.id}">
        ${label}
        ${buildFieldHtml(field)}
        <div id="__err_${field.id}" style="display:none;color:#e53e3e;font-size:.8rem;margin-top:4px;"></div>
        ${conditionalFields}
      </div>`;
    })
    .join("");

  // Determine if plus-one is in the config
  const hasPlusOne = formConfig.fields.some((f) => f.id === "plusOne" && f.type === "checkbox");

  return `
<section id="__rsvp" style="padding:48px 24px;max-width:600px;margin:0 auto;font-family:inherit;">
  <div id="__rsvp_form_wrap">
    <h2 style="font-size:1.5rem;margin-bottom:6px;font-family:inherit;">${formConfig.title || "Register"}</h2>
    <div id="__rsvp_error" style="display:none;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;font-size:.9rem;"></div>
    <form id="__rsvp_form" novalidate>
      ${fieldsHtml}
      <button type="submit" id="__rsvp_btn" style="width:100%;padding:14px;background:#5a2231;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s;" onmouseover="this.style.background='#3e1622'" onmouseout="this.style.background='#5a2231'">
        Register
      </button>
    </form>
  </div>
  <div id="__rsvp_success" style="display:none;background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:32px 24px;text-align:center;">
    <div style="font-size:2.5rem;margin-bottom:12px;">🎉</div>
    <h3 style="font-size:1.3rem;margin-bottom:8px;font-family:inherit;">Registration Successful!</h3>
    <p style="color:#555;">Thank you for registering. We look forward to seeing you!</p>
  </div>
</section>

<script>
(function() {
  var E164 = /^\\+[1-9][0-9]{7,14}$/;
  var guestCount = 1;
  var MAX_GUESTS = 5;

  function showError(fieldId, msg) {
    var el = document.getElementById('__err_' + fieldId);
    var input = document.getElementById(fieldId);
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
    if (input) input.style.borderColor = msg ? '#e53e3e' : '#d4c5aa';
  }

  function clearErrors() {
    document.querySelectorAll('[id^="__err_"]').forEach(function(el) {
      el.textContent = '';
      el.style.display = 'none';
    });
    document.querySelectorAll('#__rsvp_form input, #__rsvp_form select, #__rsvp_form textarea').forEach(function(el) {
      el.style.borderColor = '#d4c5aa';
    });
  }

  ${
    hasPlusOne
      ? `
  window.__addGuest = function() {
    if (guestCount >= MAX_GUESTS) return;
    var wrap = document.getElementById('__guests_wrap');
    var i = guestCount++;
    var div = document.createElement('div');
    div.id = '__guest_' + i;
    div.style.cssText = 'border:1px solid #d4c5aa;border-radius:10px;padding:16px;margin-bottom:12px;background:#faf8f4;';
    div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<strong style="font-size:.9rem;">Guest ' + i + '</strong>' +
      '<button type="button" onclick="this.closest(\'[id^=__guest_]\').remove();guestCount--;" style="font-size:.8rem;color:#e53e3e;background:none;border:none;cursor:pointer;">Remove</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
        '<div><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Title</label>' +
          '<select name="guest_' + i + '_title" style="width:100%;padding:8px 10px;border:1.5px solid #d4c5aa;border-radius:8px;font-family:inherit;background:#fff;">' +
            '<option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option>' +
          '</select></div>' +
        '<div><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Full Name *</label>' +
          '<input type="text" name="guest_' + i + '_fullname" placeholder="Jane Doe" style="width:100%;padding:8px 10px;border:1.5px solid #d4c5aa;border-radius:8px;font-family:inherit;" /></div>' +
        '<div><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Phone *</label>' +
          '<input type="tel" name="guest_' + i + '_phone" placeholder="+2348012345678" style="width:100%;padding:8px 10px;border:1.5px solid #d4c5aa;border-radius:8px;font-family:inherit;" /></div>' +
        '<div><label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Email</label>' +
          '<input type="email" name="guest_' + i + '_email" placeholder="jane@email.com" style="width:100%;padding:8px 10px;border:1.5px solid #d4c5aa;border-radius:8px;font-family:inherit;" /></div>' +
      '</div>';
    wrap.appendChild(div);
  };
  // Render first guest slot immediately
  window.__addGuest();
  `
      : ""
  }

  // Toggle conditional fields when a checkbox changes
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

    // Collect all standard fields
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

    // Basic validation
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
    // Collect plus-one guests
    if (payload['plusOne']) {
      var guests = [];
      document.querySelectorAll('[id^="__guest_"]').forEach(function(gDiv) {
        var idx = gDiv.id.replace('__guest_', '');
        var fn = gDiv.querySelector('[name="guest_' + idx + '_fullname"]');
        var ph = gDiv.querySelector('[name="guest_' + idx + '_phone"]');
        var em = gDiv.querySelector('[name="guest_' + idx + '_email"]');
        var ti = gDiv.querySelector('[name="guest_' + idx + '_title"]');
        if (!fn || !fn.value.trim()) { valid = false; fn && (fn.style.borderColor='#e53e3e'); return; }
        if (!ph || !E164.test(ph.value.trim())) { valid = false; ph && (ph.style.borderColor='#e53e3e'); return; }
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
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
