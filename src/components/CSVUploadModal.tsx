import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { importStudentsFromCSV, saveStudentsToLocalStorage, getStudentsDataInfo, clearStudentsData } from '@/services/csvImportService';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function CSVUploadModal({ isOpen, onClose, onSuccess }: CSVUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataInfo, setDataInfo] = useState(getStudentsDataInfo());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const text = await file.text();
      const students = importStudentsFromCSV(text);

      if (students.length === 0) {
        setError('Nenhum aluno válido encontrado no arquivo. Verifique o formato do CSV.');
        setLoading(false);
        return;
      }

      saveStudentsToLocalStorage(students);
      const info = getStudentsDataInfo();
      setDataInfo(info);

      setSuccess(`✅ ${students.length} aluno(s) importado(s) com sucesso!`);
      
      if (onSuccess) {
        onSuccess(students.length);
      }

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados importados?')) {
      clearStudentsData();
      setDataInfo({ count: 0, updatedAt: null });
      setSuccess('Dados limpos com sucesso');
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Dados de Alunos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status dos dados importados */}
          {dataInfo.count > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{dataInfo.count} aluno(s) importado(s)</span>
              </div>
              {dataInfo.updatedAt && (
                <p className="text-sm text-green-600 mt-1">
                  Atualizado em: {new Date(dataInfo.updatedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {/* Instruções */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instruções:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Exporte os dados do SIAGE em formato CSV ou Excel</li>
              <li>O arquivo deve conter as seguintes colunas:</li>
              <ul className="ml-6 space-y-1 mt-1">
                <li>• CPF (obrigatório)</li>
                <li>• Nome do Aluno</li>
                <li>• Data de Nascimento</li>
                <li>• Filiação 1 (Mãe)</li>
                <li>• Filiação 2 (Pai)</li>
                <li>• Turma (Série)</li>
                <li>• Município de Nascimento</li>
              </ul>
              <li className="mt-2">Selecione o arquivo abaixo</li>
            </ol>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Clique para selecionar arquivo</p>
            <p className="text-xs text-gray-500">CSV ou Excel (.csv, .xlsx, .xls)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {dataInfo.count > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearData}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Dados
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
