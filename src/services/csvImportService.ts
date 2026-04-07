/**
 * Serviço para importação de dados de alunos via CSV/Excel
 */

export interface StudentRecord {
  cpf: string;
  nomeAluno: string;
  dataNascimento: string;
  nomeMae: string;
  nomePai: string;
  serie: string;
  naturalidade: string;
}

/**
 * Faz parse de um arquivo CSV
 */
export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    // Parse CSV com suporte a aspas
    const row: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current || row.length > 0) {
      row.push(current.trim());
    }

    if (row.length > 0) {
      result.push(row);
    }
  }

  return result;
};

/**
 * Encontra o índice de uma coluna pelo nome
 */
const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h.toUpperCase().trim() === name.toUpperCase()
    );
    if (index !== -1) return index;
  }
  return -1;
};

/**
 * Importa dados de alunos de um arquivo CSV
 */
export const importStudentsFromCSV = (csvText: string): StudentRecord[] => {
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error('Arquivo CSV vazio ou inválido');
  }

  const headers = rows[0];

  // Encontrar índices das colunas
  const cpfIndex = findColumnIndex(headers, ['CPF']);
  const nomeIndex = findColumnIndex(headers, ['NOME', 'NOME ALUNO', 'NOME DO ALUNO', 'ALUNO', 'NOME COMPLETO']);
  const dataNascIndex = findColumnIndex(headers, ['DATA NASCIMENTO', 'DATA_NASCIMENTO', 'DATA DE NASCIMENTO', 'DT NASCIMENTO', 'NASCIMENTO']);
  const maeIndex = findColumnIndex(headers, ['NOME MAE', 'NOME_MAE', 'NOME DA MAE', 'MAE', 'FILIAÇÃO 1', 'FILIACAO 1', 'MÃE', 'MAE']);
  const paiIndex = findColumnIndex(headers, ['NOME PAI', 'NOME_PAI', 'NOME DO PAI', 'PAI', 'FILIAÇÃO 2', 'FILIACAO 2']);
  const serieIndex = findColumnIndex(headers, ['SERIE', 'SÉRIE', 'TURMA', 'ANO SERIE', 'ANO']);
  const naturalidadeIndex = findColumnIndex(headers, ['NATURALIDADE', 'MUNICIPIO NASCIMENTO', 'MUNICÍPIO NASCIMENTO', 'MUNICIPIO', 'MUNICÍPIO']);

  if (cpfIndex === -1) {
    throw new Error('Coluna CPF não encontrada no arquivo');
  }

  const students: StudentRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const cpf = row[cpfIndex]?.replace(/\D/g, '') || '';
    if (!cpf || cpf.length !== 11) continue; // Pular linhas sem CPF válido

    students.push({
      cpf,
      nomeAluno: row[nomeIndex]?.trim() || '',
      dataNascimento: row[dataNascIndex]?.trim() || '',
      nomeMae: row[maeIndex]?.trim() || '',
      nomePai: row[paiIndex]?.trim() || '',
      serie: row[serieIndex]?.trim() || '',
      naturalidade: row[naturalidadeIndex]?.trim() || ''
    });
  }

  return students;
};

/**
 * Salva os dados de alunos no localStorage
 */
export const saveStudentsToLocalStorage = (students: StudentRecord[]): void => {
  localStorage.setItem('studentsData', JSON.stringify(students));
  localStorage.setItem('studentsDataUpdatedAt', new Date().toISOString());
};

/**
 * Carrega os dados de alunos do localStorage
 */
export const loadStudentsFromLocalStorage = (): StudentRecord[] => {
  const data = localStorage.getItem('studentsData');
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar dados de alunos:', error);
    return [];
  }
};

/**
 * Busca um aluno pelo CPF
 */
export const searchStudentByCPF = (cpf: string, students: StudentRecord[]): StudentRecord | null => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return students.find(s => s.cpf === cleanCPF) || null;
};

/**
 * Limpa os dados de alunos do localStorage
 */
export const clearStudentsData = (): void => {
  localStorage.removeItem('studentsData');
  localStorage.removeItem('studentsDataUpdatedAt');
};

/**
 * Obtém informações sobre os dados importados
 */
export const getStudentsDataInfo = (): { count: number; updatedAt: string | null } => {
  const students = loadStudentsFromLocalStorage();
  const updatedAt = localStorage.getItem('studentsDataUpdatedAt');

  return {
    count: students.length,
    updatedAt
  };
};
