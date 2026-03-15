// ==================== payment-methods.js ====================
window.addEventListener('load', async () => {
  await loadPaymentMethods();
});

async function loadPaymentMethods() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    const records = await window.fetchRecords('payment_methods') || [];
    let html = '<h2>💳 طرق الدفع</h2>';
    html += '<button class="add-btn" onclick="showAddPaymentMethodForm()">➕ إضافة طريقة دفع جديدة</button>';
    html += '<div class="records-grid">';

    if (records.length === 0) {
      html += '<p style="text-align:center;">لا توجد طرق دفع مضافة بعد.</p>';
    } else {
      records.forEach(rec => {
        const f = rec.fields;
        html += `
          <div class="record-card" data-id="${rec.id}">
            <p><strong>${f.name || 'بدون اسم'}</strong></p>
            <p>رقم الحساب: ${f.accountNumber || '-'}</p>
            <p>صاحب الحساب: ${f.accountName || '-'}</p>
            ${f.image ? `<img src="${f.image}" style="max-width:100px;">` : ''}
            <div style="margin-top: 10px;">
              <button class="edit-btn" onclick="editPaymentMethod('${rec.id}')">✏️ تعديل</button>
              <button class="delete-btn" onclick="deletePaymentMethod('${rec.id}')">🗑️ حذف</button>
            </div>
          </div>
        `;
      });
    }
    html += '</div>';
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
}

window.showAddPaymentMethodForm = function() {
  const form = `
    <h3>➕ إضافة طريقة دفع</h3>
    <input id="pmName" placeholder="الاسم">
    <input id="pmNumber" placeholder="رقم الحساب/المحفظة">
    <input id="pmImage" placeholder="رابط الصورة (اختياري)">
    <input id="pmAccountName" placeholder="اسم صاحب الحساب (اختياري)">
    <button onclick="savePaymentMethod()">حفظ</button>
  `;
  showModal('genericModal', form);
};

window.savePaymentMethod = async function() {
  const name = document.getElementById('pmName')?.value;
  const number = document.getElementById('pmNumber')?.value;
  const image = document.getElementById('pmImage')?.value;
  const accountName = document.getElementById('pmAccountName')?.value;
  if (!name || !number) return showToast('الرجاء إدخال الاسم والرقم', 'error');

  try {
    await window.createRecord('payment_methods', {
      name,
      accountNumber: number,
      image: image || '',
      accountName: accountName || ''
    });
    showToast('✅ تمت الإضافة');
    closeModal('genericModal');
    loadPaymentMethods();
  } catch (error) {
    showToast('فشلت الإضافة', 'error');
  }
};

window.editPaymentMethod = async function(id) {
  const records = await window.fetchRecords('payment_methods') || [];
  const rec = records.find(r => r.id === id);
  if (!rec) return showToast('غير موجود', 'error');
  const f = rec.fields;
  const form = `
    <h3>✏️ تعديل طريقة دفع</h3>
    <input id="pmNameEdit" value="${f.name || ''}" placeholder="الاسم">
    <input id="pmNumberEdit" value="${f.accountNumber || ''}" placeholder="رقم الحساب">
    <input id="pmImageEdit" value="${f.image || ''}" placeholder="رابط الصورة">
    <input id="pmAccountNameEdit" value="${f.accountName || ''}" placeholder="اسم صاحب الحساب">
    <button onclick="updatePaymentMethod('${id}')">تحديث</button>
  `;
  showModal('genericModal', form);
};

window.updatePaymentMethod = async function(id) {
  const name = document.getElementById('pmNameEdit')?.value;
  const number = document.getElementById('pmNumberEdit')?.value;
  const image = document.getElementById('pmImageEdit')?.value;
  const accountName = document.getElementById('pmAccountNameEdit')?.value;
  if (!name || !number) return showToast('الرجاء إدخال الاسم والرقم', 'error');

  try {
    await window.updateRecord('payment_methods', id, {
      name,
      accountNumber: number,
      image: image || '',
      accountName: accountName || ''
    });
    showToast('✅ تم التحديث');
    closeModal('genericModal');
    loadPaymentMethods();
  } catch (error) {
    showToast('فشل التحديث', 'error');
  }
};

window.deletePaymentMethod = async function(id) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try {
    await window.deleteRecord('payment_methods', id);
    showToast('✅ تم الحذف');
    loadPaymentMethods();
  } catch (error) {
    showToast('فشل الحذف', 'error');
  }
};