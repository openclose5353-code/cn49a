import { transferContent, qrUrl, countdownParts, formatVnd, formatMillions, extraUnlockText, escapeHtml as e, uploadPayload, statusNote, tierFor, milestoneTrack, ladderTrack, thankYou, fullSrc, albumPhotos } from "./lib.js?v=20260927a";

const $ = (id) => document.getElementById(id);
let DATA;

const initials = (name) => e(name.trim().split(/\s+/).pop()?.[0] ?? "?");
const avatar = (p) =>
  p.avatar
    ? `<img src="${e(p.avatar)}" data-full="${e(p.avatarFull ?? p.avatar)}" data-cap="${e(p.name)}"${p.status === "none" ? ' data-blur="1"' : ""} alt="" loading="lazy">`
    : `<span class="ph">${initials(p.name)}</span>`;
const photo = (src, cap) => `<img src="${e(src)}" data-full="${e(fullSrc(src))}" data-cap="${e(cap ?? "")}" alt="" loading="lazy">`;
const ringed = (p) => `<span class="r ${p.status}">${avatar(p)}</span>`;
const badgeHtml = (p) => {
  const t = tierFor(p, DATA.tiers);
  return t ? ` <span class="pbadge">${t.icon} ${e(t.name)}</span>` : "";
};
const noteHtml = (p) => {
  const n = statusNote(p);
  return `<span class="snote ${n.cls}">${e(n.text)}</span>`;
};
const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60e3);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

function renderCountdown() {
  const target = Date.parse(DATA.event.date);
  const p = countdownParts(target, Date.now());
  $("countdown").innerHTML = p.done
    ? `<div class="lbl">🎉 HÔM NAY LÀ NGÀY VỀ TRƯỜNG!</div><div class="when"><span>📅 Chủ nhật 01/11/2026 · ⏰ 7h00</span><span>📍 KTX Kinh tế Quốc dân</span></div>`
    : `<div class="lbl">⏳ CÒN LẠI ĐẾN NGÀY VỀ TRƯỜNG</div>
       <div class="nums"><div><b>${p.days}</b>NGÀY</div><div><b>${String(p.hours).padStart(2, "0")}</b>GIỜ</div><div><b>${String(p.minutes).padStart(2, "0")}</b>PHÚT</div><div><b>${String(p.seconds).padStart(2, "0")}</b>GIÂY</div></div>
       <div class="when"><span>📅 Chủ nhật 01/11/2026 · ⏰ 7h00</span><span>📍 KTX Kinh tế Quốc dân</span></div>`;
}

function renderRaised() {
  const g = DATA.goal;
  const pct = Math.min(100, (100 * g.raised) / g.minimum);
  $("raised").innerHTML = `<div class="lbl">💰 ĐÃ GÓP · CẬP NHẬT TRỰC TIẾP</div>
    <div class="amt">${formatVnd(g.raised)} <small>/ ${formatVnd(g.minimum)}</small></div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="sub"><span>🎯 Mục tiêu tối thiểu: <b>${formatMillions(g.minimum)}</b></span><span><b>${Math.floor(pct)}%</b></span></div>
    <div class="sub"><span>🚀 Mục tiêu đầy đủ: <b>${formatMillions(g.full)}</b> · gồm gameshow, MC, clip, tri ân, học bổng</span></div>`;
}

function renderHeader() {
  const shown = DATA.people.filter((p) => p.status !== "none").slice(0, 14);
  const rest = DATA.people.length - shown.length;
  $("mosaic").innerHTML =
    shown.map((p) => `<a class="r ${p.status}" href="#ca-lop" title="${e(p.name)}">${avatar(p)}</a>`).join("") +
    (rest > 0 ? `<a class="more" href="#ca-lop" title="Xem cả lớp">+${rest}</a>` : "");
  $("stats").innerHTML = `<div><b>🏅 ${DATA.stats.paid}</b>đã đóng góp</div><div><b>🙋 ${DATA.stats.registered}</b>đã confirm</div><div><b>👥 ${DATA.stats.classSize}</b>cả lớp</div>`;
  $("bio").innerHTML = `<div class="bio-title">🎓 CN49A · ${e(DATA.event.title)}</div>
    <div>🏫 QTKD Công nghiệp &amp; Xây dựng · KTQD 2007–2011</div>
    <div>💛 1 triệu/bạn · góp thêm để lễ kỷ niệm hoành tráng hơn</div>
    <div class="muted">🌈 Viền màu = đã đóng góp · ⚪ viền xám = đã confirm</div>`;
}

function renderUnlock() {
  const S = DATA.stats;
  const t = milestoneTrack({ paid: S.paid, registered: S.registered, classSize: S.classSize, milestones: DATA.milestones });
  const l = ladderTrack(DATA.ladder);
  const sch = DATA.scholarship;
  $("unlock").innerHTML = `
    <div class="lbl">🎁 MỞ KHOÁ QUÀ CHO CẢ LỚP</div>
    <div class="trk">
      <div class="trk-h">① Càng nhiều bạn đóng góp, cả lớp càng nhiều quà</div>
      <div class="trk-line">Đã có <b>${S.paid}/${S.classSize}</b> bạn đóng góp <span class="muted">· ${S.registered} bạn đã confirm</span></div>
      <div class="rail">
        <div class="ghost" style="width:${t.ghostPct}%"></div>
        <div class="fill" style="width:${t.fillPct}%"></div>
        ${t.markers.map((m) => `<div class="mk ${m.unlocked ? "on" : ""}" style="left:${m.pct}%"><span>${m.icon}</span><em>${m.people}</em></div>`).join("")}
      </div>
      <div class="rail-legend"><span><i class="dot fill"></i>đã đóng góp</span><span><i class="dot ghost"></i>đã confirm</span></div>
      <div class="next">👉 ${e(t.headline)}</div>
      <ul class="ms-list">${t.markers.map((m) => `<li class="${m.unlocked ? "done" : ""}"><span class="ico">${m.unlocked ? "✅" : "🔒"}</span><div><b>${m.icon} Đủ ${m.people} bạn</b> → ${e(m.label)}<small>${m.unlocked ? "Đã mở khoá 🎉" : `Còn thiếu ${m.remaining} bạn`}</small></div></li>`).join("")}</ul>
    </div>
    <div class="trk">
      <div class="trk-h">② Góp thêm (phần trên 1 triệu/bạn) sẽ mở khoá lần lượt</div>
      <div class="trk-line">Quỹ góp thêm: <b>${formatVnd(l.raised)}</b> <span class="muted">/ ${formatMillions(l.total)}</span></div>
      <div class="rail money">
        <div class="fill" style="width:${Math.min(100, (100 * l.raised) / (l.total || 1))}%"></div>
        ${l.steps.map((s) => `<div class="tick" style="left:${s.endPct}%"></div>`).join("")}
      </div>
      <div class="next">👉 ${e(l.headline)}</div>
      <ul class="ms-list">${l.steps.map((s) => `<li class="${s.state}"><span class="ico">${s.state === "done" ? "✅" : s.state === "active" ? "⏳" : "🔒"}</span><div><b>${s.icon} ${e(s.label)}</b><small>${s.status} · ${formatMillions(s.filled)} / ${formatMillions(s.goal)}${s.target == null ? ` · ${sch.units} suất` : ""}</small><div class="mini"><i style="width:${Math.min(100, (100 * s.filled) / (s.goal || 1))}%"></i></div></div></li>`).join("")}</ul>
      <p class="pledge">🎓 ${sch.pledgeUnlocked ? `${e(sch.pledgeName)} đã góp thêm ${formatMillions(sch.pledgeAmount)} cho học bổng ✅` : `Khi đủ 40 bạn đóng góp, ${e(sch.pledgeName)} góp thêm <b>${formatMillions(sch.pledgeAmount)}</b> cho học bổng`}</p>
    </div>`;
}

function renderHighlights() {
  const ms = DATA.milestones.map((m) => `<div><div class="c ${m.unlocked ? "on" : ""}">${m.icon}<span class="lock">${m.unlocked ? "🔓" : "🔒"}</span></div>${m.people} bạn<br>${e(m.short ?? m.label)}</div>`);
  // Chưa đủ tiền thì luôn có khoá 🔒; nấc đang góp có viền nét đứt để biết đang góp vào đâu
  const ld = DATA.ladder.map((s) => `<div><div class="c ${s.state === "done" ? "on" : s.state === "active" ? "active" : ""}">${s.icon}<span class="lock">${s.state === "done" ? "🔓" : "🔒"}</span></div>${e(s.label)}</div>`);
  $("highlights").innerHTML = [...ms, ...ld].join("");
}

function renderFund() {
  const s = DATA.ladder.find((x) => x.state === "active");
  const sch = DATA.scholarship;
  let line;
  if (!s) line = "Quỹ góp thêm đã đủ mọi hạng mục 🎉";
  else if (s.target == null) line = `đang góp cho ${s.icon} <b>${e(s.label)}</b> · ${formatMillions(sch.total)} (${sch.units} suất)`;
  else line = `đang mở khoá ${s.icon} <b>${e(s.label)}</b> (${formatMillions(s.filled)}/${formatMillions(s.target)})
    <div class="bar"><i style="width:${Math.min(100, (100 * s.filled) / s.target)}%"></i></div>
    <span class="muted">Còn ${formatMillions(s.target - s.filled)} nữa — góp thêm khi quét QR</span>`;
  const pledge = sch.pledgeUnlocked
    ? `<br>🎓 ${e(sch.pledgeName)} góp thêm ${formatMillions(sch.pledgeAmount)} cho học bổng ✅`
    : `<br><span class="muted">🎓 Đủ 40 bạn: ${e(sch.pledgeName)} góp thêm ${formatMillions(sch.pledgeAmount)} cho học bổng</span>`;
  $("fund").innerHTML = `<b>Quỹ góp thêm:</b> ${formatVnd(DATA.ledger.extra)} → ${line}${pledge}`;
}

function feedItem(f) {
  const people = new Map(DATA.people.map((p) => [p.key, p]));
  if (f.type === "joined") {
    const p = people.get(f.personKey);
    if (!p) return "";
    return `<article class="post"><div class="post-h">${avatar(p)}<div>${e(p.name)}${badgeHtml(p)}<small>${p.mssv ? `${e(p.mssv)} · ` : ""}vừa tham gia · ${timeAgo(f.ts)}</small></div></div>
      <div class="msg"><div class="big-emoji">${p.badge || "🎉"}</div>${p.message ? `<b>“${e(p.message)}”</b>` : `<b>Đã chốt vé về trường 01/11!</b>`}</div></article>`;
  }
  if (f.type === "milestone")
    return `<article class="post"><div class="msg" style="margin-top:12px"><div class="big-emoji">${f.icon}🔓</div><b>Đủ ${f.people} bạn — đã mở khoá: ${e(f.label)}!</b><div class="muted" style="margin-top:6px">${timeAgo(f.ts)}</div></div></article>`;
  if (f.type === "notice")
    return `<article class="post"><div class="post-h"><span class="ph">📌</span><div>${e(f.by ?? "Ban liên lạc")}<small>thông báo · ${timeAgo(f.ts)}</small></div></div><div class="ptxt" style="white-space:pre-line">${e(f.text)}</div></article>`;
  if (f.type === "photos")
    return `<article class="post"><div class="post-h"><span class="ph">📷</span><div>${e(f.by ?? "Drive của lớp")}<small>đã thêm ${f.count} ảnh · ${timeAgo(f.ts)}</small></div></div>
      <div class="pics ${f.srcs.length === 1 ? "one" : ""}" data-group>${f.srcs.map((s) => photo(s, f.by ?? "Drive của lớp")).join("")}</div></article>`;
  if (f.type === "video")
    return `<article class="post"><div class="post-h"><span class="ph">🎬</span><div>Clip của lớp<small>${e(f.title)}</small></div></div>
      <div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${e(f.youtubeId)}" loading="lazy" allowfullscreen title="${e(f.title)}"></iframe></div></article>`;
  return "";
}

function renderFeed() {
  $("feed").innerHTML = DATA.feed.map(feedItem).join("");
}

const PAGE = 60;
function renderGallery(key = "all", shown = PAGE) {
  const albums = DATA.albums ?? [];
  const title = new Map(albums.map((a) => [a.key, `${a.emoji} ${a.title}`]));
  const imgs = albumPhotos(DATA.gallery, albums, key);
  const circle = (k, cover, emoji, label, count) => `<button data-album="${k}" class="${key === k ? "on" : ""}${count ? "" : " empty"}">
      <span class="c">${cover ? `<img src="${e(cover)}" alt="" loading="lazy">` : `<i>${emoji}</i>`}</span>
      <b>${e(label)}</b><small>${count ? `${count} ảnh` : "sắp có"}</small></button>`;
  const cur = albums.find((a) => a.key === key);
  $("gallery").innerHTML = `<h2 class="sec-t">📸 Album kỷ niệm <small>${DATA.gallery.length} ảnh</small></h2>
    <div class="alb">${circle("all", DATA.gallery[0]?.src, "▦", "Tất cả", DATA.gallery.length)}${albums.map((a) => circle(a.key, a.cover, a.emoji, a.title, a.count)).join("")}</div>
    ${cur && !cur.count ? `<p class="note">${cur.key === "reunion15" ? "Ảnh buổi họp mặt 01/11 sẽ hiện ở đây 🎉" : "Chưa có ảnh"}</p>` : ""}
    <div class="grid3" data-group>${imgs.slice(0, shown).map((g) => photo(g.src, [title.get(g.album), g.by].filter(Boolean).join(" · "))).join("")}</div>
    ${imgs.length > shown ? `<button class="more-photos" id="more-photos">Xem thêm ${Math.min(PAGE, imgs.length - shown)} ảnh · còn ${imgs.length - shown}</button>` : ""}`;
  $("gallery").querySelectorAll("[data-album]").forEach((b) => (b.onclick = () => renderGallery(b.dataset.album)));
  const more = $("more-photos");
  if (more) more.onclick = () => renderGallery(key, shown + PAGE);
}

// ---------- Màn hình phụ ----------
function sheetJoin(body) {
  const tiers = DATA.tiers;
  const state = { person: null, amount: tiers[0].amount };
  const people = [...DATA.people].sort((a, b) => (a.status === "registered" ? -1 : 0) - (b.status === "registered" ? -1 : 0));
  body.innerHTML = `
    <div class="step">BƯỚC 1 · BẠN LÀ AI?</div>
    <input class="search" id="q" placeholder="🔍 Gõ tên hoặc mã sinh viên…" autocomplete="off">
    <div class="list" id="who"></div>
    <div class="step">BƯỚC 2 · CHỌN MỨC</div>
    <div class="chips" id="chips">${tiers.map((t) => `<button data-a="${t.amount}">${formatMillions(t.amount)}<small>${t.badge} ${e(t.name)}</small></button>`).join("")}<button data-a="other">Khác…<small>&nbsp;</small></button></div>
    <input class="other-amount" id="other" inputmode="numeric" placeholder="Nhập số tiền, ví dụ 1500000">
    <div class="unlock" id="unlock" hidden></div>
    <div class="step">BƯỚC 3 · QUÉT MÃ ĐỂ CHUYỂN</div>
    <div id="pay"><p class="note">Chọn tên của bạn ở bước 1 để hiện mã QR.</p></div>
    <div class="step">BƯỚC 4 · GỬI ẢNH CHỤP CHUYỂN KHOẢN</div>
    <p class="note" style="text-align:left;padding:0 16px 8px">Chọn <b>một</b> trong hai cách. Vài phút sau, ảnh của bạn trên trang sẽ đổi sang viền màu 🎉</p>
    ${DATA.uploadUrl ? `
    <textarea id="msg" class="search" rows="2" maxlength="300" placeholder="Lời nhắn cho cả lớp (không bắt buộc)"></textarea>
    <label class="cta grad" style="cursor:pointer">⬆️ Tải ảnh chụp lên đây<input type="file" id="file" accept="image/*" hidden></label>
    <p class="note" id="upl" aria-live="polite"></p>
    <div class="or">— hoặc —</div>` : ""}
    <button type="button" class="cta zalo" id="zalo-btn">📸 Gửi ảnh chụp vào nhóm Zalo</button>
    <p class="note">Ảnh chụp chuyển khoản không bao giờ được đăng lên trang.</p>`;

  const drawWho = (q = "") => {
    const nq = transferContent("", q).trim().toLowerCase();
    body.querySelector("#who").innerHTML = people
      .filter((p) => !nq || transferContent("", `${p.name} ${p.mssv ?? ""}`).toLowerCase().includes(nq))
      .map((p) => `<div class="who ${state.person?.key === p.key ? "sel" : ""}" data-k="${e(p.key)}">${ringed(p)}<div>${e(p.name)}${badgeHtml(p)}<small>${p.mssv ? `🎓 ${e(p.mssv)}` : ""}</small>${noteHtml(p)}</div>${state.person?.key === p.key ? '<span class="tick">✓</span>' : ""}</div>`)
      .join("");
    body.querySelectorAll(".who").forEach((el) => (el.onclick = () => { state.person = people.find((p) => p.key === el.dataset.k); drawWho(body.querySelector("#q").value); drawPay(); }));
  };
  const drawPay = () => {
    body.querySelectorAll("#chips button").forEach((b) => b.classList.toggle("on", String(state.amount) === b.dataset.a || (b.dataset.a === "other" && !tiers.some((t) => t.amount === state.amount))));
    const u = extraUnlockText(state.amount, DATA.ladder);
    body.querySelector("#unlock").hidden = !u;
    body.querySelector("#unlock").textContent = u ? `✨ ${u}` : "";
    if (!state.person || !(state.amount >= 1000)) return;
    const content = transferContent(DATA.bank.transferPrefix, state.person.name);
    body.querySelector("#pay").innerHTML = `<img class="qr" src="${e(qrUrl(DATA.bank, state.amount, content))}" alt="Mã VietQR">
      <div class="kv">
        <div><span>Chủ TK</span>${e(DATA.bank.accountName)}</div>
        <div><span>Ngân hàng</span>${e(DATA.bank.bankName)}</div>
        <div><span>Số TK</span><span style="color:#111">${e(DATA.bank.accountNo)} <button data-copy="${e(DATA.bank.accountNo)}">Chép</button></span></div>
        <div><span>Số tiền</span><b>${formatVnd(state.amount)}</b></div>
        <div><span>Nội dung</span><span style="color:#111"><b>${e(content)}</b> <button data-copy="${e(content)}">Chép</button></span></div>
      </div>`;
    body.querySelectorAll("[data-copy]").forEach((b) => (b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Đã chép ✓"; } catch { b.textContent = "Hãy chép tay"; } }));
  };
  const fileInput = body.querySelector("#file");
  if (fileInput) fileInput.onchange = async () => {
    const status = body.querySelector("#upl");
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    if (!state.person) { status.textContent = "⚠️ Hãy chọn tên của bạn ở bước 1 trước."; return; }
    if (!file.type.startsWith("image/")) { status.textContent = "⚠️ Chỉ nhận file ảnh."; return; }
    status.textContent = "⏳ Đang tải lên…";
    try {
      const dataUrl = await toJpegDataUrl(file);
      const payload = uploadPayload({ person: state.person, amount: state.amount, message: body.querySelector("#msg").value, dataUrl });
      const res = await fetch(DATA.uploadUrl, { method: "POST", body: JSON.stringify(payload) });
      const out = await res.json();
      status.textContent = out.ok ? `✅ Đã nhận ảnh của ${state.person.name}.` : `⚠️ ${out.error ?? "Không tải lên được, hãy thử lại."}`;
      if (out.ok) celebrate(thankYou(state.person, state.amount, "upload"));
    } catch {
      status.textContent = "⚠️ Không tải lên được. Hãy thử lại, hoặc gửi ảnh vào nhóm Zalo.";
    }
  };
  body.querySelector("#zalo-btn").onclick = () => {
    if (!state.person) { body.querySelector("#q").focus(); body.querySelector("#q").placeholder = "⚠️ Chọn tên của bạn trước nhé…"; return; }
    celebrate(thankYou(state.person, state.amount, "zalo"), DATA.zaloGroupUrl ? { href: DATA.zaloGroupUrl, label: "📸 Mở nhóm Zalo để gửi ảnh" } : null);
  };
  body.querySelector("#q").oninput = (ev) => drawWho(ev.target.value);
  body.querySelectorAll("#chips button").forEach((b) => (b.onclick = () => {
    const other = body.querySelector("#other");
    if (b.dataset.a === "other") { other.style.display = "block"; other.focus(); return; }
    other.style.display = "none";
    state.amount = Number(b.dataset.a);
    drawPay();
  }));
  body.querySelector("#other").oninput = (ev) => { state.amount = Number(ev.target.value.replace(/\D/g, "")) || 0; drawPay(); };
  drawWho();
  drawPay();
}

// Thu nhỏ ảnh (tối đa 1600px, JPEG) trước khi gửi để nhanh trên 4G; ảnh chụp màn hình ngân hàng vẫn đọc rõ.
async function toJpegDataUrl(file, max = 1600) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sheetProgram(body) {
  body.innerHTML = `<div class="cd grad" style="padding:12px"><div class="when">Chủ nhật 01/11/2026 · còn <b style="font-size:20px">${countdownParts(Date.parse(DATA.event.date), Date.now()).days}</b> ngày</div></div>
    <div class="tl">${DATA.program.map((p) => `<div class="${p.highlight ? "hi" : ""}"><b>${e(p.time)}</b>${e(p.text)}</div>`).join("")}</div>`;
}

function sheetLedger(body) {
  const L = DATA.ledger;
  const stateIcon = { done: "🔓", active: "🔒", locked: "🔒" };
  body.innerHTML = `
    <div class="sum"><div style="background:#ecfdf3;color:#067647">Đã thu<b>${formatVnd(L.income)}</b></div><div style="background:#fef3f2;color:#b42318">Đã chi<b>${formatVnd(L.expenseTotal)}</b></div><div style="background:#f4f3ff;color:#5925dc">Còn lại<b>${formatVnd(L.balance)}</b></div></div>
    <div class="sec">MỤC TIÊU</div>
    <div class="row"><div>Tối thiểu<small>đủ để tổ chức buổi họp mặt</small></div><b>${formatVnd(DATA.goal.minimum)}</b></div>
    <div class="row"><div>Đầy đủ<small>tối thiểu + các hạng mục góp thêm</small></div><b>${formatVnd(DATA.goal.full)}</b></div>
    <div class="sec">QUỸ SỰ KIỆN (1 TRIỆU/BẠN)</div>
    <div class="row"><div>Đã thu<small>${DATA.stats.paid} bạn × 1.000.000đ</small></div><b>${formatVnd(L.eventFund)}</b></div>
    <div class="sec">QUỸ GÓP THÊM · THEO THỨ TỰ</div>
    ${DATA.ladder.map((s) => `<div class="row"><div>${stateIcon[s.state]} ${s.icon} ${e(s.label)}${s.state === "active" ? " · đang góp" : ""}<small>${s.target == null ? `${DATA.scholarship.units} suất · ${formatMillions(s.perUnit)}/suất` : `${formatMillions(s.filled)}/${formatMillions(s.target)}`}</small></div><b>${formatVnd(s.target == null ? DATA.scholarship.total : s.filled)}</b></div>`).join("")}
    <div class="sec">ĐÃ CHI</div>
    ${L.expenses.length ? L.expenses.map((x) => `<div class="row"><div>${e(x.label)}<small>${e(x.date)}</small></div><b>−${formatVnd(x.amount)}</b></div>`).join("") : `<p class="note" style="padding-top:10px">${e(L.note)}</p>`}
    <p class="note" style="padding-top:12px">Không hiện số tiền của từng người — chỉ hiện tổng.</p>`;
}

function sheetClass(body) {
  const count = (s) => DATA.people.filter((p) => p.status === s).length;
  body.innerHTML = `<p class="note" style="padding-top:12px">🏅 ${count("paid")} đã đóng góp · 🙋 ${count("registered")} đã confirm · 😴 ${count("none")} chưa đi</p>` +
    DATA.people.map((p) => `<div class="who">${ringed(p)}<div>${e(p.name)}${badgeHtml(p)}<small>${p.mssv ? `🎓 ${e(p.mssv)}` : ""}${p.message ? ` · “${e(p.message)}”` : ""}</small>${noteHtml(p)}</div></div>`).join("");
}

const SHEETS = { "tham-gia": ["Tham gia họp mặt 15 năm", sheetJoin], "chuong-trinh": ["Chương trình ngày 01/11", sheetProgram], "thu-chi": ["Thu – chi công khai", sheetLedger], "ca-lop": ["Cả lớp CN49A", sheetClass] };

function route() {
  const s = SHEETS[location.hash.slice(1)];
  $("sheet").hidden = !s;
  document.body.style.overflow = s ? "hidden" : "";
  if (!s) return;
  $("sheet-title").textContent = s[0];
  $("sheet").scrollTop = 0;
  s[1]($("sheet-body"));
}

// ---------- Màn hình chúc mừng + pháo giấy ----------
function celebrate({ title, lines }, action = null) {
  const box = document.createElement("div");
  box.className = "celebrate";
  const colors = ["#fa7e1e", "#d62976", "#962fbf", "#4f5bd5", "#feda75", "#22c55e"];
  const confetti = Array.from({ length: 90 }, () => {
    const c = colors[Math.floor(Math.random() * colors.length)];
    return `<i style="left:${Math.random() * 100}%;background:${c};animation-delay:${(Math.random() * 1.2).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 1.8).toFixed(2)}s;transform:rotate(${Math.floor(Math.random() * 360)}deg)"></i>`;
  }).join("");
  box.innerHTML = `<div class="confetti">${confetti}</div>
    <div class="cel-card">
      <div class="cel-emoji">🥳</div>
      <h3>${e(title)}</h3>
      ${lines.map((l) => `<p>${e(l)}</p>`).join("")}
      ${action ? `<a class="cta grad" href="${e(action.href)}" target="_blank" rel="noopener">${e(action.label)}</a>` : ""}
      <a class="cel-home" href="#">🏠 Về trang chính</a>
    </div>`;
  box.querySelector(".cel-home").onclick = () => box.remove();
  box.onclick = (ev) => { if (ev.target === box) box.remove(); };
  document.body.appendChild(box);
}

// ---------- Phóng to ảnh (bấm vào bất kỳ ảnh nào, kể cả ảnh đại diện) ----------
function openLightbox(img) {
  const group = img.closest("[data-group], .mosaic, .list, #sheet-body") ?? document;
  const imgs = [...group.querySelectorAll("img[data-full]")];
  let i = Math.max(0, imgs.indexOf(img));
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `<button class="lb-x" aria-label="Đóng">✕</button><button class="lb-prev" aria-label="Ảnh trước">‹</button><img alt=""><button class="lb-next" aria-label="Ảnh sau">›</button><div class="lb-cap"></div>`;
  const show = () => {
    const cur = imgs[i];
    const big = box.querySelector("img");
    big.src = cur.dataset.full;
    big.classList.toggle("blur", cur.dataset.blur === "1");
    box.querySelector(".lb-cap").textContent = cur.dataset.cap ?? "";
    box.querySelector(".lb-prev").hidden = box.querySelector(".lb-next").hidden = imgs.length < 2;
  };
  const close = () => { box.remove(); document.removeEventListener("keydown", onKey); };
  const step = (d) => { i = (i + d + imgs.length) % imgs.length; show(); };
  const onKey = (ev) => { if (ev.key === "Escape") close(); if (ev.key === "ArrowLeft") step(-1); if (ev.key === "ArrowRight") step(1); };
  box.onclick = (ev) => {
    if (ev.target.classList.contains("lb-prev")) return step(-1);
    if (ev.target.classList.contains("lb-next")) return step(1);
    if (ev.target.tagName !== "IMG") close();
  };
  let x0 = null;
  box.addEventListener("touchstart", (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (ev) => { if (x0 === null) return; const dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50 && imgs.length > 1) step(dx < 0 ? 1 : -1); x0 = null; });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(box);
  show();
}

// Bắt ở pha capture để thắng cả link (cụm ảnh) và nút chọn tên
document.addEventListener("click", (ev) => {
  const img = ev.target.closest?.("img[data-full]");
  if (!img || img.closest(".lightbox")) return;
  ev.preventDefault();
  ev.stopPropagation();
  openLightbox(img);
}, true);

async function main() {
  const res = await fetch(`data.json?t=${Date.now()}`);
  DATA = await res.json();
  renderCountdown();
  setInterval(renderCountdown, 1000);
  renderRaised();
  renderHeader();
  renderUnlock();
  renderFeed();
  renderGallery();
  $("updated").textContent = new Date(DATA.generatedAt).toLocaleString("vi-VN");
  window.addEventListener("hashchange", route);
  route();
}

main().catch((err) => {
  document.querySelector(".app").insertAdjacentHTML("beforeend", `<p class="note">Không tải được dữ liệu. Hãy thử tải lại trang.</p>`);
  console.error(err);
});
