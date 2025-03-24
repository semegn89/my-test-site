// stats.js
import { showToast, showPreview } from './utils.js';

export function renderStatsPage() {
  const details = document.querySelector('.details');
  let payments = JSON.parse(localStorage.getItem('payments')) || [];
  const curUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isAdmin = (curUser.role === 'admin');

  // Если не админ, показываем только свои платежи
  if (!isAdmin) {
    payments = payments.filter(x => x.ownerEmail === curUser.email);
  }

  details.style.background = 'rgba(255,255,255,1)';
  details.innerHTML = `
    <h1>Статистика платежей</h1>

    <!-- Выбор периода -->
    <div style="display:flex; gap:10px; margin-bottom:10px;">
      <div>
        <label>С:</label>
        <input type="date" id="startDate">
      </div>
      <div>
        <label>По:</label>
        <input type="date" id="endDate">
      </div>
      <button id="applyDateFilter" class="button">Фильтр по периоду</button>
      <!-- Опционально: Экспорт -->
      <button id="exportPdfBtn" class="button button-outline">Экспорт PDF</button>
    </div>

    <div class="stats-container" style="display:flex; flex-wrap:wrap; gap:20px;">
      <div>
        <div class="stats-item"><strong>Всего платежей:</strong> <span id="statTotalCount"></span></div>
        <div class="stats-item"><strong>Сумма всех платежей:</strong> <span id="statTotalAmount"></span></div>
        <div class="stats-item"><strong>Средняя сумма:</strong> <span id="statAvgAmount"></span></div>
      </div>

      <div style="width:300px; height:300px;">
        <canvas id="currencyChart"></canvas>
      </div>

      <!-- Ещё один график (помесячная сумма) -->
      <div style="width:400px; height:300px;">
        <canvas id="monthlyChart"></canvas>
      </div>
    </div>
  `;

  const startDateInput = details.querySelector('#startDate');
  const endDateInput   = details.querySelector('#endDate');
  const applyDateBtn   = details.querySelector('#applyDateFilter');
  const exportPdfBtn   = details.querySelector('#exportPdfBtn');

  const statTotalCountEl  = details.querySelector('#statTotalCount');
  const statTotalAmountEl = details.querySelector('#statTotalAmount');
  const statAvgAmountEl   = details.querySelector('#statAvgAmount');

  applyDateBtn.addEventListener('click', ()=> {
    renderCharts();
  });
  exportPdfBtn.addEventListener('click', ()=> {
    exportPdfForPeriod();
  });

  // Основная функция отрисовки (учитывает период)
  function renderCharts(){
    let filteredPays = [...payments];

    // Фильтрация по дате
    const sVal = startDateInput.value;
    const eVal = endDateInput.value;
    if(sVal && eVal){
      const startDate = new Date(sVal);
      const endDate   = new Date(eVal);
      filteredPays = filteredPays.filter(p => {
        // p.date: "24.03.2025, 09:19:58"
        const [dStr] = p.date.split(','); 
        const [day,mon,year] = dStr.trim().split('.');
        const payDate = new Date(+year, +mon-1, +day);
        return (payDate >= startDate && payDate <= endDate);
      });
    }

    // Считаем totalCount / totalAmount
    const totalCount = filteredPays.length;
    let totalAmount = 0;
    const currencyStats = {};

    filteredPays.forEach(p => {
      totalAmount += p.amount;
      currencyStats[p.currency] = (currencyStats[p.currency] || 0) + 1;
    });

    const avg = totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : 0;

    statTotalCountEl.textContent  = totalCount;
    statTotalAmountEl.textContent = totalAmount.toFixed(2);
    statAvgAmountEl.textContent   = avg;

    // 1) Круговая диаграмма по валютам
    const currencyCanvas = document.getElementById('currencyChart');
    if(currencyCanvas){
      const labels = Object.keys(currencyStats);
      const dataVals= Object.values(currencyStats);

      new Chart(currencyCanvas.getContext('2d'), {
        type:'pie',
        data:{
          labels,
          datasets:[{
            data: dataVals,
            backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'],
            borderWidth:1
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false
        }
      });
    }

    // 2) Линейный / столбиковый (помесячная сумма)
    const monthlyCanvas = document.getElementById('monthlyChart');
    if(monthlyCanvas){
      // группируем по YYYY-MM
      const monthlyMap = {};
      filteredPays.forEach(p=>{
        const [dStr] = p.date.split(',');
        const [day,mon,year] = dStr.trim().split('.');
        const key = `${year}-${mon.padStart(2,'0')}`; 
        monthlyMap[key] = (monthlyMap[key]||0) + p.amount;
      });
      const sortedKeys = Object.keys(monthlyMap).sort(); // "2025-01" < "2025-02"

      const barLabels = sortedKeys;
      const barData   = sortedKeys.map(k=> monthlyMap[k]);

      new Chart(monthlyCanvas.getContext('2d'), {
        type:'bar', // или 'line'
        data:{
          labels: barLabels,
          datasets:[{
            label:'Сумма (ед.вал)',
            data: barData,
            backgroundColor: '#36A2EB'
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          scales:{
            y:{beginAtZero:true}
          }
        }
      });
    }
  } // end renderCharts

  // Экспорт PDF (опционально)
  function exportPdfForPeriod(){
    let filteredPays = [...payments];
    // берём те же даты:
    const sVal = startDateInput.value;
    const eVal = endDateInput.value;
    if(sVal && eVal){
      const startDate = new Date(sVal);
      const endDate   = new Date(eVal);
      filteredPays = filteredPays.filter(p => {
        const [dStr] = p.date.split(',');
        const [day,mon,year] = dStr.trim().split('.');
        const payDate = new Date(+year, +mon-1, +day);
        return (payDate >= startDate && payDate <= endDate);
      });
    }

    if(!filteredPays.length){
      showToast('Нет данных за указанный период','info');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Отчёт за период', 10, 10);

    let head = [['ID','Date','Receiver','Amount','Currency','Status']];
    let body = filteredPays.map(p => [
      p.id, p.date, p.receiverName, p.amount, p.currency, p.status
    ]);

    doc.autoTable({ head, body, startY:20 });
    doc.save('report.pdf');
  }

  // при первой загрузке
  renderCharts();
}