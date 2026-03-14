// ==================== helpers.js ====================
// دوال مساعدة مشتركة للوحة التحكم

// دالة عرض الإشعارات (Toast)
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        alert(message);
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    // تغيير لون التوست حسب نوع الرسالة
    if (type === 'error') {
        toast.style.background = '#ef4444';
        toast.style.borderColor = '#fff';
    } else {
        toast.style.background = '#111';
        toast.style.borderColor = '#fbbf24';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
        // إعادة اللون الافتراضي بعد الإخفاء
        toast.style.background = '#111';
        toast.style.borderColor = '#fbbf24';
    }, 2000);
}

// دالة إظهار نافذة منبثقة (Modal)
export function showModal(modalId, content) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal not found:', modalId);
        return;
    }
    const contentDiv = modal.querySelector('.modal-content');
    if (contentDiv) {
        contentDiv.innerHTML = content;
    } else {
        modal.innerHTML = content;
    }
    modal.style.display = 'flex';
}

// دالة إغلاق النوافذ المنبثقة
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// ربط الدوال بـ window لتكون متاحة في الأحداث المضمنة (onclick)
window.showToast = showToast;
window.showModal = showModal;
window.closeModal = closeModal;

console.log('✅ helpers.js loaded');
