// Format a string to be used as a slug in URLs
export const formatSlugString = (val: string): string =>
  val
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase();
