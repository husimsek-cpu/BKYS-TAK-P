const STORAGE_KEY = "product-tracker-items-v3";

const form = document.getElementById("productForm");
const tbody = document.getElementById("productBody");
const rowTemplate = document.getElementById("rowTemplate");
const stats = document.getElementById("stats");
const searchInput = document.getElementById("search");
const emptyState = document.getElementById("emptyState");
const clearAllBtn = document.getElementById("clearAll");
const exportCsvBtn = document.getElementById("exportCsv");
const importCsvBtn = document.getElementById("importCsv");
const csvFileInput = document.getElementById("csvFile");
const toast = document.getElementById("toast");

const seedData = [
  { id: crypto.randomUUID(), name: "Kablosuz Mouse", sku: "MSE-100", category: "Aksesuar", stock: 12, minStock: 5 },
  { id: crypto.randomUUID(), name: "USB-C Kablo", sku: "CBL-210", category: "Kablo", stock: 4, minStock: 6 },
  { id: crypto.randomUUID(), name: "Mekanik Klavye", sku: "KEY-900", category: "Klavye", stock: 0, minStock: 2 },
];

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedData;
  } catch {
    return seedData;
  }
}

let items = loadItems();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.dataset.type = type;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function getStatus(item) {
  if (item.stock === 0) return { label: "Tükendi", className: "out" };
  if (item.stock <= item.minStock) return { label: "Kritik", className: "low" };
  return { label: "Stokta", className: "ok" };
}

function renderStats(currentItems) {
  const total = currentItems.length;
  const out = currentItems.filter((i) => i.stock === 0).length;
  const low = currentItems.filter((i) => i.stock > 0 && i.stock <= i.minStock).length;
  const healthy = currentItems.filter((i) => i.stock > i.minStock).length;

  stats.innerHTML = `
    <article class="stat-card"><span>Toplam Ürün</span><strong>${total}</strong></article>
    <article class="stat-card"><span>Sağlıklı Stok</span><strong>${healthy}</strong></article>
    <article class="stat-card warn"><span>Kritik Stok</span><strong>${low}</strong></article>
    <article class="stat-card danger"><span>Tükenen</span><strong>${out}</strong></article>
  `;
}

function filterItems() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => [item.name, item.sku, item.category].some((f) => f.toLowerCase().includes(query)));
}

function render() {
  const visibleItems = filterItems();
  tbody.innerHTML = "";

  visibleItems.forEach((item) => {
    const row = rowTemplate.content.cloneNode(true);
    row.querySelector(".name").textContent = item.name;
    row.querySelector(".sku").textContent = item.sku;
    row.querySelector(".category").textContent = item.category;
    row.querySelector(".stock").textContent = item.stock;
    row.querySelector(".min-stock").textContent = item.minStock;

    const status = getStatus(item);
    const statusEl = row.querySelector(".status");
    statusEl.textContent = status.label;
    statusEl.classList.add(status.className);

    row.querySelector(".increment").addEventListener("click", () => {
      item.stock += 1;
      save();
      render();
    });

    row.querySelector(".decrement").addEventListener("click", () => {
      item.stock = Math.max(0, item.stock - 1);
      save();
      render();
    });

    row.querySelector(".edit-min").addEventListener("click", () => {
      item.minStock += 1;
      save();
      render();
      showToast(`${item.name} minimum stok değeri ${item.minStock} oldu.`, "info");
    });

    row.querySelector(".edit").addEventListener("click", () => {
      const nextName = window.prompt("Ürün adı", item.name);
      if (nextName === null) return;
      const nextCategory = window.prompt("Kategori", item.category);
      if (nextCategory === null) return;
      item.name = nextName.trim() || item.name;
      item.category = nextCategory.trim() || item.category;
      save();
      render();
      showToast("Ürün bilgileri güncellendi.", "success");
    });

    row.querySelector(".delete").addEventListener("click", () => {
      items = items.filter((x) => x.id !== item.id);
      save();
      render();
      showToast("Ürün silindi.", "danger");
    });

    tbody.appendChild(row);
  });

  emptyState.hidden = visibleItems.length > 0;
  renderStats(items);
}

function addItem({ name, sku, category, stock, minStock }) {
  const normalizedSku = sku.trim().toUpperCase();
  if (items.some((i) => i.sku.toLowerCase() === normalizedSku.toLowerCase())) {
    throw new Error(`SKU zaten mevcut: ${normalizedSku}`);
  }

  items.unshift({
    id: crypto.randomUUID(),
    name: name.trim(),
    sku: normalizedSku,
    category: category.trim(),
    stock: Number(stock),
    minStock: Number(minStock),
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const sku = document.getElementById("sku").value.trim();
  const category = document.getElementById("category").value.trim();
  const stock = Number(document.getElementById("stock").value);
  const minStock = Number(document.getElementById("minStock").value);

  if (!name || !sku || !category) {
    showToast("Lütfen zorunlu alanları doldurun.", "danger");
    return;
  }

  if (Number.isNaN(stock) || Number.isNaN(minStock) || stock < 0 || minStock < 0) {
    showToast("Stok değerleri 0 veya daha büyük olmalıdır.", "danger");
    return;
  }

  try {
    addItem({ name, sku, category, stock, minStock });
    save();
    form.reset();
    document.getElementById("stock").value = 0;
    document.getElementById("minStock").value = 5;
    render();
    showToast("Ürün eklendi.", "success");
  } catch (err) {
    showToast(err.message, "danger");
  }
});

searchInput.addEventListener("input", render);

clearAllBtn.addEventListener("click", () => {
  const ok = window.confirm("Tüm ürün verileri silinecek. Devam edilsin mi?");
  if (!ok) return;
  items = [];
  save();
  render();
  showToast("Tüm veriler temizlendi.", "danger");
});

function exportCsv() {
  const header = ["name", "sku", "category", "stock", "minStock"];
  const rows = items.map((i) => [i.name, i.sku, i.category, i.stock, i.minStock]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `urunler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("CSV dışa aktarıldı.", "success");
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || "");
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      showToast("CSV dosyası boş veya geçersiz.", "danger");
      return;
    }

    const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const required = ["name", "sku", "category", "stock", "minstock"];
    const isValid = required.every((key) => header.includes(key));
    if (!isValid) {
      showToast("CSV başlıkları hatalı. Beklenen: name,sku,category,stock,minStock", "danger");
      return;
    }

    const imported = [];
    for (const line of lines.slice(1)) {
      const cols = parseCsvLine(line);
      if (cols.length < 5) continue;
      const stock = Number(cols[3]);
      const minStock = Number(cols[4]);
      if (!cols[0] || !cols[1] || !cols[2] || Number.isNaN(stock) || Number.isNaN(minStock)) continue;
      imported.push({
        id: crypto.randomUUID(),
        name: cols[0].trim(),
        sku: cols[1].trim().toUpperCase(),
        category: cols[2].trim(),
        stock,
        minStock,
      });
    }

    const merged = new Map(items.map((i) => [i.sku.toLowerCase(), i]));
    imported.forEach((i) => merged.set(i.sku.toLowerCase(), i));
    items = [...merged.values()];
    save();
    render();
    showToast(`${imported.length} ürün CSV'den içe aktarıldı.`, "success");
  };

  reader.readAsText(file, "utf-8");
}

exportCsvBtn.addEventListener("click", exportCsv);
importCsvBtn.addEventListener("click", () => csvFileInput.click());
csvFileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  importCsv(file);
  csvFileInput.value = "";
});

render();
