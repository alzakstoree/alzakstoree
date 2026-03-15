// ==================== admin.js (نسخة كاملة بجميع الدوال) ====================
window.loadSection = async function(section) {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    let html = '';
    switch (section) {
      case 'dashboard':
        html = await loadDashboard();
        break;
      case 'paymentMethods':
        html = await loadPaymentMethods();
        break;
      case 'currencies':
        html = await loadCurrencies();
        break;
      case 'vipProfit':
        html = await loadVipProfit();
        break;
      case 'profitLog':
        html = await loadProfitLog();
        break;
      case 'users':
        html = await loadUsers();
        break;
      case 'debtBalance':
        html = await loadDebtBalance();
        break;
      case 'topSpenders':
        html = await loadTopSpenders();
        break;
      case 'notifications':
        html = '<h2>🔔 إرسال إشعار</h2><p>هذه الصفحة قيد التطوير.</p>';
        break;
      case 'providers':
        html = '<h2>🚚 إدارة المزودين</h2><p>هذه الصفحة قيد التطوير.</p>';
        break;
      case 'import':
        html = '<h2>📦 استيراد منتجات</h2><p>هذه الصفحة قيد التطوير.</p>';
        break;
      case 'maintenance':
        html = await loadMaintenance();
        break;
      default:
        html = '<h2>قسم غير معروف</h2>';
    }
    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل البيانات', 'error');
  }
};

// ===== الصفحة الرئيسية (لوحة القيادة) بالإحصائيات الكاملة =====
async function loadDashboard() {
  try {
    // جلب جميع البيانات المطلوبة من Airtable
    const products = await window.fetchRecords('products') || [];
    const users = await window.fetchRecords('users') || [];
    const orders = await window.fetchRecords('orders') || [];
    const charges = await window.fetchRecords('charges') || [];

    // إحصائيات المنتجات
    const activeProducts = products.length;

    // إحصائيات المستخدمين
    const totalUsers = users.length;
    const totalUserBalance = users.reduce((sum, u) => sum + (u.fields.walletBalance || 0), 0);
    const allowedDebtUsers = users.filter(u => u.fields.allowedDebt).length;

    // إحصائيات الطلبات
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.fields.status === 'pending').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.fields.price || 0), 0);

    // عدد الطلبات هذا الشهر
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const monthlyOrders = orders.filter(o => 
      o.fields.createdAt >= startOfMonth && o.fields.createdAt <= endOfMonth
    ).length;

    // تنسيق التاريخ للعرض
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthRange = `${lastDay.toLocaleDateString()} – ${firstDay.toLocaleDateString()}`;

    // إحصائيات الشحن
    const processedCharges = charges.filter(c => c.fields.status === 'completed').length;

    // إحصائيات الدين
    const totalDebt = users.reduce((sum, u) => sum + (u.fields.debtBalance || 0), 0);

    // التكلفة الكلية (مثال افتراضي، يمكن تعديله حسب بياناتك)
    const totalCost = 0; // سيتم تحديثه لاحقاً إذا كان لديك حقل cost

    // الأرباح الصافية
    const netProfit = totalSales - totalCost;

    // المبلغ المستلم (نفترض أنه نفس totalSales)
    const receivedAmount = totalSales;

    return `
      <h2>📊 لوحة القيادة</h2>
      
      <!-- الصف الأول: إجمالي المبيعات، التكلفة الكلية، الأرباح الصافية، المبلغ المستلم -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
          <h3>إجمالي المبيعات</h3>
          <p>$${totalSales.toFixed(2)}</p>
          <small>المبلغ المستلم من العملاء</small>
        </div>
        <div class="stat-card">
          <h3>التكلفة الكلية</h3>
          <p>$${totalCost.toFixed(2)}</p>
          <small>تكلفة شراء المنتجات</small>
        </div>
        <div class="stat-card">
          <h3>الأرباح الصافية</h3>
          <p>$${netProfit.toFixed(2)}</p>
          <small>بعد خصم التكاليف</small>
        </div>
        <div class="stat-card">
          <h3>المبلغ المستلم</h3>
          <p>$${receivedAmount.toFixed(2)}</p>
          <small>من العملاء</small>
        </div>
      </div>

      <!-- بطاقة وضع الصيانة -->
      <div class="maintenance-card" style="background: #111; border: 2px solid #ef4444; border-radius: 20px; padding: 20px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <i class="fas fa-tools" style="font-size: 30px; color: #ef4444;"></i>
          <div>
            <h4 style="color: #ef4444; margin-bottom: 5px;">وضع الصيانة</h4>
            <p style="color: #888; font-size: 12px;">التحكم بتفعيل أو إيقاف واجهة المستخدمين</p>
          </div>
        </div>
        <button class="maintenance-toggle" onclick="toggleMaintenance()" style="background: #ef4444; color: #fff; border: none; border-radius: 30px; padding: 10px 25px; font-weight: 700; cursor: pointer;">
          تفعيل وضع الصيانة
        </button>
      </div>

      <!-- الصف الثاني: إجمالي المبلغ المدين + عدد الطلبات هذا الشهر -->
      <div class="stats-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div class="stat-card">
          <h3>إجمالي المبلغ المدين</h3>
          <p>$${totalDebt.toFixed(2)}</p>
          <div style="margin-top: 10px;">
            <span class="stat-link" onclick="loadSection('debtBalance')" style="color: #fbbf24; cursor: pointer;">
              عرض تفاصيل الرصيد المدين <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </div>
        <div class="stat-card">
          <h3>عدد الطلبات هذا الشهر</h3>
          <p>${monthlyOrders}</p>
          <small>${monthRange}</small>
        </div>
      </div>

      <!-- الصف الثالث: بطاقات متعددة -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px;">
        <div class="stat-card">
          <h3>الطلبات قيد الانتظار</h3>
          <p>${pendingOrders}</p>
          <div>
            <span class="stat-link" onclick="loadSection('orders')" style="color: #fbbf24; cursor: pointer;">
              إدارة الطلبات <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </div>
        <div class="stat-card">
          <h3>المنتجات النشطة</h3>
          <p>${activeProducts}</p>
        </div>
        <div class="stat-card">
          <h3>عدد المستخدمين</h3>
          <p>${totalUsers}</p>
          <div>
            <span class="stat-link" onclick="loadSection('users')" style="color: #fbbf24; cursor: pointer;">
              عرض المستخدمين <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </div>
        <div class="stat-card">
          <h3>إجمالي رصيد المستخدمين</h3>
          <p>$${totalUserBalance.toFixed(2)}</p>
        </div>
      </div>

      <!-- الصف الرابع: المزيد من البطاقات -->
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div class="stat-card">
          <h3>طلبات شحن معالجة</h3>
          <p>${processedCharges}</p>
          <div>
            <span class="stat-link" onclick="loadSection('charges')" style="color: #fbbf24; cursor: pointer;">
              إدارة طلبات الشحن <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </div>
        <div class="stat-card">
          <h3>المستخدمون المسموح لهم برصيد مدين</h3>
          <p>${allowedDebtUsers}</p>
        </div>
        <div class="stat-card">
          <h3>عدد الطلبات</h3>
          <p>${totalOrders}</p>
          <div>
            <span class="stat-link" onclick="loadSection('orders')" style="color: #fbbf24; cursor: pointer;">
              عرض التفاصيل <i class="fas fa-arrow-left"></i>
            </span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('خطأ في تحميل لوحة القيادة:', error);
    return '<p style="color: red;">❌ حدث خطأ في تحميل الإحصائيات</p>';
  }
};

// ===== طرق الدفع =====
async function loadPaymentMethods() {
  const records = await window.fetchRecords('payment_methods') || [];
  let html = '<h2>💳 طرق الدفع</h2>';
  html += '<button class="add-btn" onclick="showAddPaymentMethodForm()">➕ إضافة طريقة دفع</button>';
  html += '<div class="records-grid">';
  
  records.forEach(rec => {
    const f = rec.fields;
    html += `
      <div class="record-card" data-id="${rec.id}">
        <p><strong>${f.name || 'بدون اسم'}</strong></p>
        <p>رقم الحساب: ${f.accountNumber || '-'}</p>
        <p>صاحب الحساب: ${f.accountName || '-'}</p>
        ${f.image ? `<img src="${f.image}" style="max-width:100px;">` : ''}
        <br>
        <button onclick="editPaymentMethod('${rec.id}')">✏️ تعديل</button>
        <button onclick="deletePaymentMethod('${rec.id}')">🗑️ حذف</button>
      </div>
    `;
  });
  html += '</div>';
  return html;
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
    loadSection('paymentMethods');
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
    <h3>✏️ تعديل طريقة الدفع</h3>
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
    loadSection('paymentMethods');
  } catch (error) {
    showToast('فشل التحديث', 'error');
  }
};

window.deletePaymentMethod = async function(id) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try {
    await window.deleteRecord('payment_methods', id);
    showToast('✅ تم الحذف');
    loadSection('paymentMethods');
  } catch (error) {
    showToast('فشل الحذف', 'error');
  }
};

// ===== العملات =====
async function loadCurrencies() {
  const records = await window.fetchRecords('currencies') || [];
  let html = '<h2>💰 العملات</h2>';
  html += '<button class="add-btn" onclick="showAddCurrencyForm()">➕ إضافة عملة</button>';
  html += '<table><tr><th>الاسم</th><th>الرمز</th><th>سعر الصرف</th><th>إجراءات</th></tr>';
  records.forEach(rec => {
    const f = rec.fields;
    html += `
      <tr>
        <td>${f.name || '-'}</td>
        <td>${f.symbol || '-'}</td>
        <td>${f.exchangeRate || 1}</td>
        <td>
          <button onclick="editCurrency('${rec.id}')">✏️</button>
          <button onclick="deleteCurrency('${rec.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });
  html += '</table>';
  return html;
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
    loadSection('currencies');
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
    loadSection('currencies');
  } catch (error) {
    showToast('فشل التحديث', 'error');
  }
};

window.deleteCurrency = async function(id) {
  if (!confirm('حذف العملة؟')) return;
  try {
    await window.deleteRecord('currencies', id);
    showToast('✅ تم الحذف');
    loadSection('currencies');
  } catch (error) {
    showToast('فشل الحذف', 'error');
  }
};

// ===== نسبة ربح VIP =====
async function loadVipProfit() {
  const records = await window.fetchRecords('vip_settings') || [];
  let rate = 0;
  if (records.length > 0) rate = records[0].fields.profitRate || 0;
  return `
    <h2>📈 نسبة ربح VIP</h2>
    <input type="number" id="vipRate" value="${rate}" step="0.1" min="0" max="100">
    <button onclick="saveVipProfit()">حفظ</button>
  `;
}

window.saveVipProfit = async function() {
  const rate = parseFloat(document.getElementById('vipRate')?.value) || 0;
  try {
    const records = await window.fetchRecords('vip_settings') || [];
    if (records.length > 0) {
      await window.updateRecord('vip_settings', records[0].id, { profitRate: rate });
    } else {
      await window.createRecord('vip_settings', { profitRate: rate });
    }
    showToast('✅ تم الحفظ');
    loadSection('vipProfit');
  } catch (error) {
    showToast('فشل الحفظ', 'error');
  }
};

// ===== سجل الأرباح =====
async function loadProfitLog() {
  const orders = await window.fetchRecords('orders') || [];
  const totalSales = orders.reduce((sum, o) => sum + (o.fields.price || 0), 0);
  return `
    <h2>💰 سجل الأرباح</h2>
    <p>إجمالي المبيعات: $${totalSales.toFixed(2)}</p>
    <p>عدد الطلبات: ${orders.length}</p>
  `;
}

// ===== المستخدمين =====
async function loadUsers() {
  const users = await window.fetchRecords('users') || [];
  let html = '<h2>👥 المستخدمين</h2>';
  html += '<table><tr><th>البريد</th><th>الاسم</th><th>رصيد المحفظة</th><th>الرصيد المدين</th><th>السماح بالدين</th></tr>';
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
  html += '</table>';
  return html;
}

// ===== الرصيد المدين =====
async function loadDebtBalance() {
  const users = await window.fetchRecords('users') || [];
  const debtors = users.filter(u => (u.fields.debtBalance || 0) > 0);
  let html = '<h2>💸 الرصيد المدين</h2>';
  html += '<table><tr><th>المستخدم</th><th>الرصيد المدين</th></tr>';
  debtors.forEach(u => {
    html += `<tr><td>${u.fields.email}</td><td>$${u.fields.debtBalance}</td></tr>`;
  });
  html += '</table>';
  return html;
}

// ===== المستخدمون الأكثر صرفاً =====
async function loadTopSpenders() {
  const orders = await window.fetchRecords('orders') || [];
  const spending = {};
  orders.forEach(o => {
    const email = o.fields.userEmail;
    const price = o.fields.price || 0;
    if (email) spending[email] = (spending[email] || 0) + price;
  });
  const sorted = Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 10);
  let html = '<h2>🏆 المستخدمون الأكثر صرفاً</h2><table><tr><th>البريد</th><th>الإجمالي</th></tr>';
  sorted.forEach(([email, total]) => {
    html += `<tr><td>${email}</td><td>$${total.toFixed(2)}</td></tr>`;
  });
  html += '</table>';
  return html;
}

// ===== وضع الصيانة =====
async function loadMaintenance() {
  const records = await window.fetchRecords('settings') || [];
  let mode = false;
  if (records.length > 0) mode = records[0].fields.maintenanceMode || false;
  return `
    <h2>🔧 وضع الصيانة</h2>
    <label>
      <input type="checkbox" id="maintenanceCheck" ${mode ? 'checked' : ''}>
      تفعيل وضع الصيانة
    </label>
    <button onclick="saveMaintenance()">حفظ</button>
  `;
}

window.saveMaintenance = async function() {
  const enabled = document.getElementById('maintenanceCheck')?.checked || false;
  try {
    const records = await window.fetchRecords('settings') || [];
    if (records.length > 0) {
      await window.updateRecord('settings', records[0].id, { maintenanceMode: enabled });
    } else {
      await window.createRecord('settings', { maintenanceMode: enabled });
    }
    showToast('✅ تم الحفظ');
    loadSection('maintenance');
  } catch (error) {
    showToast('فشل الحفظ', 'error');
  }
};

// دالة تبديل وضع الصيانة من البطاقة الرئيسية
window.toggleMaintenance = async function() {
  try {
    const records = await window.fetchRecords('settings') || [];
    const currentMode = records.length > 0 ? (records[0].fields.maintenanceMode || false) : false;
    const newMode = !currentMode;
    
    if (records.length > 0) {
      await window.updateRecord('settings', records[0].id, { maintenanceMode: newMode });
    } else {
      await window.createRecord('settings', { maintenanceMode: newMode });
    }
    
    showToast(newMode ? '🔧 وضع الصيانة مفعل' : '✅ وضع الصيانة معطل', 'info');
    loadSection('maintenance'); // تحديث القسم
    // تحديث نص الزر في لوحة القيادة إذا كان ظاهراً
    const maintBtn = document.querySelector('.maintenance-toggle');
    if (maintBtn) maintBtn.textContent = newMode ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة';
  } catch (error) {
    showToast('فشل تبديل وضع الصيانة', 'error');
  }
};

// ===== دوال مؤقتة للباقي =====
window.showVipUsers = function() { showToast('🚧 إدارة الدولاء قيد التطوير', 'info'); };
window.showReferrals = function() { showToast('🚧 الإجالات قيد التطوير', 'info'); };
window.showDesign = function() { showToast('🚧 التصميم قيد التطوير', 'info'); };
window.showOrderMessages = function() { showToast('🚧 رسائل الطلب قيد التطوير', 'info'); };
window.showOrderManagement = function() { showToast('🚧 إدارة الترتيب قيد التطوير', 'info'); };
window.showContactMethods = function() { showToast('🚧 وسائل التواصل قيد التطوير', 'info'); };
window.showAdminAccounts = function() { showToast('🚧 حسابات الإدارة قيد التطوير', 'info'); };
window.showTwoFactor = function() { showToast('🚧 الحقوق بخطوتين قيد التطوير', 'info'); };