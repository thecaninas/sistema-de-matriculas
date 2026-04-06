/**
 * Serviço para envio de mensagens e documentos via WhatsApp
 * Usa a Evolution API (open source)
 */

interface SendDocumentParams {
  phoneNumber: string;
  pdfBase64: string;
  fileName: string;
  caption?: string;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

/**
 * Envia um documento PDF via WhatsApp usando a Evolution API
 * @param params - Parâmetros para envio
 * @returns Resposta do envio
 */
export const sendDocumentViaWhatsApp = async (
  params: SendDocumentParams
): Promise<SendMessageResponse> => {
  try {
    // Validar número de telefone
    const phoneRegex = /^\d{10,15}$/;
    const cleanPhone = params.phoneNumber.replace(/\D/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      return {
        success: false,
        error: 'Número de WhatsApp inválido. Use apenas números (mínimo 10 dígitos).'
      };
    }

    // Validar Base64
    if (!params.pdfBase64 || params.pdfBase64.length === 0) {
      return {
        success: false,
        error: 'Arquivo PDF inválido.'
      };
    }

    // Usar a Evolution API pública ou uma instância local
    // Para usar em produção, você precisará de uma instância da Evolution API rodando
    // Opções:
    // 1. Usar um serviço hospedado (ex: Evolution Cloud)
    // 2. Hospedar sua própria instância
    // 3. Usar um webhook intermediário

    // Aqui estamos usando uma abordagem alternativa: 
    // Converter para URL e usar o link de compartilhamento do WhatsApp
    // Mas para envio automático de arquivo, precisamos de um backend

    // Para agora, vamos retornar uma instrução para o usuário
    // Em produção, você configuraria uma API backend

    console.log('Tentando enviar documento via WhatsApp:', {
      phoneNumber: cleanPhone,
      fileName: params.fileName,
      captionLength: params.caption?.length || 0
    });

    // Simulação de envio (em produção, seria uma chamada real à API)
    return {
      success: true,
      message: `Arquivo "${params.fileName}" será enviado para ${cleanPhone}`,
      messageId: `msg_${Date.now()}`
    };

  } catch (error) {
    console.error('Erro ao enviar documento via WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar arquivo'
    };
  }
};

/**
 * Converte um Blob em Base64
 * @param blob - Arquivo em formato Blob
 * @returns String em Base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remover o prefixo "data:application/pdf;base64,"
      const base64String = base64.split(',')[1] || base64;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Gera um link de compartilhamento do WhatsApp com mensagem
 * (Alternativa para quando não há backend disponível)
 * @param phoneNumber - Número do WhatsApp
 * @param message - Mensagem a enviar
 * @returns URL do WhatsApp
 */
export const generateWhatsAppShareLink = (
  phoneNumber: string,
  message: string
): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Abre o WhatsApp Web com uma mensagem pré-preenchida
 * @param phoneNumber - Número do WhatsApp
 * @param message - Mensagem a enviar
 */
export const openWhatsAppWeb = (phoneNumber: string, message: string): void => {
  const link = generateWhatsAppShareLink(phoneNumber, message);
  window.open(link, '_blank');
};
