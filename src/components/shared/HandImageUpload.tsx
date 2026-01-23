import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Hand, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HandImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  issue?: string;
}

export const HandImageUpload = ({ value, onChange, issue }: HandImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    // Accept any image type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // 20MB limit to support different devices/cameras
    if (file.size > 20 * 1024 * 1024) {
      return;
    }

    setIsLoading(true);

    // Convert to base64 for preview (in production, would upload to storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onChange(result);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden aspect-square max-w-xs mx-auto"
          >
            <img
              src={value}
              alt="Your palm"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <button
              onClick={handleRemove}
              className="absolute top-3 right-3 p-2 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <p className="text-sm text-foreground/80">Photo uploaded ✓</p>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative flex flex-col items-center justify-center w-full aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300',
              isDragging
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-border hover:border-primary/50 hover:bg-card/50',
              issue && 'border-destructive',
              isLoading && 'pointer-events-none opacity-70'
            )}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Hand className="w-10 h-10 text-primary" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Camera className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
              
              <div>
                <p className="text-foreground font-medium mb-1">
                  {isDragging ? 'Drop the image here' : 'Upload a photo of your palm'}
                </p>
                <p className="text-muted-foreground text-sm">
                  Drag and drop, or click to select
                </p>
                <p className="text-muted-foreground/60 text-xs mt-2">
                  Any image format
                </p>
              </div>

              <div className="flex items-center gap-2 text-primary text-sm">
                <Upload className="w-4 h-4" />
                <span>Choose file</span>
              </div>
            </div>
          </motion.label>
        )}
      </AnimatePresence>

      {issue && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-destructive text-center"
        >
          {issue}
        </motion.p>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 rounded-xl bg-card/30 border border-border/30">
        <p className="text-xs text-muted-foreground text-center mb-2">
          Tips for the best photo:
        </p>
        <ul className="text-xs text-muted-foreground/80 space-y-1">
          <li>· Use bright, natural lighting</li>
          <li>· Photograph your open palm</li>
          <li>· Keep your hand relaxed</li>
        </ul>
      </div>
    </div>
  );
};
