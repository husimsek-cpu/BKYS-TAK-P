const STORAGE_KEY = "product-tracker-items";

const form = document.getElementById("productForm");
const tbody = document.getElementById("productBody");
const kpi = document.getElementById("kpi");
const rowTemplate = document.getElementById("rowTemplate");

const seedData = [
  { id: crypto.randomUUID(), name: "Kablosuz Mouse", sku: "MSE-100", category: "Aksesuar", stock: 12, minStock: 5 },
  { id: crypto.randomUUID(), name: "USB-C Kablo", sku: "CBL-210", category: "Kablo", stock: 4, minStock: 6 },
];

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData;
  try {
    return JSON.parse(raw);
  } catch {
    return seedData;
  }
}

let items = loadItems();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getStatus(item) {
  if (item.stock === 0) return { label: "Tükendi", className: "out" };
  if (item.stock <= item.minStock) return { label: "Azaldı", className: "low" };
  return { label: "Stokta", className: "ok" };
}

function render() {
  tbody.innerHTML = "";
  items.forEach((item) => {
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

    row.querySelector(".delete").addEventListener("click", () => {
      items = items.filter((x) => x.id !== item.id);
      save();
      render();
    });

    tbody.appendChild(row);
  });

  const lowCount = items.filter((i) => i.stock <= i.minStock).length;
  kpi.textContent = `Toplam ürün: ${items.length} • Kritik stok: ${lowCount}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const sku = document.getElementById("sku").value.trim();
  const category = document.getElementById("category").value.trim();
  const stock = Number(document.getElementById("stock").value);
  const minStock = Number(document.getElementById("minStock").value);

  items.unshift({ id: crypto.randomUUID(), name, sku, category, stock, minStock });
  save();
  form.reset();
  document.getElementById("stock").value = 0;
  document.getElementById("minStock").value = 5;
  render();
});

render();
