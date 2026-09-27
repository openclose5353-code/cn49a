// Hàm thuần cho trình duyệt (cũng chạy được trong Node để kiểm thử).

export function stripDiacritics(s) {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

export function transferContent(prefix, name) {
  return `${prefix} ${stripDiacritics(name).replace(/[^A-Za-z0-9 ]+/g, "").replace(/\s+/g, " ").trim()}`;
}

export function qrUrl(bank, amount, content) {
  return `https://img.vietqr.io/image/${bank.bin}-${bank.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bank.accountName)}`;
}

export function countdownParts(targetMs, nowMs) {
  const d = Math.max(0, targetMs - nowMs);
  return {
    days: Math.floor(d / 86400e3),
    hours: Math.floor(d / 3600e3) % 24,
    minutes: Math.floor(d / 60e3) % 60,
    seconds: Math.floor(d / 1e3) % 60,
    done: d === 0,
  };
}

export function formatVnd(n) {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
}

export function formatMillions(n) {
  return n % 1000000 === 0 ? `${n / 1000000} triệu` : formatVnd(n);
}

export function extraUnlockText(amount, ladder, full = 1000000) {
  const extra = amount - full;
  if (extra <= 0) return null;
  const s = ladder.find((x) => x.state === "active");
  if (!s) return null;
  if (s.target == null) return `${formatMillions(extra)} góp thêm của bạn đi vào ${s.icon} ${s.label}.`;
  const left = s.target - s.filled;
  if (extra >= left) return `${formatMillions(extra)} góp thêm của bạn sẽ hoàn thành ${s.icon} ${s.label}! 🎉`;
  return `${formatMillions(extra)} góp thêm của bạn đi vào ${s.icon} ${s.label} — sau bạn chỉ còn ${formatMillions(left - extra)} nữa là đủ!`;
}

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Gói dữ liệu gửi lên Google Apps Script khi tải ảnh chụp chuyển khoản lên web.
export function uploadPayload({ person, amount, message, dataUrl }) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  return {
    personKey: person.key,
    personName: person.name,
    amount,
    message: String(message ?? "").trim().slice(0, 300),
    mime: m ? m[1] : "",
    data: m ? m[2] : "",
    website: "",
  };
}

// Tên gọi (chữ cuối của họ tên) — dùng trong lời rủ "Các bạn rủ Linh đi đi".
export function givenName(name) {
  return String(name ?? "").trim().split(/\s+/).pop();
}

// Dòng trạng thái cạnh tên: chưa đi / đã confirm / đã đóng góp.
export function statusNote(p) {
  if (p.status === "paid") return { cls: "paid", text: "Đã đóng góp" };
  if (p.status === "registered") return { cls: "registered", text: "Đã confirm – Xin mời bạn đóng tiền 💸" };
  return { cls: "none", text: `Chưa đi – Các bạn rủ ${givenName(p.name)} đi đi 🥺👉` };
}

// Huy hiệu cho người đã đóng: theo mức đóng góp; mức 1 triệu dùng 🏅.
export function tierFor(p, tiers) {
  if (p.status !== "paid") return null;
  const t = tiers.find((x) => x.badge === p.badge) ?? tiers[0];
  return { icon: t.badge || "🏅", name: t.name };
}

// Thanh trượt số người: vị trí các mốc trên thang 0 → sĩ số, phần đã đóng góp / đã confirm, mốc kế tiếp.
export function milestoneTrack({ paid, registered, classSize, milestones }) {
  const pct = (n) => (Math.min(n, classSize) / classSize) * 100;
  const markers = milestones.map((m) => ({
    ...m,
    pct: pct(m.people),
    remaining: Math.max(0, m.people - paid),
    unlocked: m.unlocked || paid >= m.people,
  }));
  const next = markers.find((m) => m.remaining > 0) ?? null;
  return {
    fillPct: pct(paid),
    ghostPct: pct(registered),
    markers,
    next,
    headline: next ? `Còn ${next.remaining} bạn nữa là mở khoá ${next.icon} ${next.label}!` : "🎉 Đã mở khoá tất cả quà cho cả lớp!",
  };
}

// Thanh quỹ góp thêm: các nấc cộng dồn trên thang 0 → tổng mục tiêu, trạng thái từng nấc, câu kế tiếp.
export function ladderTrack(ladder) {
  const STATUS = { done: "Đã mở", active: "Đang góp", locked: "Chưa tới" };
  const total = ladder.reduce((s, x) => s + (x.target ?? x.goalTarget ?? 0), 0);
  let cum = 0;
  const steps = ladder.map((x) => {
    const goal = x.target ?? x.goalTarget ?? 0;
    cum += goal;
    return { ...x, goal, endPct: total ? (cum / total) * 100 : 0, status: STATUS[x.state] };
  });
  const raised = ladder.reduce((s, x) => s + x.filled, 0);
  const a = ladder.find((x) => x.state === "active");
  let headline = "🎉 Đã mở khoá tất cả hạng mục!";
  if (a && a.target != null) headline = `Còn ${formatMillions(a.target - a.filled)} nữa là mở khoá ${a.icon} ${a.label}!`;
  else if (a) headline = `Đang góp cho ${a.icon} ${a.label}: đã có ${formatMillions(a.filled)}.`;
  return { total, raised, steps, headline };
}

// Lời chúc mừng sau khi tải ảnh lên web, hoặc trước khi mở nhóm Zalo để gửi ảnh.
export function thankYou(person, amount, via) {
  const name = givenName(person.name);
  const bye = "Hẹn gặp lại bạn ở buổi họp lớp Chủ nhật 01/11 nhé! 🥂";
  if (via === "upload") {
    return { title: `🎉 Cảm ơn ${name}!`, lines: [`Đã nhận ảnh chuyển khoản ${formatMillions(amount)} của bạn.`, "Vài phút nữa ảnh của bạn trên trang sẽ đổi sang viền màu 🌈", bye] };
  }
  return { title: `🎉 Tuyệt vời, ${name}!`, lines: ["Bước cuối: gửi ảnh chụp chuyển khoản vào nhóm Zalo CN49A.", "Vài phút sau ảnh của bạn trên trang sẽ đổi sang viền màu 🌈", bye] };
}

// Lưới dùng ảnh nhỏ photos/sm/…; bấm vào mở ảnh lớn photos/…
export const fullSrc = (src) => String(src).replace("photos/sm/", "photos/");

// Thứ tự ảnh (USER 27/09): album riêng → mới nhất trước.
// "Tất cả" → ảnh tải lên trong 24 giờ qua ở đầu (isNew), phần còn lại xáo theo ngày (giờ VN):
// cả lớp thấy cùng một thứ tự trong ngày, sang ngày mới đổi — trang luôn có vẻ mới.
export const NEW_MS = 864e5;
const vnDay = (t) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10);

function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function albumPhotos(gallery, key, now = Date.now()) {
  if (key !== "all") return gallery.filter((g) => g.album === key).sort((a, b) => b.ts - a.ts);
  const fresh = gallery.filter((g) => now - g.ts < NEW_MS).sort((a, b) => b.ts - a.ts).map((g) => ({ ...g, isNew: true }));
  const rest = gallery.filter((g) => now - g.ts >= NEW_MS).sort((a, b) => String(a.src).localeCompare(String(b.src)));
  const rnd = seededRandom(vnDay(now));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...fresh, ...rest];
}

// Album Video: clip trên web / trình phát Drive + link YouTube, mới bỏ lên nhất trước (USER 27/09)
export function videoList(clips, youtube) {
  return [...clips, ...youtube].sort((a, b) => (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0));
}
