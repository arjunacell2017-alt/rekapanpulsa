export const formatRupiah = (value: number) => {
  const abs = Math.abs(Math.round(value));
  const str = "Rp" + abs.toLocaleString("id-ID");
  return value < 0 ? "-" + str : str;
};

export const parseAngka = (value: string) => {
  const cleaned = value.replace(/[^0-9,-]/g, "").replace(/(?!^)-/g, "").replace(",", ".");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
};

export const formatTanggal = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const toISODate = (d: Date) => {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
};

/**
 * Parser saldo Rupiah dari Otomax/Excel → integer rupiah.
 * Titik/koma diikuti tepat 3 digit = pemisah ribuan; diikuti 1–2 digit di akhir = desimal (dibuang/dibulatkan).
 * Contoh: "134.698.696" → 134698696, "134,698,696" → 134698696, "Rp 1.234,50" → 1235.
 */
export const parseRupiah = (raw: string): number | null => {
  let s = raw.replace(/rp/gi, "").replace(/[\s\u00a0\u2000-\u200f\u202f']/g, "");
  if (!s) return null;
  const neg = /^-/.test(s) || /^\(.*\)$/.test(s);
  s = s.replace(/[()\-+]/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  let desimal = "";
  const m = s.match(/[.,](\d{1,2})$/);
  if (m) {
    desimal = m[1];
    s = s.slice(0, -m[0].length);
  }
  if (!/^\d{1,3}([.,]\d{3})*$|^\d+$/.test(s)) return null;
  let n = Number(s.replace(/[.,]/g, ""));
  if (desimal && Number(desimal) >= (desimal.length === 1 ? 5 : 50)) n += 1;
  return neg ? -n : n;
};
