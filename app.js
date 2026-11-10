import { formatVnd, escapeHtml as e, fullSrc, albumPhotos, NEW_MS, videoList } from "./lib.js?v=20261110d";

const $ = (id) => document.getElementById(id);
let DATA;

const initials = (name) => e(name.trim().split(/\s+/).pop()?.[0] ?? "?");
const avatar = (p) =>
  p.avatar
    ? `<img src="${e(p.avatar)}" data-full="${e(p.avatarFull ?? p.avatar)}" data-cap="${e(p.name)}" alt="" loading="lazy">`
    : `<span class="ph">${initials(p.name)}</span>`;
const photo = (src, cap, [w, h] = []) =>
  `<img src="${e(src)}" data-full="${e(fullSrc(src))}" data-cap="${e(cap ?? "")}"${w ? ` data-w="${w}" data-h="${h}"` : ""} alt="" loading="lazy">`;
const ringed = (p) => `<span class="r ${p.status}">${avatar(p)}</span>`;
const hasVideo = (v) => v.youtubeId || v.src || v.drive;

// Sau buổi họp mặt, trang chủ là nơi xem lại clip và ảnh kỷ niệm (USER 10/11)
function renderHero() {
  $("hero").innerHTML = `<div class="lbl">🎉 CẢM ƠN CẢ LỚP ĐÃ VỀ TRƯỜNG</div>
    <div class="hero-t">${e(DATA.event.title)}</div>
    <div class="when"><span>📅 Chủ nhật 01/11/2026</span><span>📍 ${e(DATA.event.place)}</span></div>`;
}

function renderHeader() {
  const shown = DATA.people.filter((p) => p.status !== "none").slice(0, 14);
  const rest = DATA.people.length - shown.length;
  $("mosaic").innerHTML =
    shown.map((p) => `<a class="r ${p.status}" href="#ca-lop" title="${e(p.name)}">${avatar(p)}</a>`).join("") +
    (rest > 0 ? `<a class="more" href="#ca-lop" title="Xem cả lớp">+${rest}</a>` : "");
  const nClips = DATA.reunionVideos.filter(hasVideo).length + DATA.clips.length + DATA.youtube.length;
  $("stats").innerHTML = `<div><b>📸 ${DATA.gallery.length}</b>ảnh</div><div><b>🎬 ${nClips}</b>clip</div><div><b>👥 ${DATA.stats.classSize}</b>cả lớp</div>`;
  $("bio").innerHTML = `<div class="bio-title">🎓 CN49A · ${e(DATA.event.title)}</div>
    <div>🏫 QTKD Công nghiệp &amp; Xây dựng · KTQD 2007–2011</div>
    <div>💛 Nơi lưu lại clip và ảnh kỷ niệm 15 năm ra trường</div>`;
}

function renderReunionVideos() {
  const vids = DATA.reunionVideos;
  if (!vids.length) return;
  $("reunion-videos").innerHTML = `<h2 class="sec-t">🎬 Clip ngày hội 15 năm</h2>
    <div class="clips">${vids.map((v) => `<figure>${v.youtubeId
      ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${e(v.youtubeId)}" loading="lazy" allowfullscreen title="${e(v.title)}"></iframe></div>`
      : v.src
      ? `<video src="${e(v.src)}" poster="${e(v.poster ?? "")}" controls playsinline preload="none"></video>`
      : v.drive
      ? `<div class="video"><iframe src="https://drive.google.com/file/d/${e(v.drive)}/preview" loading="lazy" allow="autoplay; fullscreen" allowfullscreen title="${e(v.title)}"></iframe></div>`
      : `<div class="video soon"><span>🎬<br>Clip đang được cập nhật</span></div>`}
      <figcaption><b>${e(v.title)}</b>${v.desc ? `<br>${e(v.desc)}` : ""}</figcaption></figure>`).join("")}</div>`;
}

const PAGE = 60;
// Album 🎉 Ngày hội 15 năm đứng đầu, có ảnh thì mở sẵn
const REUNION = "reunion15";
const sortedAlbums = () => [...(DATA.albums ?? [])].sort((a, b) => (b.key === REUNION) - (a.key === REUNION));
const defaultAlbum = () => (DATA.albums ?? []).find((a) => a.key === REUNION)?.count ? REUNION : "all";
// Thứ tự album đổi mỗi giờ; giữ theo lúc mở trang để "Xem thêm" không lặp hay sót ảnh khi vừa sang giờ mới
const OPENED = Date.now();
let galleryItems = []; // cả album đang chọn — trình xem ảnh vuốt được hết, không chỉ 60 ảnh đang hiện
function renderGallery(key = defaultAlbum(), shown = PAGE) {
  const albums = sortedAlbums();
  const title = new Map(albums.map((a) => [a.key, `${a.emoji} ${a.title}`]));
  const cur = albums.find((a) => a.key === key);
  const imgs = key === "video" ? [] : albumPhotos(DATA.gallery, key, OPENED);
  const newCount = DATA.gallery.filter((g) => Date.now() - g.ts < NEW_MS).length;
  const allCover = albumPhotos(DATA.gallery, "all", OPENED)[0]?.src;
  const circle = (k, cover, emoji, label, count, unit = "ảnh") => `<button data-album="${k}" class="${key === k ? "on" : ""}${count ? "" : " empty"}">
      <span class="c">${cover ? `<img src="${e(cover)}" alt="" loading="lazy">` : `<i>${emoji}</i>`}</span>
      <b>${e(label)}</b><small>${count ? `${count} ${unit}` : "sắp có"}</small></button>`;
  const clips = DATA.clips ?? [];
  const yt = DATA.youtube ?? DATA.feed.filter((f) => f.type === "video");
  const nVideo = clips.length + yt.length;
  galleryItems = imgs.map((g) => ({ src: g.src, cap: [title.get(g.album), g.by].filter(Boolean).join(" · "), dims: [g.w, g.h] }));
  $("gallery").innerHTML = `<h2 class="sec-t">📸 Album kỷ niệm <small>${DATA.gallery.length} ảnh</small>${newCount ? `<span class="new-n">🆕 ${newCount} ảnh mới</span>` : ""}</h2>
    <div class="alb">${circle("all", allCover, "▦", "Tất cả", DATA.gallery.length)}${nVideo ? circle("video", clips[0]?.poster, "🎬", "Video", nVideo, "clip") : ""}${albums.map((a) => circle(a.key, albumPhotos(DATA.gallery, a.key, OPENED)[0]?.src ?? a.cover, a.emoji, a.title, a.count)).join("")}</div>
    ${cur && !cur.count ? `<p class="note">${cur.key === "reunion15" ? "Ảnh buổi họp mặt 01/11 đang được cập nhật 🎉" : "Chưa có ảnh"}</p>` : ""}
    ${key === "video" ? `<div class="clips">${videoList(clips, yt).map((c) => c.youtubeId
      ? `<figure><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${e(c.youtubeId)}" loading="lazy" allowfullscreen title="${e(c.title)}"></iframe></div><figcaption>${e(c.title)}</figcaption></figure>`
      : `<figure>${c.drive
      ? `<div class="video"><iframe src="https://drive.google.com/file/d/${e(c.drive)}/preview" loading="lazy" allow="autoplay; fullscreen" allowfullscreen title="${e(c.title)}"></iframe></div>`
      : `<video src="${e(c.src)}" poster="${e(c.poster)}" controls playsinline preload="none"></video>`}<figcaption>${e(c.title)}${c.duration ? ` · ${Math.floor(c.duration / 60)}:${String(c.duration % 60).padStart(2, "0")}` : ""}</figcaption></figure>`).join("")}</div>` : ""}
    <div class="grid3" data-group>${imgs.slice(0, shown).map((g, i) => photo(g.src, galleryItems[i].cap, [g.w, g.h])).join("")}</div>
    ${imgs.length > shown ? `<button class="more-photos" id="more-photos">Xem thêm ${Math.min(PAGE, imgs.length - shown)} ảnh · còn ${imgs.length - shown}</button>` : ""}`;
  $("gallery").querySelectorAll("[data-album]").forEach((b) => (b.onclick = () => renderGallery(b.dataset.album)));
  const more = $("more-photos");
  if (more) more.onclick = () => renderGallery(key, shown + PAGE);
}

// ---------- Màn hình phụ ----------
// Thu – chi (USER 10/11): ① thu từ những ai, bao nhiêu → ② chi từng khoản → ③ còn thừa (hoặc thiếu).
// Bạn góp đúng 1 triệu chỉ đếm số người; bạn góp nhiều hơn có tên + số tiền.
function sheetLedger(body) {
  const L = DATA.ledger;
  // Mọi khoản cùng một ngày → ghi ngày một lần ở tiêu đề
  const oneDay = L.expenses.length && L.expenses.every((x) => x.date === L.expenses[0].date) ? L.expenses[0].date : null;
  // Thu > chi → "Còn thừa"; chi > thu → "Còn thiếu" (USER 10/11: "Còn lại" dễ đọc nhầm)
  const left = L.balance >= 0 ? "Còn thừa" : "Còn thiếu";
  const row = (label, sub, amount, cls = "") => `<div class="row ${cls}"><div>${label}${sub ? `<small>${sub}</small>` : ""}</div><b>${amount}</b></div>`;
  body.innerHTML = `
    <div class="sum"><div style="background:#ecfdf3;color:#067647">Tổng thu<b>${formatVnd(L.income)}</b></div><div style="background:#fef3f2;color:#b42318">Đã chi<b>${formatVnd(L.expenseTotal)}</b></div><div style="background:#f4f3ff;color:#5925dc">${left}<b>${formatVnd(Math.abs(L.balance))}</b></div></div>
    <div class="sec">① THU · ${L.contributors} BẠN ĐÓNG GÓP</div>
    ${row(`${L.base.count} bạn × ${formatVnd(L.base.amount)}`, "mỗi bạn 1 triệu", formatVnd(L.base.count * L.base.amount))}
    ${L.bigger.length ? `<div class="sub-sec">${L.bigger.length} bạn góp nhiều hơn</div>${L.bigger.map((x) => row(e(x.name), "", formatVnd(x.amount))).join("")}` : ""}
    ${row("Tổng thu", "", formatVnd(L.income), "total")}
    <div class="sec">② CHI · ${L.expenses.length} KHOẢN${oneDay ? ` · NGÀY ${e(oneDay)}` : ""}</div>
    ${L.expenses.length ? L.expenses.map((x) => row(e(x.label), oneDay ? "" : e(x.date), `−${formatVnd(x.amount)}`)).join("") : `<p class="note" style="padding-top:10px">${e(L.note)}</p>`}
    ${row("Tổng chi", "", `−${formatVnd(L.expenseTotal)}`, "total")}
    <div class="sec">③ ${left.toUpperCase()}</div>
    ${row(left, `${formatVnd(L.income)} − ${formatVnd(L.expenseTotal)}`, formatVnd(Math.abs(L.balance)), "total")}`;
}

function sheetClass(body) {
  const paid = DATA.people.filter((p) => p.status === "paid").length;
  body.innerHTML = `<p class="note" style="padding-top:12px">👥 ${DATA.stats.classSize} bạn · 🌈 viền màu = ${paid} bạn đã góp quỹ</p>` +
    DATA.people.map((p) => `<div class="who">${ringed(p)}<div>${e(p.name)}<small>${p.mssv ? `🎓 ${e(p.mssv)}` : ""}${p.message ? ` · “${e(p.message)}”` : ""}</small></div></div>`).join("");
}

const SHEETS = { "thu-chi": ["Thu – chi công khai", sheetLedger], "ca-lop": ["Cả lớp CN49A", sheetClass] };

function route() {
  const s = SHEETS[location.hash.slice(1)];
  $("sheet").hidden = !s;
  document.body.style.overflow = s ? "hidden" : "";
  if (!s) return;
  $("sheet-title").textContent = s[0];
  $("sheet").scrollTop = 0;
  s[1]($("sheet-body"));
}

// ---------- Xem ảnh kiểu Zalo (USER 27/09): chụm/chạm đôi để phóng to, vuốt ngang chuyển ảnh, vuốt dọc để thoát ----------
// PhotoSwipe v5 (MIT) nạp từ CDN khi cần; trang vẫn nhẹ lúc mở.
const PSWP_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js";
let pswpModule = null;
const loadPswp = () => (pswpModule ??= import(PSWP_URL).then((m) => m.default));

// Kích thước ảnh lớn: lấy từ data-w/h (bộ xử lý đo sẵn); ảnh đại diện thì suy từ ảnh nhỏ đang hiện
function slideSize(img) {
  const w = Number(img.dataset.w), h = Number(img.dataset.h);
  if (w && h) return { width: w, height: h };
  const nw = img.naturalWidth, nh = img.naturalHeight;
  if (nw && nh) { const k = 1080 / Math.max(nw, nh); return { width: Math.round(nw * k), height: Math.round(nh * k) }; }
  return { width: 1080, height: 1080 };
}

async function openLightbox(img) {
  const fromEl = (el) => ({
    src: el.dataset.full, msrc: el.currentSrc || el.src, element: el, thumbCropped: true,
    alt: el.dataset.cap ?? "", cap: el.dataset.cap ?? "", ...slideSize(el),
  });
  let items, index;
  if (img.closest("#gallery .grid3")) {
    const shownEls = new Map([...document.querySelectorAll("#gallery .grid3 img[data-full]")].map((el) => [el.getAttribute("src"), el]));
    items = galleryItems.map((g) => {
      const el = shownEls.get(g.src);
      if (el) return fromEl(el);
      const [width = 1080, height = 1080] = g.dims[0] ? g.dims : [];
      return { src: fullSrc(g.src), msrc: g.src, width, height, alt: g.cap, cap: g.cap };
    });
    index = galleryItems.findIndex((g) => g.src === img.getAttribute("src"));
  } else {
    const group = img.closest("[data-group], .mosaic, .list, #sheet-body") ?? document;
    const els = [...group.querySelectorAll("img[data-full]")];
    items = els.map(fromEl);
    index = els.indexOf(img);
  }
  const PhotoSwipe = await loadPswp();
  const pswp = new PhotoSwipe({
    dataSource: items,
    index: Math.max(0, index),
    bgOpacity: 1, loop: false, padding: { top: 0, bottom: 0, left: 0, right: 0 },
    showHideAnimationType: "zoom", wheelToZoom: true, maxZoomLevel: 4,
    imageClickAction: "zoom-or-close", tapAction: "toggle-controls", doubleTapAction: "zoom",
    closeTitle: "Đóng", zoomTitle: "Phóng to", arrowPrevTitle: "Ảnh trước", arrowNextTitle: "Ảnh sau", errorMsg: "Không tải được ảnh",
  });
  pswp.on("uiRegister", () => {
    pswp.ui.registerElement({
      name: "caption", order: 9, isButton: false, appendTo: "root",
      onInit: (el) => pswp.on("change", () => { el.textContent = pswp.currSlide?.data.cap ?? ""; }),
    });
  });
  pswp.init();
}

// Bắt ở pha capture để thắng cả link (cụm ảnh) và nút chọn tên
document.addEventListener("click", (ev) => {
  const img = ev.target.closest?.("img[data-full]");
  if (!img || img.closest(".pswp")) return;
  ev.preventDefault();
  ev.stopPropagation();
  openLightbox(img);
}, true);

async function main() {
  const res = await fetch(`data.json?t=${Date.now()}`);
  DATA = await res.json();
  renderHero();
  renderHeader();
  renderReunionVideos();
  renderGallery();
  setTimeout(() => loadPswp().catch(() => {}), 1500); // nạp sẵn trình xem ảnh
  $("updated").textContent = new Date(DATA.generatedAt).toLocaleString("vi-VN");
  window.addEventListener("hashchange", route);
  route();
}

main().catch((err) => {
  document.querySelector(".app").insertAdjacentHTML("beforeend", `<p class="note">Không tải được dữ liệu. Hãy thử tải lại trang.</p>`);
  console.error(err);
});
