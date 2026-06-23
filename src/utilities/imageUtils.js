export function readImageFileAsDataUrl(file, onComplete) {
  const reader = new FileReader();
  reader.onloadend = () => onComplete(reader.result);
  reader.readAsDataURL(file);
}

export function compressImageFile(file, onComplete, maxDimension = 800, quality = 0.6) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height / width) * maxDimension;
        width = maxDimension;
      } else {
        width = (width / height) * maxDimension;
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    onComplete(canvas.toDataURL('image/jpeg', quality));
  };

  img.src = URL.createObjectURL(file);
}

export function processReportImage(file, onComplete) {
  if (file.size > 500 * 1024) {
    compressImageFile(file, onComplete);
    return;
  }

  readImageFileAsDataUrl(file, onComplete);
}
