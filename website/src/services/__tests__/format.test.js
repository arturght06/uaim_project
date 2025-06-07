import { formatDate, formatLocation, formatUser } from "../format";

describe("Formatting Utilities", () => {
  describe("formatDate", () => {
    test("formats a valid ISO string correctly", () => {
      // Note: The exact output depends on the locale and timezone of the test environment.
      // This test assumes a 'pl-PL' like environment for consistency.
      // For more robust tests, consider mocking Date or using a date-fns/moment.js.
      const isoString = "2023-10-26T10:30:00.000Z";
      // In a 'pl-PL' timezone like UTC+2 (Warsaw during summer for example) this would be 12:30
      // We are checking for the general structure.
      const formatted = formatDate(isoString);
      expect(formatted).toMatch(/26 października 2023.*(10:30|11:30|12:30)/); // Adjust time based on typical test env timezone
    });

    test('returns "Data nieznana" for null or undefined input', () => {
      expect(formatDate(null)).toBe("Data nieznana");
      expect(formatDate(undefined)).toBe("Data nieznana");
    });

    test('returns "Niepoprawna data" for an invalid date string', () => {
      expect(formatDate("invalid-date")).toBe("Niepoprawna data");
    });
  });

  describe("formatLocation", () => {
    test("formats a location object correctly", () => {
      const location = {
        country: "Poland",
        city: "Warsaw",
        address: "Main St 123",
      };
      expect(formatLocation(location)).toBe("Poland, Warsaw, Main St 123");
    });

    test('returns "Lokalizacja nieznana" for null or undefined input', () => {
      expect(formatLocation(null)).toBe("Lokalizacja nieznana");
      expect(formatLocation(undefined)).toBe("Lokalizacja nieznana");
    });
  });

  describe("formatUser", () => {
    test("formats a user object correctly", () => {
      const user = { name: "John", surname: "Doe" };
      expect(formatUser(user)).toBe("John Doe");
    });

    test('returns "Nieznany użytkownik" for null or undefined input', () => {
      expect(formatUser(null)).toBe("Nieznany użytkownik");
      expect(formatUser(undefined)).toBe("Nieznany użytkownik");
    });
  });
});
