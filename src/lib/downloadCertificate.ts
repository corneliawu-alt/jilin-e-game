import html2canvas from 'html2canvas';

export const CERTIFICATE_NODE_ID = 'certificate-node';
export const CERTIFICATE_DOWNLOAD_FILENAME_FALLBACK = '料理鼠亡_榮譽獎狀.jpg';

/** 小於此大小的 JPEG 多半是截圖失敗或下載被截斷 */
const MIN_JPEG_BYTES = 2_000;

/** 截圖用樣式（與 index.css .cert-* 同步；僅 hex/rgb） */
const CERTIFICATE_CAPTURE_CSS = `
#certificate-node.cert-root{position:relative;max-width:400px;margin:0 auto;padding:2.75rem 1.5rem 1.75rem;text-align:center;color:#3d2b1f;border-radius:14px;border:3px solid #d97706;outline:7px double #fbbf24;outline-offset:-2px;background:linear-gradient(165deg,#fffef9 0%,#fdf8ee 45%,#faf3e0 100%);box-shadow:0 16px 48px rgba(120,72,16,.2),inset 0 1px 0 rgba(255,255,255,.9)}
.cert-inner-frame{position:absolute;inset:14px;border:1px solid rgba(217,119,6,.28);border-radius:8px;pointer-events:none}
.cert-medal{position:absolute;top:-1.35rem;left:50%;transform:translateX(-50%);width:3.25rem;height:3.25rem;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#fde68a,#f59e0b 55%,#ea580c);border:3px solid #fff;box-shadow:0 6px 18px rgba(180,83,9,.45);color:#fff}
.cert-org{margin:0 0 1rem;font-size:9px;font-weight:800;letter-spacing:.28em;color:rgba(120,53,15,.55)}
.cert-recipient{margin-bottom:.85rem}
.cert-recipient-label{margin:0 0 .25rem;font-size:10px;font-weight:700;letter-spacing:.2em;color:rgba(120,53,15,.5)}
.cert-recipient-name{margin:0;font-size:1.35rem;font-weight:900;line-height:1.2;color:#1a3d32}
.cert-recipient-meta{margin:.35rem 0 0;font-size:.8rem;font-weight:700;color:#57534e}
.cert-divider{height:1px;margin:0 auto .85rem;max-width:85%;background:linear-gradient(90deg,transparent,rgba(217,119,6,.45) 20%,rgba(217,119,6,.45) 80%,transparent)}
.cert-main-title{margin:0 0 .65rem;font-size:1.15rem;font-weight:900;letter-spacing:.35em;color:#92400e}
.cert-body{margin:0 0 1.1rem;padding:0 .25rem;font-size:.72rem;line-height:1.65;color:rgba(68,52,38,.88)}
.cert-score-hero{margin:0 auto .65rem;padding:.75rem 1rem;max-width:220px;border-radius:12px;background:linear-gradient(180deg,#fff 0%,#fff7ed 100%);border:1px solid rgba(251,191,36,.65);box-shadow:0 4px 14px rgba(180,120,40,.12)}
.cert-score-hero-label{display:block;font-size:10px;font-weight:800;letter-spacing:.15em;color:rgba(146,64,14,.75);margin-bottom:.15rem}
.cert-score-hero-value{margin:0;font-size:2.25rem;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;color:#9a3412}
.cert-score-hero-max{font-size:1.1rem;font-weight:800;color:rgba(154,52,18,.55);margin-left:.1rem}
.cert-stars{margin:0 0 1rem;font-size:1.35rem;letter-spacing:.2em;line-height:1}
.cert-stars-filled{color:#eab308}
.cert-stars-empty{color:rgba(180,83,9,.22)}
.cert-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;margin-bottom:.55rem}
.cert-metric{padding:.5rem .35rem;border-radius:10px;background:rgba(255,255,255,.55);border:1px solid rgba(253,230,138,.4)}
.cert-metric--highlight{background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);border-color:rgba(245,158,11,.55)}
.cert-metric-label{display:block;font-size:9px;font-weight:700;color:rgba(120,53,15,.65);margin-bottom:.2rem;line-height:1.2}
.cert-metric-value{display:block;font-size:.95rem;font-weight:900;font-variant-numeric:tabular-nums;color:#3d2b1f;line-height:1.15}
.cert-metric--highlight .cert-metric-value{font-size:1.05rem;color:#9a3412}
.cert-time-bonus{margin:0 0 1rem;font-size:10px;font-weight:700;color:rgba(120,53,15,.55)}
.cert-honor-panel{margin-top:.25rem;padding:.85rem .75rem .7rem;border-radius:12px;background:linear-gradient(180deg,rgba(254,243,199,.65) 0%,rgba(253,230,138,.35) 100%);border:1px solid rgba(245,158,11,.4)}
.cert-honor-caption{margin:0 0 .35rem;font-size:9px;font-weight:800;letter-spacing:.22em;color:rgba(146,64,14,.65)}
.cert-honor{margin:0;font-size:1.35rem;font-weight:900;line-height:1.25;color:#b45309}
`;

function injectCaptureStyles(doc: Document): void {
  doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
    el.remove();
  });
  const style = doc.createElement('style');
  style.textContent = CERTIFICATE_CAPTURE_CSS;
  doc.head.appendChild(style);
}

export type CertificateDownloadResult =
  | { ok: true; method: 'save-picker' | 'download' | 'preview' }
  | { ok: false; error: string };

type SaveTarget =
  | { kind: 'fs'; handle: FileSystemFileHandle }
  | { kind: 'anchor'; link: HTMLAnchorElement };

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|\s]/g, '')
    .slice(0, 32);
}

/** 下載檔名：料理鼠亡_班級+座號（座號不足 2 碼前補 0，例：501 班、6 號 → 料理鼠亡_50106.jpg） */
export function buildCertificateFilename(
  classId: string,
  seatNumber: string,
): string {
  const cls = sanitizeFilenamePart(classId);
  const seatRaw = sanitizeFilenamePart(seatNumber);
  if (!cls || !seatRaw) return CERTIFICATE_DOWNLOAD_FILENAME_FALLBACK;

  const seat = /^\d+$/.test(seatRaw)
    ? seatRaw.padStart(2, '0')
    : seatRaw;

  return `料理鼠亡_${cls}${seat}.jpg`;
}

function supportsSaveFilePicker(): boolean {
  return typeof window.showSaveFilePicker === 'function';
}

/** 在使用者點擊後立刻請求存檔路徑，避免非同步截圖後下載被瀏覽器阻擋 */
async function pickSaveTarget(filename: string): Promise<SaveTarget | 'cancelled'> {
  if (supportsSaveFilePicker()) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
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

async function waitForCaptureReady(): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** 清除會干擾 html2canvas 的動畫/transform 樣式（克隆 DOM 內） */
function sanitizeCloneForCapture(root: HTMLElement): void {
  root.style.overflow = 'visible';
  root.style.paddingTop = '2.75rem';
  root.style.opacity = '1';
  root.style.visibility = 'visible';

  root.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.opacity = '1';
    node.style.visibility = 'visible';
    node.style.transform = 'none';
    node.style.filter = 'none';
    node.style.animation = 'none';
    node.style.transition = 'none';
  });

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

function dataUrlToBlob(dataUrl: string, mime: string): Blob {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function isValidJpeg(blob: Blob): Promise<boolean> {
  if (blob.size < MIN_JPEG_BYTES) return false;
  const head = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const fromToBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });

  if (fromToBlob && (await isValidJpeg(fromToBlob))) {
    return fromToBlob;
  }

  try {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const fallback = dataUrlToBlob(dataUrl, 'image/jpeg');
    if (await isValidJpeg(fallback)) return fallback;
  } catch {
    // 改試 PNG（較不易損壞，但檔名仍為 .jpg 時部分檢視器可能異常，故再試一次較低品質 JPEG）
  }

  try {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const fallback = dataUrlToBlob(dataUrl, 'image/jpeg');
    if (await isValidJpeg(fallback)) return fallback;
  } catch {
    return null;
  }

  return null;
}

function tryAnchorDownload(
  link: HTMLAnchorElement,
  blob: Blob,
  filename: string,
): boolean {
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';

  link.click();

  // Windows 下載未完成就 revoke 會產生損壞的 JPG
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 120_000);

  return true;
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
  filename: string,
): Promise<CertificateDownloadResult> {
  const jpegBlob =
    blob.type === 'image/jpeg'
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: 'image/jpeg' });

  if (target.kind === 'fs') {
    const writable = await target.handle.createWritable();
    await writable.write(jpegBlob);
    await writable.close();
    return { ok: true, method: 'save-picker' };
  }

  if (tryAnchorDownload(target.link, jpegBlob, filename)) {
    return { ok: true, method: 'download' };
  }

  openBlobPreview(jpegBlob);
  return { ok: true, method: 'preview' };
}

/** 將獎狀區塊匯出為 JPG 並觸發瀏覽器下載 */
export async function downloadCertificateAsJpg(
  classId: string,
  seatNumber: string,
): Promise<CertificateDownloadResult> {
  const node = document.getElementById(CERTIFICATE_NODE_ID);
  if (!node) {
    return { ok: false, error: '找不到獎狀內容，請重新整理後再試。' };
  }

  const filename = buildCertificateFilename(classId, seatNumber);
  const saveTarget = await pickSaveTarget(filename);
  if (saveTarget === 'cancelled') {
    return { ok: false, error: '已取消下載。' };
  }

  try {
    await waitForCaptureReady();

    const scale = Math.min(2.5, Math.max(2, window.devicePixelRatio || 2));

    const canvas = await html2canvas(node, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fffef9',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc, clonedNode) => {
        injectCaptureStyles(doc);
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
      return { ok: false, error: '無法產生圖片檔案，請換用 Chrome 或 Edge 再試。' };
    }

    if (!(await isValidJpeg(blob))) {
      if (saveTarget.kind === 'anchor') saveTarget.link.remove();
      return { ok: false, error: '圖片檔案不完整，請再按一次下載。' };
    }

    return await writeBlobToTarget(saveTarget, blob, filename);
  } catch (error) {
    if (saveTarget.kind === 'anchor') saveTarget.link.remove();
    console.error('[Certificate] 下載失敗：', error);
    const message =
      error instanceof Error ? error.message : '下載時發生未知錯誤';
    return { ok: false, error: message };
  }
}
