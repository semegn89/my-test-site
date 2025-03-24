// utils.js

export function showToast(msg, type='info'){
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.classList.add('toast');
    if(type==='success') t.style.background='#2ecc71';
    if(type==='error')   t.style.background='#e74c3c';
    if(type==='info')    t.style.background='#3498db';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(()=>{
      if(toastContainer.contains(t)){
        toastContainer.removeChild(t);
      }
    },4500);
  }
  
  export function showPreview(html){
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    if(!previewModal || !previewContent) return;
    previewContent.innerHTML = html;
    previewModal.style.display = 'flex';
  }
  
  export function closePreview(){
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    if(previewModal){
      previewModal.style.display='none';
    }
    if(previewContent){
      previewContent.innerHTML='';
    }
  }
  
  /** Генерация УНП (6-значное число) */
  export function generateUNP() {
    const num = Math.floor(Math.random() * 1000000); // 0..999999
    const padded = num.toString().padStart(6,'0');   // "000123" и т.д.
    return `УНП-${padded}`;
  }