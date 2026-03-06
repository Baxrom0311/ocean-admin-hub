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
    /** Cloudinary folder */
    folder?: string;
    /** Max files allowed */
    max?: number;
    /** Label text */
    label?: string;
    /** Accept file types */
    accept?: string;
}

const ImageUpload = ({
    value = [],
    onChange,
    folder = 'ecocompany',
    max = 5,
    label = 'Rasmlar',
    accept = 'image/*',
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
            const newUrls: string[] = [];
            for (const file of filesToUpload) {
                const res = await api.upload(file, folder);
                if (res?.data?.url) {
                    newUrls.push(res.data.url);
                } else if (res?.data?.secure_url) {
                    newUrls.push(res.data.secure_url);
                }
            }

            if (newUrls.length > 0) {
                onChange([...value, ...newUrls]);
                toast({ title: `${newUrls.length} ta rasm yuklandi ✅` });
            }
        } catch (err: any) {
            toast({ title: 'Yuklashda xato', description: err.message, variant: 'destructive' });
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const updated = value.filter((_, i) => i !== index);
        onChange(updated);
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
}: {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
    accept?: string;
}) => {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.upload(file, folder);
            const url = res?.data?.url || res?.data?.secure_url;
            if (url) {
                onChange(url);
                toast({ title: 'Fayl yuklandi ✅' });
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
                                onClick={() => onChange('')}
                                className="absolute right-0.5 top-0.5 rounded-full bg-destructive/90 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="max-w-[200px] truncate text-sm">{value}</span>
                            <button type="button" onClick={() => onChange('')} className="text-destructive">
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
