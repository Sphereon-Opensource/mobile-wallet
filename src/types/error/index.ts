export type ErrorDetails = {
  // TODO RENAME
  title: string;
  message: string;
  // TODO add sub type details
  //details?: ErrorDetailsDetails
  detailsTitle?: string;
  detailsMessage?: string;
};

export type ErrorDetailsDetails = {
  // TODO RENAME
  title?: string;
  message?: string;
};
