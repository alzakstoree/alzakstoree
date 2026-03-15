// ==================== users.js ====================
window.addEventListener('load', async () => {
  await loadUsers();
});

async function loadUsers() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const users = await window.fetchRecords('users') || [];
    let html = '<h2>👥 المستخدمين</h2>';
    html += '<table><tr><th>البريد</th><th>الاسم</th><th>رصيد المحفظة</th><th>الرصيد المدين</th><th>السماح بالدين</th></tr>';
    if (users.length === 0) {
      html += '<tr><td colspan="5" style="text-align:center;">لا يوجد مستخدمين</td></tr>';
    } else {
      users.forEach(u => {
        const f = u.fields;
        html += `
          <tr>
            <td>${f.email || '-'}</td>
            <td>${f.name || '-'}</td>
            <td>$${f.walletBalance || 0}</td>
            <td>$${f.debtBalance || 0}</td>
            <td>${f.allowedDebt ? '✅' : '❌'}</td>
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