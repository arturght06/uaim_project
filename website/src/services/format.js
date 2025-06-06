/** Helper function to format date */
export const formatDate = (isoString) => {
  if (!isoString) return "Data nieznana";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date input:", isoString);
      return "Niepoprawna data";
    }
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

/** Helper function to format user */
export const formatUser = (user) => {
  if (!user) return "Nieznany użytkownik";
  return `${user.name} ${user.surname}`;
};
