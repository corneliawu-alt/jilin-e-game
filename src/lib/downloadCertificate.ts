import html2canvas from 'html2canvas';

export const CERTIFICATE_NODE_ID = 'certificate-node';
export const CERTIFICATE_DOWNLOAD_FILENAME = '料理鼠亡_榮譽獎狀.jpg';

/** 將獎狀區塊匯出為 JPG 並觸發瀏覽器下載 */
export async function downloadCertificateAsJpg(): Promise<void> {
  const node = document.getElementById(CERTIFICATE_NODE_ID);
  if (!node) {
    console.warn('[Certificate] 找不到獎狀節點');
    return;
  }

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fdfbf7',
    logging: false,
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = CERTIFICATE_DOWNLOAD_FILENAME;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
