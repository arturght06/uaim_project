/** Helper function to format date */
export const formatDate = (isoString) => {
  if (!isoString) return "Data nieznana";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", isoString, error);
    return "Niepoprawna data";
  }
};

/** Helper function to format location */
export const formatLocation = (loc) => {
  if (!loc) return "Lokalizacja nieznana";
  return `${loc.country}, ${loc.city}, ${loc.address}`;
};
