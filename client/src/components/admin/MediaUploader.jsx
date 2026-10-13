import { useEffect, useState } from 'react';
import { ImagePlus, LoaderCircle, X, CloudUpload, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

export default function MediaUploader({ images = [], onChange, token, folder = 'products', multiple = true }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [configured, setConfigured] = useState(null);

  useEffect(() => {
    if (!token) return;
    api.get('/admin/media/status', { token })
      .then((result) => setConfigured(Boolean(result.configured)))
      .catch(() => setConfigured(false));
  }, [token]);

  const upload = async (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;
    if (selected.some(file => !ACCEPT.split(',').includes(file.type))) {
      setMessage('Use JPEG, PNG, WebP, or AVIF images.');
      return;
    }
    if (selected.some(file => file.size > 8 * 1024 * 1024)) {
      setMessage('Each image must be 8 MB or smaller.');
      return;
    }
    if (images.length + selected.length > 8) {
      setMessage('Keep up to 8 images in this gallery.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const body = new FormData();
      selected.forEach(file => body.append('images', file));
      body.append('folder', folder);
      const result = await api.upload('/admin/media', body, { token });
      const next = (result.items || []).map((item) => ({
        url: item.url,
        publicId: item.publicId,
        width: item.width,
        height: item.height,
        format: item.format,
        alt: item.originalName || ''
      }));
      onChange(multiple ? [...images, ...next] : next.slice(0, 1));
      setConfigured(true);
      setMessage(result.message || 'Upload complete.');
    } catch (error) {
      setMessage(error.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const updateAlt = (index, alt) => onChange(images.map((image, i) => i === index ? { ...image, alt } : image));
  const remove = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="block text-sm font-medium">Image gallery</span>
          <span className="mt-1 block text-xs text-black/45">Cloudinary · JPEG, PNG, WebP or AVIF · 8 MB maximum per image</span>
        </div>
        <label className={`inline-flex cursor-pointer items-center gap-2 border border-black/15 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-black hover:text-white ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <CloudUpload size={16} />}
          {busy ? 'Uploading…' : 'Upload images'}
          <input type="file" accept={ACCEPT} multiple={multiple} disabled={busy} onChange={upload} className="sr-only" />
        </label>
      </div>

      {configured === false && (
        <div className="flex gap-3 border border-amber-900/15 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div><strong>Cloudinary is not configured.</strong><p className="mt-1 text-xs leading-5">Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, then restart the backend.</p></div>
        </div>
      )}

      {message && <p role="status" className="border border-black/10 bg-white px-4 py-3 text-sm">{message}</p>}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.publicId || image.url || index} className="overflow-hidden border border-black/10 bg-white">
              <div className="relative aspect-[4/3] bg-[#e9e1d3]">
                <img src={image.url} alt={image.alt || `Gallery image ${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => remove(index)} aria-label={`Remove image ${index + 1}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/95 text-black shadow-sm"><X size={15} /></button>
              </div>
              <div className="p-2">
                <label className="block text-[10px] uppercase tracking-wider text-black/45">Alt text</label>
                <input value={image.alt || ''} onChange={e => updateAlt(index, e.target.value)} placeholder="Describe this image" className="mt-1 w-full border-0 border-b border-black/10 px-0 py-2 text-xs outline-none focus:border-black" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center border border-dashed border-black/20 bg-white/50 px-4 py-6 text-center">
          <ImagePlus size={23} className="text-black/35" />
          <p className="mt-2 text-sm text-black/55">No images added yet</p>
          <p className="mt-1 text-xs text-black/35">Upload a photo to build your gallery.</p>
        </div>
      )}
    </div>
  );
}
