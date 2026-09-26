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
