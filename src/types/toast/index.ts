export enum ToastTypeEnum {
  TOAST_SUCCESS = 'ssiAlertToastSuccess',
  TOAST_ERROR = 'ssiAlertToastError',
}

export interface IToastConfigParams {
  title?: string;
  message?: string;
  showBadge?: boolean;
}

export interface IToastCustomProps {
  showBadge?: boolean;
}
