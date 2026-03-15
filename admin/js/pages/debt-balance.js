// ==================== debt-balance.js ====================
window.addEventListener('load', async () => {
  await loadDebtBalance();
});

async function loadDebtBalance() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const users = await window.fetchRecords('users') || [];
    const debtors = users.filter(u => (u.fields.debtBalance || 0) > 0);
    let html = '<h2>💸 الرصيد المدين</h2>';
    html += '<table><tr><th>المستخدم</th><th>الرصيد المدين</th></tr>';
    if (debtors.length === 0) {
      html += '<tr><td colspan="2" style="text-align:center;">لا يوجد مستخدمين مدينين</td></tr>';
    } else {
      debtors.forEach(u => {
        html += `<tr><td>${u.fields.email}</td><td>$${u.fields.debtBalance}</td></tr>`;
      });
    }
    html += '</table>';
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
}