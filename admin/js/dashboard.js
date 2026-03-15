// ==================== dashboard.js ====================
// هذا الملف خاص بالصفحة الرئيسية (لوحة القيادة)

// تحميل الإحصائيات عند فتح الصفحة
window.addEventListener('load', async () => {
  await loadDashboardStats();
});

async function loadDashboardStats() {
  const contentDiv = document.getElementById('contentArea');
  contentDiv.innerHTML = '<p style="text-align:center;">⏳ جاري التحميل...</p>';

  try {
    // جلب البيانات من Airtable
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

    // التكلفة الكلية (افتراضية)
    const totalCost = 0;
    const netProfit = totalSales - totalCost;
    const receivedAmount = totalSales;

    // توليد HTML للإحصائيات
    const html = `
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
      <div class="maintenance-card">
        <div style="display: flex; align-items: center; gap: 15px;">
          <i class="fas fa-tools" style="font-size: 30px; color: #ef4444;"></i>
          <div>
            <h4 style="color: #ef4444;">وضع الصيانة</h4>
            <p style="color: #888;">التحكم بتفعيل أو إيقاف واجهة المستخدمين</p>
          </div>
        </div>
        <button class="maintenance-toggle" onclick="toggleMaintenance()">تفعيل وضع الصيانة</button>
      </div>

      <!-- الصف الثاني: إجمالي المبلغ المدين + عدد الطلبات هذا الشهر -->
      <div class="stats-row">
        <div class="stat-card">
          <h3>إجمالي المبلغ المدين</h3>
          <p>$${totalDebt.toFixed(2)}</p>
          <div style="margin-top: 10px;">
            <a href="pages/debt-balance.html" class="stat-link">عرض تفاصيل الرصيد المدين <i class="fas fa-arrow-left"></i></a>
          </div>
        </div>
        <div class="stat-card">
          <h3>عدد الطلبات هذا الشهر</h3>
          <p>${monthlyOrders}</p>
          <small>${monthRange}</small>
        </div>
      </div>

      <!-- الصف الثالث: بطاقات متعددة -->
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
          <h3>الطلبات قيد الانتظار</h3>
          <p>${pendingOrders}</p>
          <div>
            <a href="pages/orders.html" class="stat-link">إدارة الطلبات <i class="fas fa-arrow-left"></i></a>
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
            <a href="pages/users.html" class="stat-link">عرض المستخدمين <i class="fas fa-arrow-left"></i></a>
          </div>
        </div>
        <div class="stat-card">
          <h3>إجمالي رصيد المستخدمين</h3>
          <p>$${totalUserBalance.toFixed(2)}</p>
        </div>
      </div>

      <!-- الصف الرابع -->
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card">
          <h3>طلبات شحن معالجة</h3>
          <p>${processedCharges}</p>
          <div>
            <a href="pages/charges.html" class="stat-link">إدارة طلبات الشحن <i class="fas fa-arrow-left"></i></a>
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
            <a href="pages/orders.html" class="stat-link">عرض التفاصيل <i class="fas fa-arrow-left"></i></a>
          </div>
        </div>
      </div>
    `;

    contentDiv.innerHTML = html;
  } catch (error) {
    contentDiv.innerHTML = `<p style="color: red;">❌ حدث خطأ: ${error.message}</p>`;
    showToast('فشل تحميل الإحصائيات', 'error');
  }
}

// دالة تبديل وضع الصيانة من البطاقة
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
    // تحديث نص الزر
    const maintBtn = document.querySelector('.maintenance-toggle');
    if (maintBtn) maintBtn.textContent = newMode ? 'تعطيل وضع الصيانة' : 'تفعيل وضع الصيانة';
  } catch (error) {
    showToast('فشل تبديل وضع الصيانة', 'error');
  }
};