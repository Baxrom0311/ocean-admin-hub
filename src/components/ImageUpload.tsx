import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
    /** Current image URLs */
    value: string[];
    /** Called when images change */
    onChange: (urls: string[]) => void;
    /** Server-side media folder */
    folder?: string;
    /** Max files allowed */
    max?: number;
    /** Label text */
    label?: string;
    /** Accept file types */
    accept?: string;
    /** Called before the URL is removed from local form state */
    onRemove?: (url: string) => Promise<void> | void;
}

const MAX_PARALLEL_UPLOADS = 3;
const IMAGE_OPTIMIZE_THRESHOLD = 1.5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2560;
const IMAGE_QUALITY = 0.82;

const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Rasmni o'qib bo'lmadi"));
        };
        image.src = objectUrl;
    });

const shouldOptimizeImage = (file: File) =>
    file.type.startsWith('image/')
    && !file.type.includes('svg')
    && !file.type.includes('gif')
    && file.size > IMAGE_OPTIMIZE_THRESHOLD;

const optimizeImageFile = async (file: File): Promise<File> => {
    if (!shouldOptimizeImage(file)) return file;

    const image = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);

    const optimizedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', IMAGE_QUALITY);
    });

    if (!optimizedBlob || optimizedBlob.size >= file.size) return file;

    const nextName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([optimizedBlob], `${nextName}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
    });
};

const uploadInBatches = async (files: File[], folder: string) => {
    const uploadedUrls: string[] = [];

    for (let index = 0; index < files.length; index += MAX_PARALLEL_UPLOADS) {
        const chunk = files.slice(index, index + MAX_PARALLEL_UPLOADS);
        const results = await Promise.all(chunk.map((file) => api.upload(file, folder)));
        results.forEach((res) => {
            if (res?.data?.url) {
                uploadedUrls.push(res.data.url);
            }
        });
    }

    return uploadedUrls;
};

const ImageUpload = ({
    value = [],
    onChange,
    folder = 'ecocompany',
    max = 5,
    label = 'Rasmlar',
    accept = 'image/*',
    onRemove,
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = max - value.length;
        if (remaining <= 0) {
            toast({ title: `Maksimal ${max} ta rasm`, variant: 'destructive' });
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remaining);
        setUploading(true);

        try {
            const preparedFiles = await Promise.all(filesToUpload.map(optimizeImageFile));
            const newUrls = await uploadInBatches(preparedFiles, folder);

            if (newUrls.length > 0) {
                onChange([...value, ...newUrls]);
                const optimizedCount = preparedFiles.filter((file, index) => file !== filesToUpload[index]).length;
                toast({
                    title: `${newUrls.length} ta rasm yuklandi ✅`,
                    description: optimizedCount > 0 ? `${optimizedCount} ta rasm optimizatsiya qilindi` : undefined,
                });
            }
        } catch (err: any) {
            toast({ title: 'Yuklashda xato', description: err.message, variant: 'destructive' });
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const removeImage = async (index: number) => {
        const removedUrl = value[index];
        try {
            await onRemove?.(removedUrl);
            const updated = value.filter((_, i) => i !== index);
            onChange(updated);
        } catch (err: any) {
            toast({ title: 'Faylni o‘chirishda xato', description: err.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-2">
            <label className="mb-1.5 block text-sm font-medium">{label}</label>

            {/* Image grid */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((url, i) => (
                        <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute right-0.5 top-0.5 rounded-full bg-destructive/90 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            {value.length < max && (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Yuklanmoqda...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            <span className="text-sm">Rasm yuklash (max {max} ta)</span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={max > 1}
                onChange={handleUpload}
                className="hidden"
            />
        </div>
    );
};

/** Single file upload (certificates, gallery cover, etc.) */
export const SingleFileUpload = ({
    value,
    onChange,
    folder = 'ecocompany',
    label = 'Fayl',
    accept = 'image/*,application/pdf',
    onRemove,
}: {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
    accept?: string;
    onRemove?: (url: string) => Promise<void> | void;
}) => {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const preparedFile = await optimizeImageFile(file);
            const res = await api.upload(preparedFile, folder);
            const url = res?.data?.url;
            if (url) {
                if (value && value !== url) {
                    await onRemove?.(value);
                }
                onChange(url);
                toast({
                    title: 'Fayl yuklandi ✅',
                    description: preparedFile !== file ? "Rasm optimizatsiya qilindi" : undefined,
                });
            }
        } catch (err: any) {
            toast({ title: 'Yuklashda xato', description: err.message, variant: 'destructive' });
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="mb-1.5 block text-sm font-medium">{label}</label>

            {value && (
                <div className="group relative inline-block">
                    {value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || accept.startsWith('image') ? (
                        <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-border">
                            <img src={value} alt="" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await onRemove?.(value);
                                        onChange('');
                                    } catch (err: any) {
                                        toast({ title: 'Faylni o‘chirishda xato', description: err.message, variant: 'destructive' });
                                    }
                                }}
                                className="absolute right-0.5 top-0.5 rounded-full bg-destructive/90 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="max-w-[200px] truncate text-sm">{value}</span>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await onRemove?.(value);
                                        onChange('');
                                    } catch (err: any) {
                                        toast({ title: 'Faylni o‘chirishda xato', description: err.message, variant: 'destructive' });
                                    }
                                }}
                                className="text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!value && (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Yuklanmoqda...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            <span className="text-sm">Fayl yuklash</span>
                        </>
                    )}
                </div>
            )}

            <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
        </div>
    );
};

export default ImageUpload;
