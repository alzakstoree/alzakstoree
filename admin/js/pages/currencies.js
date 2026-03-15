// ==================== currencies.js ====================
window.addEventListener('load', async () => {
  await loadCurrencies();
});

async function loadCurrencies() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const records = await window.fetchRecords('currencies') || [];
    let html = '<h2>💰 العملات</h2>';
    html += '<button class="add-btn" onclick="showAddCurrencyForm()">➕ إضافة عملة</button>';
    html += '<table><tr><th>الاسم</th><th>الرمز</th><th>سعر الصرف</th><th>إجراءات</th></tr>';

    if (records.length === 0) {
      html += '<tr><td colspan="4" style="text-align:center;">لا توجد عملات</td></tr>';
    } else {
      records.forEach(rec => {
        const f = rec.fields;
        html += `
          <tr>
            <td>${f.name || '-'}</td>
            <td>${f.symbol || '-'}</td>
            <td>${f.exchangeRate || 1}</td>
            <td>
              <button class="edit-btn" onclick="editCurrency('${rec.id}')">✏️</button>
              <button class="delete-btn" onclick="deleteCurrency('${rec.id}')">🗑️</button>
            </td>
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

window.showAddCurrencyForm = function() {
  const form = `
    <h3>➕ إضافة عملة</h3>
    <input id="curName" placeholder="اسم العملة">
    <input id="curSymbol" placeholder="الرمز">
    <input id="curRate" placeholder="سعر الصرف" value="1">
    <button onclick="saveCurrency()">حفظ</button>
  `;
  showModal('genericModal', form);
};

window.saveCurrency = async function() {
  const name = document.getElementById('curName')?.value;
  const symbol = document.getElementById('curSymbol')?.value;
  const rate = parseFloat(document.getElementById('curRate')?.value) || 1;
  if (!name || !symbol) return showToast('الرجاء إدخال الاسم والرمز', 'error');

  try {
    await window.createRecord('currencies', { name, symbol, exchangeRate: rate });
    showToast('✅ تمت الإضافة');
    closeModal('genericModal');
    loadCurrencies();
  } catch (error) {
    showToast('فشل الإضافة', 'error');
  }
};

window.editCurrency = async function(id) {
  const records = await window.fetchRecords('currencies') || [];
  const rec = records.find(r => r.id === id);
  if (!rec) return showToast('غير موجود', 'error');
  const f = rec.fields;
  const form = `
    <h3>✏️ تعديل عملة</h3>
    <input id="curNameEdit" value="${f.name || ''}" placeholder="اسم العملة">
    <input id="curSymbolEdit" value="${f.symbol || ''}" placeholder="الرمز">
    <input id="curRateEdit" value="${f.exchangeRate || 1}" placeholder="سعر الصرف">
    <button onclick="updateCurrency('${id}')">تحديث</button>
  `;
  showModal('genericModal', form);
};

window.updateCurrency = async function(id) {
  const name = document.getElementById('curNameEdit')?.value;
  const symbol = document.getElementById('curSymbolEdit')?.value;
  const rate = parseFloat(document.getElementById('curRateEdit')?.value) || 1;
  if (!name || !symbol) return showToast('الرجاء إدخال الاسم والرمز', 'error');

  try {
    await window.updateRecord('currencies', id, { name, symbol, exchangeRate: rate });
    showToast('✅ تم التحديث');
    closeModal('genericModal');
    loadCurrencies();
  } catch (error) {
    showToast('فشل التحديث', 'error');
  }
};

window.deleteCurrency = async function(id) {
  if (!confirm('حذف العملة؟')) return;
  try {
    await window.deleteRecord('currencies', id);
    showToast('✅ تم الحذف');
    loadCurrencies();
  } catch (error) {
    showToast('فشل الحذف', 'error');
  }
};