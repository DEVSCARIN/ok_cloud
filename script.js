// Controle abas
const tabUpload = document.getElementById('tab-upload');
const tabDownload = document.getElementById('tab-download');
const uploadSection = document.getElementById('upload-section');
const downloadSection = document.getElementById('download-section');

tabUpload.addEventListener('click', () => {
  tabUpload.classList.add('active');
  tabDownload.classList.remove('active');
  uploadSection.classList.add('active');
  downloadSection.classList.remove('active');
});

tabDownload.addEventListener('click', () => {
  tabDownload.classList.add('active');
  tabUpload.classList.remove('active');
  downloadSection.classList.add('active');
  uploadSection.classList.remove('active');
  fetchFileList();
});

// Upload
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const uploadMessage = document.getElementById('uploadMessage');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!fileInput.files.length) return;

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  uploadMessage.textContent = "";
  uploadMessage.className = "message";

  try {
    const res = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      uploadMessage.textContent = `Arquivo "${data.filename}" enviado com sucesso!`;
      uploadMessage.classList.add('success');
      fileInput.value = "";
    } else {
      const err = await res.json();
      uploadMessage.textContent = err.detail || "Erro ao enviar arquivo.";
      uploadMessage.classList.add('error');
    }
  } catch (err) {
    uploadMessage.textContent = "Erro ao conectar com o servidor.";
    uploadMessage.classList.add('error');
  }
});

// Listar arquivos para download
async function fetchFileList() {
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = "<li>Carregando...</li>";
  try {
    const res = await fetch('http://localhost:8000/files');
    if (res.ok) {
      const files = await res.json();
      if (files.length === 0) {
        fileList.innerHTML = "<li>Nenhum arquivo disponível.</li>";
        return;
      }
      fileList.innerHTML = "";
      files.forEach(filename => {
        const li = document.createElement('li');
        li.textContent = filename;

        const btn = document.createElement('button');
        btn.textContent = "Baixar";
        btn.onclick = () => {
          window.open(`http://localhost:8000/download/${encodeURIComponent(filename)}`, '_blank');
        };

        li.appendChild(btn);
        fileList.appendChild(li);
      });
    } else {
      fileList.innerHTML = "<li>Erro ao carregar arquivos.</li>";
    }
  } catch {
    fileList.innerHTML = "<li>Erro ao conectar com o servidor.</li>";
  }
}

// Inicializa com aba upload
uploadSection.classList.add('active');
tabUpload.classList.add('active');
