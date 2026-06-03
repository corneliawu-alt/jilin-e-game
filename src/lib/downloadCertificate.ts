import html2canvas from 'html2canvas';

export const CERTIFICATE_NODE_ID = 'certificate-node';
export const CERTIFICATE_DOWNLOAD_FILENAME = '料理鼠亡_榮譽獎狀.jpg';

export type CertificateDownloadResult =
  | { ok: true; method: 'save-picker' | 'download' | 'preview' }
  | { ok: false; error: string };

type SaveTarget =
  | { kind: 'fs'; handle: FileSystemFileHandle }
  | { kind: 'anchor'; link: HTMLAnchorElement };

function supportsSaveFilePicker(): boolean {
  return typeof window.showSaveFilePicker === 'function';
}

/** 在使用者點擊後立刻請求存檔路徑，避免非同步截圖後下載被瀏覽器阻擋 */
async function pickSaveTarget(): Promise<SaveTarget | 'cancelled'> {
  if (supportsSaveFilePicker()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: CERTIFICATE_DOWNLOAD_FILENAME,
        types: [
          {
            description: 'JPEG 圖片',
            accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
          },
        ],
      });
      return { kind: 'fs', handle };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
      console.warn('[Certificate] showSaveFilePicker 失敗，改用一般下載', error);
    }
  }

  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  return { kind: 'anchor', link };
}

/** 清除會干擾 html2canvas 的動畫/transform 樣式（克隆 DOM 內） */
function sanitizeCloneForCapture(root: HTMLElement): void {
  root.style.overflow = 'visible';
  root.style.paddingTop = '1.75rem';

  let el: HTMLElement | null = root;
  while (el) {
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.animation = 'none';
    el = el.parentElement;
  }

  root.querySelectorAll('[data-cert-honor-title]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.background = 'none';
    node.style.backgroundImage = 'none';
    node.style.webkitBackgroundClip = 'unset';
    node.style.backgroundClip = 'unset';
    node.style.color = '#b45309';
    node.style.webkitTextFillColor = '#b45309';
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

function tryAnchorDownload(link: HTMLAnchorElement, blob: Blob): boolean {
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = CERTIFICATE_DOWNLOAD_FILENAME;
  link.rel = 'noopener';

  try {
    link.click();
    return true;
  } finally {
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/** 一般下載失敗時，在新分頁開啟圖片供另存 */
function openBlobPreview(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    URL.revokeObjectURL(url);
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

async function writeBlobToTarget(
  target: SaveTarget,
  blob: Blob,
): Promise<CertificateDownloadResult> {
  if (target.kind === 'fs') {
    const writable = await target.handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return { ok: true, method: 'save-picker' };
  }

  if (tryAnchorDownload(target.link, blob)) {
    return { ok: true, method: 'download' };
  }

  openBlobPreview(blob);
  return { ok: true, method: 'preview' };
}

/** 將獎狀區塊匯出為 JPG 並觸發瀏覽器下載 */
export async function downloadCertificateAsJpg(): Promise<CertificateDownloadResult> {
  const node = document.getElementById(CERTIFICATE_NODE_ID);
  if (!node) {
    return { ok: false, error: '找不到獎狀內容，請重新整理後再試。' };
  }

  const saveTarget = await pickSaveTarget();
  if (saveTarget === 'cancelled') {
    return { ok: false, error: '已取消下載。' };
  }

  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fdfbf7',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (_doc, clonedNode) => {
        if (clonedNode instanceof HTMLElement) {
          sanitizeCloneForCapture(clonedNode);
        }
      },
    });

    if (canvas.width === 0 || canvas.height === 0) {
      if (saveTarget.kind === 'anchor') saveTarget.link.remove();
      return { ok: false, error: '獎狀截圖為空白，請稍後再試。' };
    }

    const blob = await canvasToJpegBlob(canvas);
    if (!blob) {
      if (saveTarget.kind === 'anchor') saveTarget.link.remove();
      return { ok: false, error: '無法產生圖片檔案。' };
    }

    return await writeBlobToTarget(saveTarget, blob);
  } catch (error) {
    if (saveTarget.kind === 'anchor') saveTarget.link.remove();
    console.error('[Certificate] 下載失敗：', error);
    const message =
      error instanceof Error ? error.message : '下載時發生未知錯誤';
    return { ok: false, error: message };
  }
}
