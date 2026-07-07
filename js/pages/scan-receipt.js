document.addEventListener('DOMContentLoaded', () => {
  initNavigation('', { title: 'Skeniraj račun', showBack: true, backHref: 'home.html' });

  const preview = document.getElementById('receipt-preview');
  const fileInput = document.getElementById('receipt-file');
  const cameraInput = document.getElementById('receipt-camera');

  function showPreview(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Molimo izaberite sliku.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Račun">`;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) showPreview(fileInput.files[0]);
  });

  cameraInput.addEventListener('change', () => {
    if (cameraInput.files[0]) showPreview(cameraInput.files[0]);
  });

  document.getElementById('btn-upload').addEventListener('click', () => fileInput.click());
  document.getElementById('btn-camera').addEventListener('click', () => cameraInput.click());
});
