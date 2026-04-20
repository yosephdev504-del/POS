/* ═══════════════════════════════════════════
   ISAS Baleadas — POS Logic (Updated)
   ═══════════════════════════════════════════ */

// ── Default Menu Data (loaded if localStorage is empty) ──
const DEFAULT_MENU = [
  { nombre: "Mantequilla", precio: 10 },
  { nombre: "Con Queso", precio: 15 },
  { nombre: "Queso y Mantequilla", precio: 20 },
  { nombre: "Huevo y Chorizo", precio: 25 },
  { nombre: "Con Huevo y Aguacate", precio: 45 },
  { nombre: "Aguacate", precio: 25 },
  { nombre: "Carne", precio: 35 },
  { nombre: "Parrillero", precio: 40 },
  { nombre: "Huevo Carne Aguacate", precio: 65 },
  { nombre: "Mega Baleada con Carne", precio: 100 },
  { nombre: "Huevo y Carne", precio: 50 },
  { nombre: "Carne y Aguacate", precio: 55 },
  { nombre: "Huevo", precio: 20 },
  { nombre: "Carne Queso Mantequilla", precio: 25 },
  { nombre: "Huevo Queso Mantequilla", precio: 40 },
  { nombre: "Salchicha", precio: 35 },
  { nombre: "Pollo Frito", precio: 35 },
  { nombre: "Carne Asada", precio: 35 },
  { nombre: "Huevo Duro", precio: 20 },
  { nombre: "Jugo Natural", precio: 20 }
];

// ═══════════════════════════════════════════
// MENU STORAGE — Read/Write from localStorage
// ═══════════════════════════════════════════
function loadMenu() {
  try {
    const stored = localStorage.getItem("isas_menu");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First load or invalid data: save defaults and return them
  localStorage.setItem("isas_menu", JSON.stringify(DEFAULT_MENU));
  return [...DEFAULT_MENU];
}

function saveMenu(menu) {
  localStorage.setItem("isas_menu", JSON.stringify(menu));
}

// ── State ──
let menu  = loadMenu();
let order = []; // { nombre, precio, qty }

// ── DOM Refs ──
const $ = (id) => document.getElementById(id);

const $menuGrid      = $("menu-grid");
const $productCount  = $("product-count");
const $orderList     = $("order-list");
const $emptyOrder    = $("empty-order");
const $totalAmount   = $("total-amount");
const $btnCharge     = $("btn-charge");
const $btnClear      = $("btn-clear-order");
const $customerAlias = $("customer-alias");
const $currentTime   = $("current-time");

// Search
const $searchInput   = $("search-input");
const $searchClear   = $("search-clear");
const $noResults     = $("no-results");

// Dashboard Modal
const $modalDashboard  = $("modal-overlay-dashboard");
const $btnDashboard    = $("btn-dashboard");
const $btnClearHist    = $("btn-clear-history");
const $statToday       = $("stat-today");
const $statWeek        = $("stat-week");
const $statCount       = $("stat-count");
const $salesTableBody  = $("sales-table-body");
const $noSalesMsg      = $("no-sales-msg");
const $btnExportCSV    = $("btn-export-csv");
const $btnPrint        = $("btn-print");

// Settings Modal
const $modalSettings       = $("modal-overlay-settings");
const $btnSettings         = $("btn-settings");
const $newProductName      = $("new-product-name");
const $newProductPrice     = $("new-product-price");
const $btnAddProduct       = $("btn-add-product");
const $settingsProductList = $("settings-product-list");
const $settingsCount       = $("settings-product-count");

// Print
const $printDate      = $("print-date");
const $printStatToday = $("print-stat-today");
const $printStatWeek  = $("print-stat-week");
const $printStatCount = $("print-stat-count");
const $printSalesBody = $("print-sales-body");

// Toast
const $toast    = $("toast");
const $toastMsg = $("toast-msg");


// ═══════════════════════════════════════════
// 1. MENU RENDERING
// ═══════════════════════════════════════════
function renderMenu() {
  $productCount.textContent = `${menu.length} productos`;
  $menuGrid.innerHTML = "";

  menu.forEach((item, idx) => {
    const card = document.createElement("button");
    card.className = "product-card";
    card.id = `product-${idx}`;
    card.dataset.name = item.nombre.toLowerCase();
    card.setAttribute("aria-label", `Agregar ${item.nombre} - L ${item.precio}`);
    card.innerHTML = `
      <span class="product-name">${item.nombre}</span>
      <span class="product-price">L ${item.precio}</span>
    `;
    card.addEventListener("click", () => addToOrder(idx));
    $menuGrid.appendChild(card);
  });

  // Re-apply search filter if active
  filterMenu();
}


// ═══════════════════════════════════════════
// 2. SEARCH — Real-time Filter
// ═══════════════════════════════════════════
function filterMenu() {
  const query = $searchInput.value.trim().toLowerCase();
  const cards = $menuGrid.querySelectorAll(".product-card");
  let visible = 0;

  cards.forEach(card => {
    const name = card.dataset.name;
    const matches = !query || name.includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });

  // Toggle no-results message
  $noResults.hidden = visible > 0;
  $searchClear.hidden = !query;
}

$searchInput.addEventListener("input", filterMenu);

$searchClear.addEventListener("click", () => {
  $searchInput.value = "";
  filterMenu();
  $searchInput.focus();
});


// ═══════════════════════════════════════════
// 3. ORDER MANAGEMENT
// ═══════════════════════════════════════════
function addToOrder(idx) {
  const item = menu[idx];
  if (!item) return;

  const existing = order.find(o => o.nombre === item.nombre);
  if (existing) {
    existing.qty++;
  } else {
    order.push({ nombre: item.nombre, precio: item.precio, qty: 1 });
  }

  // Flash card animation
  const card = $(`product-${idx}`);
  if (card) {
    card.classList.add("flash");
    setTimeout(() => card.classList.remove("flash"), 300);
  }

  renderOrder();
}

function changeQty(nombre, delta) {
  const item = order.find(o => o.nombre === nombre);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    order = order.filter(o => o.nombre !== nombre);
  }
  renderOrder();
}

function removeItem(nombre) {
  order = order.filter(o => o.nombre !== nombre);
  renderOrder();
}

function clearOrder() {
  order = [];
  $customerAlias.value = "";
  renderOrder();
}

function getTotal() {
  return order.reduce((sum, item) => sum + item.precio * item.qty, 0);
}


// ═══════════════════════════════════════════
// 4. ORDER RENDERING
// ═══════════════════════════════════════════
function renderOrder() {
  const total = getTotal();

  $emptyOrder.style.display = order.length === 0 ? "flex" : "none";

  // Remove previous items
  $orderList.querySelectorAll(".order-item").forEach(el => el.remove());

  order.forEach(item => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div class="order-item-info">
        <div class="order-item-name">${item.nombre}</div>
        <div class="order-item-price">L ${item.precio} c/u</div>
      </div>
      <div class="order-item-controls">
        <button class="qty-btn" data-action="minus" aria-label="Reducir cantidad">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" data-action="plus" aria-label="Aumentar cantidad">+</button>
      </div>
      <span class="order-item-subtotal">L ${(item.precio * item.qty).toFixed(2)}</span>
      <button class="btn-remove" aria-label="Eliminar ${item.nombre}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    row.querySelector('[data-action="minus"]').addEventListener("click", () => changeQty(item.nombre, -1));
    row.querySelector('[data-action="plus"]').addEventListener("click", () => changeQty(item.nombre, 1));
    row.querySelector(".btn-remove").addEventListener("click", () => removeItem(item.nombre));

    $orderList.appendChild(row);
  });

  $totalAmount.textContent = `L ${total.toFixed(2)}`;
  $btnCharge.disabled = order.length === 0;
}


// ═══════════════════════════════════════════
// 5. CHARGE / SAVE SALE + SEND TO KITCHEN
// ═══════════════════════════════════════════
function getNextPedidoNumber() {
  const num = parseInt(localStorage.getItem("isas_pedido_counter") || "0", 10) + 1;
  localStorage.setItem("isas_pedido_counter", num.toString());
  return num;
}

function chargeSale() {
  if (order.length === 0) return;

  const pedidoNum = getNextPedidoNumber();

  const sale = {
    id: Date.now(),
    pedido: pedidoNum,
    alias: $customerAlias.value.trim() || "Sin nombre",
    items: order.map(i => ({ nombre: i.nombre, precio: i.precio, qty: i.qty })),
    total: getTotal(),
    timestamp: new Date().toISOString()
  };

  // Save to sales history
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem("isas_sales", JSON.stringify(sales));

  // Push to kitchen queue (pending orders)
  const queue = getKitchenQueue();
  queue.push({
    id: sale.id,
    pedido: pedidoNum,
    alias: sale.alias,
    items: sale.items,
    timestamp: sale.timestamp
  });
  localStorage.setItem("isas_kitchen_queue", JSON.stringify(queue));

  showToast(`¡Pedido #${pedidoNum} cobrado — L ${sale.total.toFixed(2)}!`);
  clearOrder();
}

function getKitchenQueue() {
  try {
    return JSON.parse(localStorage.getItem("isas_kitchen_queue")) || [];
  } catch {
    return [];
  }
}


// ═══════════════════════════════════════════
// 6. LOCALSTORAGE HELPERS for SALES
// ═══════════════════════════════════════════
function getSales() {
  try {
    return JSON.parse(localStorage.getItem("isas_sales")) || [];
  } catch {
    return [];
  }
}

function getTodaySales() {
  const today = new Date().toDateString();
  return getSales().filter(s => new Date(s.timestamp).toDateString() === today);
}

function getWeekSales() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return getSales().filter(s => new Date(s.timestamp) >= monday);
}


// ═══════════════════════════════════════════
// 7. DASHBOARD MODAL
// ═══════════════════════════════════════════
function openDashboard() {
  const todaySales = getTodaySales();
  const weekSales  = getWeekSales();
  const allSales   = getSales();

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const weekTotal  = weekSales.reduce((sum, s) => sum + s.total, 0);

  $statToday.textContent = `L ${todayTotal.toFixed(2)}`;
  $statWeek.textContent  = `L ${weekTotal.toFixed(2)}`;
  $statCount.textContent = todaySales.length;

  // Build sales table
  renderSalesTable(allSales);

  $modalDashboard.hidden = false;
}

function renderSalesTable(sales) {
  if (sales.length === 0) {
    $salesTableBody.innerHTML = "";
    $noSalesMsg.hidden = false;
    return;
  }

  $noSalesMsg.hidden = true;
  const sorted = [...sales].reverse(); // newest first

  $salesTableBody.innerHTML = sorted.map(s => {
    const d = new Date(s.timestamp);
    const fecha = d.toLocaleDateString("es-HN");
    const hora  = d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const detalle = s.items.map(i => `${i.qty}× ${i.nombre}`).join(", ");
    return `
      <tr>
        <td>${fecha}</td>
        <td>${hora}</td>
        <td>${s.alias}</td>
        <td>${detalle}</td>
        <td class="sale-total-cell">L ${s.total.toFixed(2)}</td>
      </tr>
    `;
  }).join("");
}

function closeDashboard() {
  $modalDashboard.hidden = true;
}

function clearHistory() {
  if (!confirm("⚠️ ¿Estás seguro de que quieres borrar TODO el historial de ventas?")) return;
  if (!confirm("⚠️ Esta acción NO se puede deshacer. ¿Confirmar borrado?")) return;

  localStorage.removeItem("isas_sales");
  showToast("Historial de ventas borrado");
  closeDashboard();
}


// ═══════════════════════════════════════════
// 8. EXPORT CSV
// ═══════════════════════════════════════════
function exportCSV() {
  const sales = getSales();
  if (sales.length === 0) {
    showToast("No hay ventas para exportar");
    return;
  }

  // Build CSV string with BOM for Excel compatibility
  const BOM = "\uFEFF";
  const header = "Fecha,Hora,Alias,Detalle,Total (L)\n";
  const rows = sales.map(s => {
    const d = new Date(s.timestamp);
    const fecha = d.toLocaleDateString("es-HN");
    const hora  = d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const detalle = s.items.map(i => `${i.qty}x ${i.nombre}`).join(" + ");
    // Wrap fields in quotes to handle commas
    return `"${fecha}","${hora}","${s.alias}","${detalle}","${s.total.toFixed(2)}"`;
  }).join("\n");

  const csv = BOM + header + rows;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  // Create download link
  const a = document.createElement("a");
  a.href = url;
  const today = new Date().toISOString().slice(0, 10);
  a.download = `ISAS_Ventas_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Archivo CSV descargado");
}


// ═══════════════════════════════════════════
// 9. PRINT / PDF
// ═══════════════════════════════════════════
function printReport() {
  const todaySales = getTodaySales();
  const weekSales  = getWeekSales();
  const allSales   = getSales();

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const weekTotal  = weekSales.reduce((sum, s) => sum + s.total, 0);

  // Populate print-only section
  $printDate.textContent = `Generado: ${new Date().toLocaleString("es-HN")}`;
  $printStatToday.textContent = `L ${todayTotal.toFixed(2)}`;
  $printStatWeek.textContent  = `L ${weekTotal.toFixed(2)}`;
  $printStatCount.textContent = todaySales.length;

  // Build print table
  const sorted = [...allSales].reverse();
  $printSalesBody.innerHTML = sorted.map(s => {
    const d = new Date(s.timestamp);
    const fecha = d.toLocaleDateString("es-HN");
    const hora  = d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const detalle = s.items.map(i => `${i.qty}× ${i.nombre}`).join(", ");
    return `<tr><td>${fecha}</td><td>${hora}</td><td>${s.alias}</td><td>${detalle}</td><td style="text-align:right;font-weight:700">L ${s.total.toFixed(2)}</td></tr>`;
  }).join("");

  // Trigger print dialog
  window.print();
}


// ═══════════════════════════════════════════
// 10. SETTINGS MODAL — Dynamic Menu Management
// ═══════════════════════════════════════════
function openSettings() {
  renderSettingsProductList();
  $modalSettings.hidden = false;
}

function closeSettings() {
  $modalSettings.hidden = true;
}

function renderSettingsProductList() {
  $settingsCount.textContent = menu.length;
  $settingsProductList.innerHTML = "";

  menu.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "settings-product-row";
    row.innerHTML = `
      <input type="text" class="settings-name-input form-input" value="${item.nombre}" data-idx="${idx}" aria-label="Nombre de ${item.nombre}" style="flex: 1; margin-right: 8px; min-width: 120px; font-size: 0.9rem; padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px;"/>
      <span style="color:var(--text-muted);font-size:0.75rem;flex-shrink:0">L</span>
      <input type="number" class="settings-price-input form-input" value="${item.precio}" min="1" step="1" data-idx="${idx}" aria-label="Precio de ${item.nombre}" style="width: 70px; margin-left: 4px; padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px;"/>
      <button class="btn-save-price" data-idx="${idx}" title="Guardar cambios" aria-label="Guardar cambios" style="margin-left: 8px; padding: 6px; border: none; background: transparent; cursor: pointer; color: var(--primary);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
      <button class="btn-delete-product" data-idx="${idx}" title="Eliminar producto" aria-label="Eliminar ${item.nombre}" style="margin-left: 4px; padding: 6px; border: none; background: transparent; cursor: pointer; color: var(--danger);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    // Save changes
    row.querySelector(".btn-save-price").addEventListener("click", () => {
      const inputPrice = row.querySelector(".settings-price-input");
      const inputName = row.querySelector(".settings-name-input");
      
      const newPrice = parseFloat(inputPrice.value);
      const newName = inputName.value.trim();

      if (!newName) {
        showToast("El nombre no puede estar vacío");
        return;
      }
      if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Precio inválido");
        return;
      }
      
      // Update ongoing order if we are just changing price/name
      // To keep it simple, we just update the menu
      menu[idx].nombre = newName;
      menu[idx].precio = newPrice;
      
      saveMenu(menu);
      renderMenu();
      showToast(`Guardado: "${newName}" a L ${newPrice}`);
    });

    // Also save on Enter key
    const triggerSave = (e) => {
      if (e.key === "Enter") {
        row.querySelector(".btn-save-price").click();
      }
    };
    row.querySelector(".settings-price-input").addEventListener("keydown", triggerSave);
    row.querySelector(".settings-name-input").addEventListener("keydown", triggerSave);

    // Delete product
    row.querySelector(".btn-delete-product").addEventListener("click", () => {
      if (!confirm(`¿Eliminar "${item.nombre}" del menú?`)) return;
      menu.splice(idx, 1);
      saveMenu(menu);
      renderMenu();
      renderSettingsProductList();
      showToast(`"${item.nombre}" eliminado del menú`);
    });

    $settingsProductList.appendChild(row);
  });
}

function addProduct() {
  const name  = $newProductName.value.trim();
  const price = parseFloat($newProductPrice.value);

  if (!name) {
    showToast("Ingresa un nombre para el producto");
    $newProductName.focus();
    return;
  }
  if (isNaN(price) || price <= 0) {
    showToast("Ingresa un precio válido");
    $newProductPrice.focus();
    return;
  }

  // Check for duplicate
  if (menu.some(m => m.nombre.toLowerCase() === name.toLowerCase())) {
    showToast("Ya existe un producto con ese nombre");
    return;
  }

  menu.push({ nombre: name, precio: price });
  saveMenu(menu);

  // Clear form
  $newProductName.value  = "";
  $newProductPrice.value = "";

  renderMenu();
  renderSettingsProductList();
  showToast(`"${name}" agregado al menú`);
}


// ═══════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════
let toastTimer = null;

function showToast(msg) {
  $toastMsg.textContent = msg;
  $toast.hidden = false;
  void $toast.offsetWidth; // force reflow
  $toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $toast.classList.remove("show");
    setTimeout(() => { $toast.hidden = true; }, 300);
  }, 2500);
}


// ═══════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════
function updateClock() {
  $currentTime.textContent = new Date().toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}


// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════

// Charge & Clear
$btnCharge.addEventListener("click", chargeSale);
$btnClear.addEventListener("click", () => {
  if (order.length === 0) return;
  if (confirm("¿Limpiar el pedido actual?")) clearOrder();
});

// Dashboard
$btnDashboard.addEventListener("click", openDashboard);
$btnClearHist.addEventListener("click", clearHistory);
$btnExportCSV.addEventListener("click", exportCSV);
$btnPrint.addEventListener("click", printReport);

// Settings
$btnSettings.addEventListener("click", openSettings);
$btnAddProduct.addEventListener("click", addProduct);

// Submit add product with Enter
$newProductPrice.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addProduct();
});
$newProductName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $newProductPrice.focus();
});

// Close modals — generic handler using data-modal attribute
document.querySelectorAll(".btn-close-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.modal;
    if (target === "dashboard") closeDashboard();
    if (target === "settings") closeSettings();
  });
});

// Close modals on overlay click
$modalDashboard.addEventListener("click", (e) => {
  if (e.target === $modalDashboard) closeDashboard();
});
$modalSettings.addEventListener("click", (e) => {
  if (e.target === $modalSettings) closeSettings();
});

// Close modals on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!$modalDashboard.hidden) closeDashboard();
    if (!$modalSettings.hidden) closeSettings();
  }
});


// ═══════════════════════════════════════════
// CUSTOM LOGO UPLOAD
// ═══════════════════════════════════════════
const $logoUpload = $("logo-upload");
const $btnUploadLogo = $("btn-upload-logo");
const $brandLogo = $("brand-logo");

function loadBrandLogo() {
  const savedLogo = localStorage.getItem("pos_custom_logo");
  if (savedLogo) {
    if ($brandLogo) $brandLogo.src = savedLogo;
  }
}

if ($btnUploadLogo) {
  $btnUploadLogo.addEventListener("click", () => {
    if ($logoUpload) $logoUpload.click();
  });
}

if ($logoUpload) {
  $logoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      localStorage.setItem("pos_custom_logo", dataUrl);
      if ($brandLogo) $brandLogo.src = dataUrl;
      showToast("Logo actualizado");
    };
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function init() {
  loadBrandLogo();
  renderMenu();
  renderOrder();
  updateClock();
  setInterval(updateClock, 1000);
}

init();
