async function postJSON(url, data){
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postForm(url, form){
  const res = await fetch(url, { method:'POST', body: form });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

const resultEl = document.getElementById('result');

document.getElementById('scanSymptomBtn').onclick = async () => {
  try {
    const file = document.getElementById('symptomFile').files[0];
    if(!file) return alert('Choose an image first');
    const fd = new FormData();
    fd.append('mode','symptom');
    fd.append('image', file);
    resultEl.textContent = 'Analyzing symptom…';
    const data = await postForm('/api/scan', fd);
    resultEl.textContent = data.reply || JSON.stringify(data,null,2);
  } catch (e) {
    resultEl.textContent = 'Error: '+ e.message;
  }
};

document.getElementById('scanMedicineBtn').onclick = async () => {
  try {
    const file = document.getElementById('medicineFile').files[0];
    if(!file) return alert('Choose an image first');
    const fd = new FormData();
    fd.append('mode','medicine');
    fd.append('image', file);
    resultEl.textContent = 'Analyzing medicine…';
    const data = await postForm('/api/scan', fd);
    resultEl.textContent = data.reply || JSON.stringify(data,null,2);
  } catch (e) {
    resultEl.textContent = 'Error: '+ e.message;
  }
};

document.getElementById('askBtn').onclick = async () => {
  try {
    const prompt = document.getElementById('question').value.trim();
    const gender = document.getElementById('voiceStyle').value;
    if(!prompt) return alert('Type your question');
    resultEl.textContent = 'Thinking…';
    const data = await postJSON('/api/ask', { prompt, gender });
    resultEl.textContent = data.reply || JSON.stringify(data,null,2);
  } catch (e) {
    resultEl.textContent = 'Error: '+ e.message;
  }
};
