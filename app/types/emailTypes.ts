// app/types/emailTypes.ts
export interface EmailNotificationData {
  participantId: string;
  emails: string[]; // Array de emails del participante
  fullName: string;
  tandaNumber: number;
  trackNumber: number;
  blockNumber?: number;
  category: string;
  level: string;
  gender: string;
  participantCode: string;
  estimatedTime?: string;
  competitionName?: string;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailSendResult {
  success: number;
  failed: number;
  errors: string[];
  details: Array<{ 
    email: string; 
    success: boolean; 
    error?: string;
    participantCode?: string;
  }>;
}