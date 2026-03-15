// ==================== orders.js ====================
window.addEventListener('load', async () => {
  await loadOrders();
});

async function loadOrders() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const orders = await window.fetchRecords('orders') || [];
    let html = '<h2>📦 الطلبات</h2>';
    html += '<table><tr><th>المنتج</th><th>السعر</th><th>المستخدم</th><th>الحالة</th><th>التاريخ</th></tr>';
    if (orders.length === 0) {
      html += '<tr><td colspan="5" style="text-align:center;">لا توجد طلبات</td></tr>';
    } else {
      orders.forEach(o => {
        const f = o.fields;
        html += `
          <tr>
            <td>${f.product || '-'}</td>
            <td>$${f.price || 0}</td>
            <td>${f.userEmail || '-'}</td>
            <td>${f.status === 'pending' ? '⏳ قيد الانتظار' : '✅ مكتمل'}</td>
            <td>${new Date(f.createdAt).toLocaleDateString()}</td>
          </tr>
        `;
      });
    }
    html += '</table>';
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
}