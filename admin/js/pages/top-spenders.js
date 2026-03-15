// ==================== top-spenders.js ====================
window.addEventListener('load', async () => {
  await loadTopSpenders();
});

async function loadTopSpenders() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const orders = await window.fetchRecords('orders') || [];
    const spending = {};
    orders.forEach(o => {
      const email = o.fields.userEmail;
      const price = o.fields.price || 0;
      if (email) spending[email] = (spending[email] || 0) + price;
    });
    const sorted = Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 10);
    let html = '<h2>🏆 المستخدمون الأكثر صرفاً</h2>';
    html += '<table><tr><th>البريد</th><th>الإجمالي</th></tr>';
    if (sorted.length === 0) {
      html += '<tr><td colspan="2" style="text-align:center;">لا توجد بيانات</td></tr>';
    } else {
      sorted.forEach(([email, total]) => {
        html += `<tr><td>${email}</td><td>$${total.toFixed(2)}</td></tr>`;
      });
    }
    html += '</table>';
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
}