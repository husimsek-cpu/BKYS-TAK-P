const STORAGE_KEY = "product-tracker-items-v2";

const form = document.getElementById("productForm");
const tbody = document.getElementById("productBody");
const rowTemplate = document.getElementById("rowTemplate");
const stats = document.getElementById("stats");
const searchInput = document.getElementById("search");
const emptyState = document.getElementById("emptyState");
const clearAllBtn = document.getElementById("clearAll");
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
  setTimeout(() => {
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

  return items.filter((item) => {
    return [item.name, item.sku, item.category].some((field) => field.toLowerCase().includes(query));
  });
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

    row.querySelector(".edit").addEventListener("click", () => {
      item.minStock += 1;
      save();
      render();
      showToast(`${item.name} minimum stok değeri ${item.minStock} oldu.`, "info");
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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const sku = document.getElementById("sku").value.trim().toUpperCase();
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

  const skuExists = items.some((i) => i.sku.toLowerCase() === sku.toLowerCase());
  if (skuExists) {
    showToast("Bu SKU zaten kayıtlı. Farklı bir SKU girin.", "danger");
    return;
  }

  items.unshift({ id: crypto.randomUUID(), name, sku, category, stock, minStock });
  save();
  form.reset();
  document.getElementById("stock").value = 0;
  document.getElementById("minStock").value = 5;
  render();
  showToast("Ürün eklendi.", "success");
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

render();
