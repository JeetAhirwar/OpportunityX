import { useState, useRef, DragEvent } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // MB
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  currentFile?: { name: string; uploadedAt?: string } | null;
  label?: string;
}

const FileUpload = ({ accept = ".pdf,.doc,.docx", maxSize = 10, onFileSelect, onRemove, currentFile, label = "Upload File" }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be under ${maxSize}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  if (currentFile) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{currentFile.name}</p>
            {currentFile.uploadedAt && <p className="text-xs text-muted-foreground">Uploaded {currentFile.uploadedAt}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>Replace</Button>
          {onRemove && <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive"><X className="h-4 w-4" /></Button>}
        </div>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">Drag and drop or click to browse - Max {maxSize}MB</p>
        <p className="mt-1 text-xs text-muted-foreground">{accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")}</p>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
};

export default FileUpload;

