  // 📁 Data Storage (localStorage)
  let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
  let invoiceChart = null;

  // 🎯 DOM Elements
  const invoiceForm = document.getElementById('invoiceForm');
  const invoiceTableBody = document.getElementById('invoiceTableBody');
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const notification = document.getElementById('notification');
  const totalAmountEl = document.getElementById('totalAmount');
  const pendingCountEl = document.getElementById('pendingCount');
  const suppliersCountEl = document.getElementById('suppliersCount');
  const badgesContainer = document.getElementById('badges');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const exportBtn = document.getElementById('exportBtn');

  // 🚀 Initialize
  document.addEventListener('DOMContentLoaded', () => {
    renderInvoices();
    updateStats();
    renderChart();
    checkBadges();
    setupDarkMode();
  });

  // 📝 Form Submission
  invoiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newInvoice = {
      id: Date.now().toString(),
      date: document.getElementById('date').value,
      amount: parseFloat(document.getElementById('amount').value),
      vat: parseFloat(document.getElementById('vat').value) || 0,
      supplier: document.getElementById('supplier').value,
      invoiceNumber: document.getElementById('invoiceNumber').value,
      contact: document.getElementById('contact').value,
      trackingNumber: document.getElementById('trackingNumber').value,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    invoices.push(newInvoice);
    saveInvoices();
    renderInvoices();
    updateStats();
    renderChart();
    checkBadges();
    
    // Reset form
    invoiceForm.reset();
    
    // Show success
    showNotification('Invoice saved successfully!');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  });

  // 🔍 Search & Filter
  searchInput.addEventListener('input', renderInvoices);
  filterSelect.addEventListener('change', renderInvoices);

  // 📁 File Upload (Real OCR with Tesseract.js)
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary)';
    dropZone.style.background = 'rgba(108, 92, 231, 0.1)';
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--border)';
    dropZone.style.background = 'transparent';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    dropZone.style.background = 'transparent';
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileUpload();
    }
  });
  fileInput.addEventListener('change', handleFileUpload);

  function handleFileUpload() {
    const file = fileInput.files[0];
    if (!file) return;
    
    processInvoiceWithOCR(file);
  }

  // 🖼️ Real OCR Processing
  async function processInvoiceWithOCR(file) {
    showProgress(0, "Initializing OCR...");
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: progress => {
            showProgress(Math.floor(progress.progress * 100), "Extracting text...");
          }
        }
      );
      
      showProgress(100, "Extraction complete!");
      const extractedData = parseExtractedText(text);
      autoFillForm(extractedData);
      
      // Award OCR badge
      if (!badges.ocrMaster.earned) {
        awardBadge('ocrMaster');
      }
      
    } catch (error) {
      showNotification("OCR failed: " + error.message, "error");
    }
  }

  function parseExtractedText(text) {
    console.log("Extracted text:", text);
    
    // Improved regex patterns for invoice data
    const amountMatch = text.match(/(Total|Amount Due|Balance).*?(\d{1,3}(?:,\d{3})*\.\d{2})/i);
    const dateMatch = text.match(/(Date|Invoice Date).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    const invoiceMatch = text.match(/(Invoice #|Number).*?([A-Z]{0,3}\d{5,10})/i);
    const supplierMatch = text.match(/^(.*?)\n|(From|Supplier).*?\n(.*?)\n/i);
    
    return {
      amount: amountMatch ? amountMatch[2].replace(/,/g, '') : "",
      date: dateMatch ? formatOCRDate(dateMatch[2]) : new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceMatch ? invoiceMatch[2] : "INV-" + Math.floor(Math.random() * 10000),
      supplier: supplierMatch ? (supplierMatch[1] || supplierMatch[3]) : "Unknown Supplier"
    };
  }

  function formatOCRDate(dateStr) {
    // Handle different date formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  function autoFillForm(data) {
    if (data.date) document.getElementById('date').value = data.date;
    if (data.amount) document.getElementById('amount').value = data.amount;
    if (data.supplier) document.getElementById('supplier').value = data.supplier;
    if (data.invoiceNumber) document.getElementById('invoiceNumber').value = data.invoiceNumber;
    
    showNotification('Form auto-filled from invoice!', 'success');
  }

  // 🌙 Dark Mode Toggle
  function setupDarkMode() {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
      
      const isDark = document.body.classList.contains('dark-mode');
      darkModeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });

    // Check saved preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkModeToggle.textContent = "☀️ Light Mode";
    }
  }

  // 📤 Export to CSV
  exportBtn.addEventListener('click', () => {
    const headers = ["Date", "Supplier", "Amount", "VAT", "Invoice #", "Contact", "Tracking #", "Status"];
    const csvContent = [
      headers.join(","),
      ...invoices.map(invoice => [
        `"${formatDate(invoice.date)}"`,
        `"${invoice.supplier}"`,
        invoice.amount.toFixed(2),
        invoice.vat.toFixed(2),
        `"${invoice.invoiceNumber}"`,
        `"${invoice.contact || ''}"`,
        `"${invoice.trackingNumber || ''}"`,
        `"${invoice.status}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification("Exported to CSV!", "success");
    awardBadge('exporter');
  });

  // 📊 Render Invoices
  function renderInvoices() {
    const searchTerm = searchInput.value.toLowerCase();
    const filter = filterSelect.value;
    
    let filteredInvoices = invoices.filter(invoice => {
      const matchesSearch = (
        invoice.supplier.toLowerCase().includes(searchTerm) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        invoice.contact?.toLowerCase().includes(searchTerm) ||
        invoice.trackingNumber?.toLowerCase().includes(searchTerm)
      );
      
      let matchesFilter = true;
      if (filter === 'thisMonth') {
        const thisMonth = new Date().getMonth();
        const invoiceMonth = new Date(invoice.date).getMonth();
        matchesFilter = thisMonth === invoiceMonth;
      } else if (filter === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesFilter = new Date(invoice.date) >= thirtyDaysAgo;
      }
      
      return matchesSearch && matchesFilter;
    });
    
    invoiceTableBody.innerHTML = filteredInvoices.map(invoice => `
      <tr>
        <td>${formatDate(invoice.date)}</td>
        <td>${invoice.supplier}</td>
        <td>$${invoice.amount.toFixed(2)}</td>
        <td>${invoice.invoiceNumber}</td>
        <td><span class="status ${invoice.status}">${invoice.status}</span></td>
        <td>
          <button onclick="deleteInvoice('${invoice.id}')" class="delete-btn">🗑️</button>
        </td>
      </tr>
    `).join('');
    
    animateTableRowAppear();
  }

  // 🗑️ Delete Invoice
  function deleteInvoice(id) {
    invoices = invoices.filter(invoice => invoice.id !== id);
    saveInvoices();
    renderInvoices();
    updateStats();
    renderChart();
    showNotification('Invoice deleted!', 'warning');
  }

  // 📈 Update Stats
  function updateStats() {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingCount = invoices.filter(i => i.status === 'pending').length;
    const suppliersCount = new Set(invoices.map(i => i.supplier)).size;
    
    totalAmountEl.textContent = `$${totalAmount.toFixed(2)}`;
    pendingCountEl.textContent = pendingCount;
    suppliersCountEl.textContent = suppliersCount;
  }

  // 🎨 Render Chart
  function renderChart() {
    const ctx = document.getElementById('invoiceChart').getContext('2d');
    
    // Group by month
    const monthlyData = {};
    invoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += invoice.amount;
    });
    
    const labels = Object.keys(monthlyData).sort().map(label => {
      const [year, month] = label.split('-');
      return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
    });
    const data = Object.keys(monthlyData).sort().map(label => monthlyData[label]);
    
    if (invoiceChart) {
      invoiceChart.destroy();
    }
    
    invoiceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Invoice Amount ($)',
          data: data,
          backgroundColor: 'rgba(108, 92, 231, 0.7)',
          borderColor: 'rgba(108, 92, 231, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `$${value}`
            }
          }
        }
      }
    });
  }

  // 🏆 Badges System
  const badges = {
    firstInvoice: { earned: false, icon: "🥇", title: "First Invoice" },
    bigSpender: { earned: false, icon: "💸", title: "Big Spender ($10k+)" },
    exporter: { earned: false, icon: "📤", title: "Data Exporter" },
    ocrMaster: { earned: false, icon: "🔍", title: "OCR Master" }
  };

  function checkBadges() {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    if (invoices.length > 0 && !badges.firstInvoice.earned) {
      awardBadge('firstInvoice');
    }
    if (totalAmount >= 10000 && !badges.bigSpender.earned) {
      awardBadge('bigSpender');
    }
  }

  function awardBadge(badgeKey) {
    badges[badgeKey].earned = true;
    showNotification(`🏆 Earned badge: ${badges[badgeKey].title} ${badges[badgeKey].icon}`);
    
    // Show badge in UI
    const badgeEl = document.createElement('span');
    badgeEl.className = 'badge';
    badgeEl.textContent = `${badges[badgeKey].icon} ${badges[badgeKey].title}`;
    badgesContainer.appendChild(badgeEl);
    
    // Celebrate!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // 💾 Save to localStorage
  function saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }

  // 📅 Format Date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // 🔔 Show Notification
  function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  // 📊 Animated Progress Bar
  function showProgress(percent, message) {
    progressBar.style.display = 'flex';
    progressBar.querySelector('.progress').style.width = `${percent}%`;
    progressText.textContent = message;
    
    if (percent >= 100) {
      setTimeout(() => {
        progressBar.style.display = 'none';
      }, 1000);
    }
  }

  // ✨ Animate Table Rows
  function animateTableRowAppear() {
    const rows = document.querySelectorAll('#invoiceTableBody tr');
    rows.forEach((row, i) => {
      row.style.opacity = 0;
      row.style.transform = 'translateY(20px)';
      row.style.transition = `all 0.3s ease ${i * 0.1}s`;
      
      setTimeout(() => {
        row.style.opacity = 1;
        row.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  // Make deleteInvoice available globally
  window.deleteInvoice = deleteInvoice;