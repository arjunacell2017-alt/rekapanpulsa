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
