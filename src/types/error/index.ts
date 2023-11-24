export type ErrorDetails = {
  title: string;
  message: string;
  // TODO WAL-676 would be nice if we can bundle these details fields into a new type so that we can check on this field instead of the 2 separately
  detailsTitle?: string;
  detailsMessage?: string;
};
