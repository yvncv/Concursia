// types/izipay.d.ts
declare global {
  interface Window {
    KR: {
      removeForms: () => void;
      renderElements: () => Promise<void>;
      onError: ((error: any) => void) | null;
      onFormReady: (() => void) | null;
      onSubmit: ((paymentData: any) => boolean) | null;
      setFormConfig: (config: any) => void;
      attachForm: (selector: string) => void;
    };
  }
}

export interface IzipayResponse {
  clientAnswer: {
    orderStatus: string;
    orderCycle: string;
    orderDetails: any;
    transactions: any[];
  };
  rawClientAnswer: any;
}

export interface IzipayError {
  errorCode: string;
  errorMessage: string;
  detailedErrorCode?: string;
  detailedErrorMessage?: string;
}

export {};