import { prisma } from "@/lib/db";
import { FormField, FormConfig } from "@/lib/form-config-types";
import { COUNTRIES } from "@/lib/countries";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPhoneCountryListItems(): string {
  return COUNTRIES.map((c) => {
    const iso = c.isoCode.toLowerCase();
    return `<li><button type="button" onclick="__selPhone(this,'${c.dialCode}','${iso}')" style="display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:transparent;cursor:pointer;font-size:13px;text-align:left;" onmouseover="this.style.background='oklch(0.95 0.015 88)'" onmouseout="this.style.background='transparent'"><img src="https://flagcdn.com/w20/${iso}.png" width="20" height="15" style="border-radius:2px;object-fit:cover;flex-shrink:0;" /><span style="flex:1;">${escapeHtml(c.name)}</span><span style="color:#888;flex-shrink:0;">${c.dialCode}</span></button></li>`;
  }).join("");
}

function buildPhoneGroupHtml(id: string, name: string, placeholder: string): string {
  const listItems = buildPhoneCountryListItems();
  const dropStyle = "display:none;position:absolute;top:calc(100% + 2px);left:0;z-index:1000;width:280px;background:#fff;border:1px solid oklch(0.8 0.05 82);border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.12);overflow:hidden;";
  return `<div class="__phone_group" style="position:relative;display:flex;margin-top:10px;">
  <button type="button" onclick="__togPhone(this)" style="flex-shrink:0;width:110px;display:flex;align-items:center;gap:6px;padding:14px 12px;border:1px solid oklch(0.8 0.05 82);border-right:none;border-radius:2px 0 0 2px;background:oklch(0.955 0.015 88);cursor:pointer;white-space:nowrap;font-family:inherit;font-size:19px;box-sizing:border-box;">
    <img class="__phone_flag" src="https://flagcdn.com/w20/ng.png" width="20" height="15" style="border-radius:2px;object-fit:cover;flex-shrink:0;" />
    <span class="__phone_code" style="font-weight:500;flex:1;text-align:left;">+234</span>
    <span style="font-size:12px;color:#888;">▾</span>
  </button>
  <div class="__phone_drop" style="${dropStyle}">
    <div style="padding:8px;border-bottom:1px solid oklch(0.88 0.03 88);">
      <input type="text" placeholder="Search country…" oninput="__filtPhone(this)" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid oklch(0.8 0.05 82);border-radius:2px;font-size:13px;outline:none;font-family:inherit;" />
    </div>
    <ul class="__phone_list" style="max-height:220px;overflow-y:auto;list-style:none;margin:0;padding:0;">${listItems}</ul>
  </div>
  <input type="tel" class="__phone_num" placeholder="${escapeHtml(placeholder || "Phone number")}" style="flex:1;min-width:0;box-sizing:border-box;border:1px solid oklch(0.8 0.05 82);border-radius:0 2px 2px 0;margin-top:0;" />
  <input type="hidden" id="${id}" name="${name}" />
</div>`;
}

function buildFieldHtml(field: FormField, numberOfInvitees: number): string {
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";

  switch (field.type) {
    case "select":
      return `<select id="${field.id}" name="${field.id}">
        ${(field.options ?? []).map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}
      </select>`;

    case "checkbox":
      return `<label>
        <input type="checkbox" id="${field.id}" name="${field.id}" />
        <span>${escapeHtml(field.label)}</span>
      </label>`;

    case "radio":
      return (field.options ?? [])
        .map(
          (o) =>
            `<label>
              <input type="radio" name="${field.id}" value="${escapeHtml(o)}" /><span>${escapeHtml(o)}</span>
            </label>`
        )
        .join("");

    case "textarea":
      return `<textarea id="${field.id}" name="${field.id}" rows="3"${placeholder}></textarea>`;

    case "number": {
      if (field.maxFromQuery && numberOfInvitees <= 0) {
        return "";
      }
      const max = field.maxFromQuery && numberOfInvitees > 0
        ? Math.min(numberOfInvitees, field.max ?? 5)
        : field.max;
      const maxAttr = max !== undefined ? ` max="${max}"` : "";
      const value = field.maxFromQuery && numberOfInvitees > 0 ? ` value="${Math.min(numberOfInvitees, field.max ?? 5)}"` : "";
      return `<input type="number" id="${field.id}" name="${field.id}" min="0"${maxAttr}${value}${placeholder} />`;
    }

    case "tel":
      return buildPhoneGroupHtml(field.id, field.id, field.placeholder ?? "");

    case "guestGroup":
      return `<div id="__group_${field.id}" class="__guest_group"></div>`;

    default:
      return `<input type="${field.type}" id="${field.id}" name="${field.id}"${placeholder} />`;
  }
}

function buildRsvpHtml(
  formConfig: FormConfig | null,
  slug: string,
  isPast: boolean,
  isFull: boolean,
  numberOfInvitees: number
): string {
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

  const checkboxControllers = formConfig.fields.filter(
    (f) => f.type === "checkbox" && f.conditional?.length
  );
  const checkboxConditionals = new Set(
    checkboxControllers.flatMap((f) => f.conditional ?? [])
  );
  const regularFields = formConfig.fields.filter((f) => !checkboxConditionals.has(f.id));

  const conditionalControllerMap: Record<string, string> = {};
  for (const controller of checkboxControllers) {
    for (const condId of controller.conditional ?? []) {
      conditionalControllerMap[condId] = controller.id;
    }
  }

  const guestGroupFields = formConfig.fields.filter((f) => f.type === "guestGroup");
  const guestGroupByCountField: Record<string, FormField> = {};
  for (const group of guestGroupFields) {
    if (group.countField) {
      guestGroupByCountField[group.countField] = group;
    }
  }

  const fieldsHtml = regularFields
    .map((field) => {
      const isCheckbox = field.type === "checkbox";
      const label = isCheckbox
        ? ""
        : `<label for="${field.id}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>`;

      const controllerForThisField = conditionalControllerMap[field.id];
      const preChecked =
        field.type === "checkbox" &&
        controllerForThisField === undefined &&
        numberOfInvitees > 0 &&
        field.conditional?.some((condId) => {
          const cond = formConfig.fields.find((f) => f.id === condId);
          return cond?.type === "number" && cond.maxFromQuery;
        });

      const fieldHtml =
        field.type === "checkbox" && preChecked
          ? `<label>
              <input type="checkbox" id="${field.id}" name="${field.id}" checked />
              <span>${escapeHtml(field.label)}</span>
            </label>`
          : buildFieldHtml(field, numberOfInvitees);

      const conditionalFields = field.conditional?.length
        ? `<div id="__cond_${field.id}" style="display:${preChecked ? "block" : "none"};">
            ${(field.conditional ?? [])
              .map((condId) => {
                const condField = formConfig.fields.find((f) => f.id === condId);
                if (!condField) return "";
                if (condField.type === "number" && condField.maxFromQuery && numberOfInvitees <= 0) {
                  return "";
                }
                if (condField.type === "guestGroup") {
                  return `<div>
                    ${buildFieldHtml(condField, numberOfInvitees)}
                  </div>`;
                }
                return `<div>
                  <label>${escapeHtml(condField.label)}${condField.required ? " *" : ""}</label>
                  ${buildFieldHtml(condField, numberOfInvitees)}
                  <div id="__err_${condField.id}" style="display:none;"></div>
                </div>`;
              })
              .join("")}
          </div>`
        : "";

      return `<div id="__wrap_${field.id}">
        ${label}
        ${fieldHtml}
        <div id="__err_${field.id}" style="display:none;"></div>
        ${conditionalFields}
      </div>`;
    })
    .join("");

  const guestGroupConfigJson = JSON.stringify(
    guestGroupFields.map((group) => ({
      id: group.id,
      countField: group.countField,
      max: group.max ?? 5,
      subFields: group.subFields?.map((sub) => ({
        id: sub.id,
        type: sub.type,
        label: sub.label,
        placeholder: sub.placeholder,
        required: sub.required,
        options: sub.options,
      })),
    }))
  );

  const numberFieldIds = JSON.stringify(
    formConfig.fields.filter((f) => f.type === "number").map((f) => f.id)
  );

  return `
<style>@media (max-width:600px){.__phone_col{grid-column:span 2 !important;}}</style>
<section id="__rsvp">
  <h2>${escapeHtml(formConfig.title || "RSVP")}</h2>
  <div id="__rsvp_form_wrap">
    <div id="__rsvp_error" style="display:none;"></div>
    <div style="display:flex;border:1px solid oklch(0.8 0.05 82);border-radius:2px;overflow:hidden;margin-bottom:28px;">
      <button type="button" id="__att_yes" onclick="__setAttending(true)" style="flex:1;padding:10px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.1em;border:none;cursor:pointer;background:oklch(0.4 0.06 70);color:#fff;transition:background 0.15s;">I WILL ATTEND</button>
      <button type="button" id="__att_no" onclick="__setAttending(false)" style="flex:1;padding:10px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.1em;border:none;cursor:pointer;background:oklch(0.94 0.015 88);color:oklch(0.45 0.03 70);transition:background 0.15s;">CAN'T MAKE IT</button>
    </div>
    <form id="__rsvp_form" novalidate>
      <div id="__rsvp_fields">${fieldsHtml}</div>
      <button type="submit" id="__rsvp_btn">Register</button>
    </form>
  </div>
  <div id="__rsvp_success" style="display:none;">
    <div id="__rsvp_success_attending">
      <div style="font-size:48px;">🎉</div>
      <h3>Registration Successful!</h3>
      <p>Thank you for registering. We look forward to celebrating with you!</p>
    </div>
    <div id="__rsvp_success_notattending" style="display:none;">
      <div style="font-size:48px;">💛</div>
      <h3>We'll Miss You!</h3>
      <p>Thank you for letting us know. We'll be thinking of you on the day.</p>
    </div>
  </div>
  <p style="font-family:'Cormorant Garamond',serif;font-size:18px;margin:44px auto 0;max-width:560px;color:oklch(0.45 0.03 70);">Questions? Call Deborah Odunze (<a href="tel:+2349139243949" style="color:oklch(0.5 0.09 82);text-decoration:none;">+234 913 924 3949</a>) or Olabisi Aweda (<a href="tel:+2349020664053" style="color:oklch(0.5 0.09 82);text-decoration:none;">+234 902 066 4053</a>).</p>
</section>

<script>
(function() {
  var E164 = /^\\+[1-9][0-9]{7,14}$/;
  var conditionalControllers = ${JSON.stringify(conditionalControllerMap)};
  var guestGroups = ${guestGroupConfigJson};
  var numberFieldIds = ${numberFieldIds};
  var numberOfInvitees = ${numberOfInvitees};
  var __phoneListHtml = ${JSON.stringify(buildPhoneCountryListItems())};
  var __attending = true;

  window.__setAttending = function(val) {
    __attending = val;
    var yesBtn = document.getElementById('__att_yes');
    var noBtn = document.getElementById('__att_no');
    var fields = document.getElementById('__rsvp_fields');
    var btn = document.getElementById('__rsvp_btn');
    var activeStyle = 'background:oklch(0.4 0.06 70);color:#fff;';
    var inactiveStyle = 'background:oklch(0.94 0.015 88);color:oklch(0.45 0.03 70);';
    if (val) {
      yesBtn.style.cssText = yesBtn.style.cssText.replace(/background:[^;]+;color:[^;]+;/, activeStyle);
      noBtn.style.cssText = noBtn.style.cssText.replace(/background:[^;]+;color:[^;]+;/, inactiveStyle);
      fields.style.display = '';
      btn.textContent = 'Register';
    } else {
      yesBtn.style.cssText = yesBtn.style.cssText.replace(/background:[^;]+;color:[^;]+;/, inactiveStyle);
      noBtn.style.cssText = noBtn.style.cssText.replace(/background:[^;]+;color:[^;]+;/, activeStyle);
      fields.style.display = 'none';
      btn.textContent = "Send Regrets";
    }
  };

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

  function isConditionalVisible(fieldId) {
    var controller = conditionalControllers[fieldId];
    if (!controller) return true;
    var cb = document.getElementById(controller);
    return cb ? cb.checked : false;
  }

  function buildGuestHtml(group, index) {
    var html = '<div id="__guest_' + group.id + '_' + index + '" class="__guest_row" style="margin-bottom:16px;padding:12px 0;">';
    html += '<strong style="display:block;margin-bottom:8px;">Guest ' + index + '</strong>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    (group.subFields || []).forEach(function(sub) {
      html += '<div class="' + (sub.type === 'tel' || sub.type === 'email' ? '__phone_col' : '') + '" style="grid-column:span ' + (sub.type === 'select' || sub.type === 'textarea' ? '2' : '1') + ';">';
      html += '<label style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">' + sub.label + (sub.required ? ' *' : '') + '</label>';
      if (sub.type === 'tel') {
        var fieldName = 'guest_' + index + '_' + sub.id;
        html += '<div class="__phone_group" style="position:relative;display:flex;margin-top:10px;">';
        html += '<button type="button" onclick="__togPhone(this)" style="flex-shrink:0;width:110px;display:flex;align-items:center;gap:6px;padding:14px 12px;border:1px solid oklch(0.8 0.05 82);border-right:none;border-radius:2px 0 0 2px;background:oklch(0.955 0.015 88);cursor:pointer;white-space:nowrap;font-family:inherit;font-size:19px;box-sizing:border-box;">';
        html += '<img class="__phone_flag" src="https://flagcdn.com/w20/ng.png" width="20" height="15" style="border-radius:2px;object-fit:cover;" />';
        html += '<span class="__phone_code" style="font-weight:500;flex:1;text-align:left;">+234</span>';
        html += '<span style="font-size:12px;color:#888;">▾</span>';
        html += '</button>';
        html += '<div class="__phone_drop" style="display:none;position:absolute;top:calc(100% + 2px);left:0;z-index:1000;width:280px;background:#fff;border:1px solid oklch(0.8 0.05 82);border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.12);overflow:hidden;">';
        html += '<div style="padding:8px;border-bottom:1px solid oklch(0.88 0.03 88);"><input type="text" placeholder="Search country…" oninput="__filtPhone(this)" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid oklch(0.8 0.05 82);border-radius:2px;font-size:13px;outline:none;font-family:inherit;" /></div>';
        html += '<ul class="__phone_list" style="max-height:220px;overflow-y:auto;list-style:none;margin:0;padding:0;">' + __phoneListHtml + '</ul>';
        html += '</div>';
        html += '<input type="tel" class="__phone_num" placeholder="' + (sub.placeholder || 'Phone number') + '" style="flex:1;min-width:0;box-sizing:border-box;border:1px solid oklch(0.8 0.05 82);border-radius:0 2px 2px 0;margin-top:0;" />';
        html += '<input type="hidden" name="' + fieldName + '" />';
        html += '</div>';
      } else if (sub.type === 'select') {
        html += '<select name="guest_' + index + '_' + sub.id + '" style="width:100%;box-sizing:border-box;border:1px solid oklch(0.8 0.05 82);border-radius:2px;background:#fff;">';
        (sub.options || []).forEach(function(opt) {
          html += '<option value="' + opt + '">' + opt + '</option>';
        });
        html += '</select>';
      } else if (sub.type === 'textarea') {
        html += '<textarea name="guest_' + index + '_' + sub.id + '" rows="2" placeholder="' + (sub.placeholder || '') + '" style="width:100%;box-sizing:border-box;border:1px solid oklch(0.8 0.05 82);border-radius:2px;"></textarea>';
      } else {
        html += '<input type="' + sub.type + '" name="guest_' + index + '_' + sub.id + '" placeholder="' + (sub.placeholder || '') + '" style="width:100%;box-sizing:border-box;border:1px solid oklch(0.8 0.05 82);border-radius:2px;" />';
      }
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderGuestGroup(group) {
    var wrap = document.getElementById('__group_' + group.id);
    if (!wrap) return;
    var countEl = document.getElementById(group.countField);
    var count;
    if (countEl && countEl.offsetParent !== null) {
      count = parseInt(countEl.value, 10);
      if (isNaN(count) || count < 0) count = 0;
      if (count > group.max) count = group.max;
    } else {
      count = 1;
    }
    var html = '';
    for (var i = 1; i <= count; i++) {
      html += buildGuestHtml(group, i);
    }
    wrap.innerHTML = html;
  }

  function initGuestGroups() {
    guestGroups.forEach(function(group) {
      renderGuestGroup(group);
      var countEl = document.getElementById(group.countField);
      if (countEl) {
        countEl.addEventListener('input', function() { renderGuestGroup(group); });
      }
    });
  }

  function initConditionals() {
    document.querySelectorAll('#__rsvp_form input[type="checkbox"]').forEach(function(cb) {
      var condDiv = document.getElementById('__cond_' + cb.id);
      if (!condDiv) return;
      cb.addEventListener('change', function() {
        condDiv.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
          var hasNumberInput = false;
          condDiv.querySelectorAll('input[type="number"]').forEach(function(input) {
            hasNumberInput = true;
            if (!input.value || parseInt(input.value, 10) === 0) {
              input.value = '1';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
          if (!hasNumberInput) {
            guestGroups.forEach(function(group) {
              if (condDiv.contains(document.getElementById('__group_' + group.id))) {
                renderGuestGroup(group);
              }
            });
          }
        } else {
          condDiv.querySelectorAll('input[type="number"]').forEach(function(input) {
            input.value = '0';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          });
          guestGroups.forEach(function(group) {
            if (condDiv.contains(document.getElementById('__group_' + group.id))) {
              var wrap = document.getElementById('__group_' + group.id);
              if (wrap) wrap.innerHTML = '';
            }
          });
        }
      });
    });
  }

  function validateGuestSubField(sub, value) {
    var trimmed = (value || '').trim();
    if (sub.required && trimmed === '') return sub.label + ' is required';
    if (sub.type === 'tel' && trimmed && !E164.test(trimmed)) return 'Please enter a valid phone number';
    if (sub.type === 'email' && trimmed && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) return 'Please enter a valid email address';
    return '';
  }

  function validateGuestGroup(group) {
    var valid = true;
    var wrap = document.getElementById('__group_' + group.id);
    if (!wrap) return valid;
    var count = getGuestCount(group);
    for (var i = 1; i <= count; i++) {
      var row = document.getElementById('__guest_' + group.id + '_' + i);
      if (!row) continue;
      (group.subFields || []).forEach(function(sub) {
        var input = row.querySelector('[name="guest_' + i + '_' + sub.id + '"]');
        var msg = validateGuestSubField(sub, input ? input.value : '');
        if (msg) {
          showError(group.id + '_' + i + '_' + sub.id, msg);
          valid = false;
        }
      });
    }
    return valid;
  }

  function getGuestCount(group) {
    var countEl = document.getElementById(group.countField);
    if (countEl && countEl.offsetParent !== null) {
      var val = parseInt(countEl.value, 10);
      return isNaN(val) || val < 0 ? 0 : val > group.max ? group.max : val;
    }
    return 1;
  }

  // Phone group helpers must be global for inline onclick attributes
  window.__updPhone = function(group) {
    var code = group.querySelector('.__phone_code');
    var num = group.querySelector('.__phone_num');
    var hid = group.querySelector('input[type="hidden"]');
    if (!code || !num || !hid) return;
    var digits = num.value.replace(/\\D/g, '');
    hid.value = digits ? code.textContent + digits : '';
  };
  window.__togPhone = function(btn) {
    var drop = btn.parentElement.querySelector('.__phone_drop');
    var wasOpen = drop.style.display !== 'none';
    document.querySelectorAll('.__phone_drop').forEach(function(d) { d.style.display = 'none'; });
    if (!wasOpen) {
      drop.style.display = 'block';
      var s = drop.querySelector('input[type="text"]');
      if (s) setTimeout(function() { s.focus(); s.value = ''; window.__filtPhone(s); }, 0);
    }
  };
  window.__filtPhone = function(inp) {
    var q = inp.value.toLowerCase();
    inp.closest('.__phone_drop').querySelector('.__phone_list').querySelectorAll('li').forEach(function(li) {
      li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
  window.__selPhone = function(btn, dial, iso) {
    var group = btn.closest('.__phone_group');
    var flag = group.querySelector('.__phone_flag');
    var code = group.querySelector('.__phone_code');
    if (flag) flag.src = 'https://flagcdn.com/w20/' + iso + '.png';
    if (code) code.textContent = dial;
    btn.closest('.__phone_drop').style.display = 'none';
    window.__updPhone(group);
  };
  document.addEventListener('click', function(e) {
    if (!e.target.closest || !e.target.closest('.__phone_group')) {
      document.querySelectorAll('.__phone_drop').forEach(function(d) { d.style.display = 'none'; });
    }
  });
  document.addEventListener('input', function(e) {
    if (e.target.classList && e.target.classList.contains('__phone_num')) {
      var g = e.target.closest && e.target.closest('.__phone_group');
      if (g) window.__updPhone(g);
    }
  });

  initConditionals();
  initGuestGroups();

  document.getElementById('__rsvp_form').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrors();

    var payload = { attending: __attending };
    var valid = true;
    var formEl = document.getElementById('__rsvp_form');

    if (!__attending) {
      var btn = document.getElementById('__rsvp_btn');
      btn.disabled = true;
      btn.textContent = 'Submitting…';
      try {
        var res = await fetch('/events/${slug}/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attending: false, fullname: '', title: '' })
        });
        var data = await res.json().catch(function() { return {}; });
        if (res.ok) {
          document.getElementById('__rsvp_form_wrap').style.display = 'none';
          document.getElementById('__rsvp_success').style.display = 'block';
          document.getElementById('__rsvp_success_attending').style.display = 'none';
          document.getElementById('__rsvp_success_notattending').style.display = 'block';
        } else {
          var errEl = document.getElementById('__rsvp_error');
          errEl.textContent = data.error || 'Submission failed. Please try again.';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Send Regrets';
        }
      } catch (err) {
        var errEl = document.getElementById('__rsvp_error');
        errEl.textContent = 'Something went wrong. Please try again.';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send Regrets';
      }
      return;
    }

    formEl.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea').forEach(function(el) {
      if (el.name && !el.name.startsWith('guest_')) {
        payload[el.name] = el.type === 'number' ? parseInt(el.value, 10) || 0 : el.value.trim();
      }
    });
    formEl.querySelectorAll('input[type="checkbox"]').forEach(function(el) {
      payload[el.name] = el.checked;
    });
    formEl.querySelectorAll('input[type="radio"]:checked').forEach(function(el) {
      payload[el.name] = el.value;
    });

    ${regularFields
      .filter((f) => f.required && f.type !== "checkbox" && f.type !== "guestGroup")
      .map(
        (f) => {
          const controller = conditionalControllerMap[f.id];
          const visibilityCheck = controller ? `if (isConditionalVisible('${f.id}')) {` : ``;
          const visibilityClose = controller ? `}` : ``;
          return `
    ${visibilityCheck}
    if (isConditionalVisible('${f.id}') && (!payload['${f.id}'] && payload['${f.id}'] !== 0)) {
      showError('${f.id}', '${escapeHtml(f.label)} is required');
      valid = false;
    }${
      f.type === "tel"
        ? ` else if (isConditionalVisible('${f.id}') && payload['${f.id}'] && !E164.test(payload['${f.id}'])) {
      showError('${f.id}', 'Please enter a valid phone number');
      valid = false;
    }`
        : f.type === "email"
          ? ` else if (isConditionalVisible('${f.id}') && payload['${f.id}'] && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(payload['${f.id}'])) {
      showError('${f.id}', 'Please enter a valid email address');
      valid = false;
    }`
          : ""
    }
    ${visibilityClose}`;
        }
      )
      .join("")}

    // Validate guest groups
    guestGroups.forEach(function(group) {
      if (!isConditionalVisible(group.id)) return;
      if (!validateGuestGroup(group)) valid = false;
    });

    if (!valid) return;

    // Build plusOneGuests payload from guest group
    var plusOneGuests = [];
    guestGroups.forEach(function(group) {
      if (!isConditionalVisible(group.id)) return;
      var count = getGuestCount(group);
      for (var i = 1; i <= count; i++) {
        var row = document.getElementById('__guest_' + group.id + '_' + i);
        if (!row) continue;
        var guest = {};
        (group.subFields || []).forEach(function(sub) {
          var input = row.querySelector('[name="guest_' + i + '_' + sub.id + '"]');
          guest[sub.id] = input ? input.value.trim() : '';
        });
        plusOneGuests.push(guest);
      }
    });
    payload['plusOneGuests'] = plusOneGuests;
    if (!('plusOne' in payload)) payload['plusOne'] = plusOneGuests.length > 0;

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
        document.getElementById('__rsvp_success_attending').style.display = 'block';
        document.getElementById('__rsvp_success_notattending').style.display = 'none';
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

function parseNumberOfInvitees(raw: string | string[] | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  const value = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  if (Number.isNaN(value) || value < 1) return 0;
  return Math.min(value, 5);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const numberOfInvitees = parseNumberOfInvitees(searchParams.get("noi"));

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

  const registrations = await prisma.registration.findMany({
    where: { eventId: event.id },
    select: { plusOneGuests: true },
  });

  const attendeeCount = registrations.reduce((sum, r) => {
    let guestCount = 0;
    if (r.plusOneGuests) {
      try {
        const guests = JSON.parse(r.plusOneGuests);
        if (Array.isArray(guests)) guestCount = guests.length;
      } catch (err) {
        console.error("Failed to parse plusOneGuests for render attendee count:", err);
      }
    }
    return sum + 1 + guestCount;
  }, 0);

  const eventDate = new Date(event.date);
  const now = new Date();
  const isPast = eventDate < now;
  const isFull =
    event.capacity !== null && event.capacity !== undefined
      ? attendeeCount >= event.capacity
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

  const rsvpHtml = buildRsvpHtml(formConfig, slug, isPast, isFull, numberOfInvitees);

  let html = event.designContent
    .replace(/\{\{eventTitle\}\}/g, event.title)
    .replace(/\{\{eventDate\}\}/g, formattedDate)
    .replace(/\{\{eventTime\}\}/g, formattedTime)
    .replace(/\{\{venue\}\}/g, "");

  // Strip leaked dc-runtime artifact content that may follow {{rsvpForm}} in stored templates.
  if (html.includes("{{rsvpForm}}") && !html.match(/\{\{rsvpForm\}\}\s*\n/)) {
    html = html.replace(/\{\{rsvpForm\}\}[\s\S]*?<\/section>/, "{{rsvpForm}}");
  }

  if (html.includes("__cd_days") && html.includes("{{rsvpForm}}")) {
    const cdIdx = html.indexOf("__cd_days");
    const rsvpIdx = html.indexOf("{{rsvpForm}}");
    const sectionCloseBetween = html.indexOf("</section>", cdIdx);
    if (sectionCloseBetween === -1 || sectionCloseBetween > rsvpIdx) {
      const DETAILS = `
  </section>

  <!-- EVENT DETAILS -->
  <section style="padding:clamp(60px,8vw,100px) 24px;background:oklch(0.965 0.018 88);text-align:center;">
    <div style="max-width:860px;margin:0 auto;">
      <div style="font-family:'Cinzel',serif;letter-spacing:0.25em;font-size:12px;color:oklch(0.55 0.1 82);margin-bottom:44px;">CELEBRATE WITH US</div>
      <div style="display:flex;justify-content:center;gap:clamp(32px,6vw,80px);flex-wrap:wrap;">
        <div style="min-width:180px;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:oklch(0.6 0.08 82);margin-bottom:12px;">THE DATE</div>
          <p style="font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.2vw,24px);margin:0;color:oklch(0.32 0.04 70);">${formattedDate}</p>
        </div>
        <div style="min-width:180px;">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:oklch(0.6 0.08 82);margin-bottom:12px;">THE TIME</div>
          <p style="font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.2vw,24px);margin:0;color:oklch(0.32 0.04 70);">${formattedTime}</p>
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

  html = html.replace("{{rsvpForm}}", rsvpHtml);

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
