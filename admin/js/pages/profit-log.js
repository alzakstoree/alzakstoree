// ==================== profit-log.js ====================
window.addEventListener('load', async () => {
  await loadProfitLog();
});

async function loadProfitLog() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const orders = await window.fetchRecords('orders') || [];
    const totalSales = orders.reduce((sum, o) => sum + (o.fields.price || 0), 0);
    const html = `
      <h2>💰 سجل الأرباح</h2>
      <div class="stats-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="stat-card">
          <h3>إجمالي المبيعات</h3>
          <p>$${totalSales.toFixed(2)}</p>
        </div>
        <div class="stat-card">
          <h3>عدد الطلبات</h3>
          <p>${orders.length}</p>
        </div>
      </div>
    `;
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
}