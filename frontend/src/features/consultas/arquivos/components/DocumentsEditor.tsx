import { useState, useRef } from "react";
import { Trash2, Upload, Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { uploadFile, deleteFile } from "../../service/consultas.service";
import type { FileMeta } from "../../service/consultas.service";

const TIPOS_DOCUMENTO = [
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "comprovante_residencia", label: "Comprovante de Residência" },
  { value: "laudo_medico", label: "Laudo Médico" },
  { value: "carteirinha_convenio", label: "Carteirinha do Convênio" },
  { value: "outros", label: "Outros" },
];

interface DocumentsEditorProps {
  files: FileMeta[];
  ownerType: "cliente" | "terapeuta";
  ownerId: string;
  fullName: string;
  birthDate: string;
  onUploadSuccess: () => void;
  onDeleteSuccess: () => void;
}

export function DocumentsEditor({
  files,
  ownerType,
  ownerId,
  fullName,
  birthDate,
  onUploadSuccess,
  onDeleteSuccess,
}: DocumentsEditorProps) {
  const [tipoDoc, setTipoDoc] = useState<string>("");
  const [descricaoOutros, setDescricaoOutros] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileMeta | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!tipoDoc) {
      setUploadError("Selecione o tipo de documento antes de fazer upload");
      return;
    }

    if (tipoDoc === "outros" && !descricaoOutros.trim()) {
      setUploadError("Preencha a descrição do documento");
      return;
    }

    const descricaoDocumento = tipoDoc === 'outros' ? descricaoOutros.trim() : undefined;

    setUploading(true);
    setUploadError(null);

    // Dispatch evento de início
    window.dispatchEvent(
      new CustomEvent("consulta:documents:upload:click", {
        detail: {
          ownerType,
          ownerId,
          tipo_documento:tipoDoc,
          descricao_documento: descricaoDocumento,
          fileName: file.name
        },
      })
    );

    try {
      await uploadFile({
        ownerType,
        ownerId,
        fullName,
        birthDate,
        tipo_documento: tipoDoc,
        descricao_documento: descricaoDocumento,
        file,
      });

      window.dispatchEvent(
        new CustomEvent("consulta:documents:upload:success", {
          detail: {
            ownerType,
            ownerId,
            tipo_documento: tipoDoc,
            descricao_documento: descricaoDocumento,
            fileName: file.name,
          },
        })
      );

      // Reset
      setTipoDoc("");
      setDescricaoOutros("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess();
    } catch (err: any) {
      const msg = err.message ?? "Erro ao fazer upload do arquivo";
      setUploadError(msg);

      window.dispatchEvent(
        new CustomEvent("consulta:documents:upload:error", {
          detail: {
            ownerType,
            ownerId,
            tipo_documento: tipoDoc,
            descricao_documento: descricaoDocumento,
            fileName: file.name,
            error: msg,
          },
        })
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    window.dispatchEvent(
      new CustomEvent("consulta:documents:delete:click", {
        detail: { fileId: deleteTarget.id, fileName: deleteTarget.nome },
      })
    );

    try {
      await deleteFile(deleteTarget.id);

      window.dispatchEvent(
        new CustomEvent("consulta:documents:delete:success", {
          detail: { fileId: deleteTarget.id, fileName: deleteTarget.nome },
        })
      );

      setDeleteTarget(null);
      onDeleteSuccess();
    } catch (err: any) {
      const msg = err.message ?? "Erro ao excluir arquivo";
      
      window.dispatchEvent(
        new CustomEvent("consulta:documents:delete:error", {
          detail: { fileId: deleteTarget.id, fileName: deleteTarget.nome, error: msg },
        })
      );

      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!tipoDoc) {
      setUploadError("Selecione o tipo de documento antes de fazer upload");
      return;
    }

    if (tipoDoc === "outros" && !descricaoOutros.trim()) {
      setUploadError("Preencha a descrição do documento");
      return;
    }

    const descricaoDocumento = tipoDoc === 'outros' ? descricaoOutros.trim() : undefined;

    setUploading(true);
    setUploadError(null);

    window.dispatchEvent(
      new CustomEvent("consulta:documents:upload:click", {
        detail: {
          ownerType,
          ownerId,
          tipo_documento: tipoDoc,
          descricao_documento: descricaoDocumento,
          fileName: file.name,
        },
      })
    );

    try {
      await uploadFile({
        ownerType,
        ownerId,
        fullName,
        birthDate,
        tipo_documento: tipoDoc,
        descricao_documento: descricaoDocumento,
        file,
      });

      window.dispatchEvent(
        new CustomEvent("consulta:documents:upload:success", {
          detail: {
            ownerType,
            ownerId,
            tipo_documento: tipoDoc,
            descricao_documento: descricaoDocumento,
            fileName: file.name,
          },
        })
      );

      setTipoDoc("");
      setDescricaoOutros("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess();
    } catch (err: any) {
      const msg = err.message ?? "Erro ao fazer upload do arquivo";
      setUploadError(msg);

      window.dispatchEvent(
        new CustomEvent("consulta:documents:upload:error", {
          detail: {
            ownerType,
            ownerId,
            tipo_documento: tipoDoc,
            descricao_documento: descricaoDocumento,
            fileName: file.name,
            error: msg,
          },
        })
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
          <Upload className="h-4 w-4" />
          Adicionar Documento
        </h3>

        <div className="space-y-3">
          {/* Tipo de documento */}
          <div>
            <Label htmlFor="tipo-doc">Tipo de Documento</Label>
            <Select value={tipoDoc} onValueChange={setTipoDoc}>
              <SelectTrigger id="tipo-doc" className="h-10">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de descrição (condicional para "outros") */}
          {tipoDoc === "outros" && (
            <div>
              <Label htmlFor="descricao-outros">Descrição do Documento</Label>
              <Input
                id="descricao-outros"
                type="text"
                placeholder="Ex: Atestado médico, Declaração escolar..."
                value={descricaoOutros}
                onChange={(e) => setDescricaoOutros(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {/* Zona de drag & drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 
              text-center cursor-pointer transition-all
              ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${!tipoDoc ? 'opacity-50 cursor-not-allowed' : ''}
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={uploading || !tipoDoc}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                </>
              ) : (
                <>
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Clique ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, imagens ou documentos
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum documento enviado
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="border rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate">
                  {file.descricao_documento ?? file.nome}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {file.tipo_documento}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enviado{" "}
                  {formatDistanceToNow(new Date(file.data_envio), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => setDeleteTarget(file)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo{" "}
              <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
