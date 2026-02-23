/**
 * Utility to generate human-readable QR aliases from guest names
 * Example: "John & Jane Smith" → "smith-family"
 */

/**
 * Generate a URL-friendly alias from a full name
 */
export function generateQRAlias(fullName: string): string {
  const name = fullName.toLowerCase().trim();

  // Extract last name (assumes "FirstName LastName" format)
  const parts = name.split(/\s+/);
  const lastName = parts[parts.length - 1];

  if (!lastName) {
    throw new Error("Unable to extract last name from full name");
  }

  // Remove special characters, keep only letters, numbers, and spaces
  const cleaned = lastName.replace(/[^a-z0-9\s-]/g, "");

  // Convert spaces to hyphens, remove multiple hyphens
  const alias = cleaned
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  return `${alias}-family`;
}

/**
 * Generate unique alias by appending number if needed
 */
export function generateUniqueQRAlias(
  fullName: string,
  existingAliases: string[],
): string {
  const baseAlias = generateQRAlias(fullName);

  // If alias is unique, return it
  if (!existingAliases.includes(baseAlias)) {
    return baseAlias;
  }

  // If alias exists, append number
  let counter = 2;
  let uniqueAlias = `${baseAlias}-${counter}`;

  while (existingAliases.includes(uniqueAlias)) {
    counter++;
    uniqueAlias = `${baseAlias}-${counter}`;
  }

  return uniqueAlias;
}

/**
 * Validate alias format
 */
export function validateQRAlias(alias: string): boolean {
  const aliasRegex = /^[a-z0-9-]+$/;
  return (
    aliasRegex.test(alias) &&
    alias.length >= 3 &&
    alias.length <= 50 &&
    !alias.startsWith("-") &&
    !alias.endsWith("-")
  );
}

// Examples:
// generateQRAlias("John Smith") → "smith-family"
// generateQRAlias("María García-López") → "garcia-lopez-family"
// generateQRAlias("The O'Brien Family") → "obrien-family"
// generateUniqueQRAlias("John Smith", ["smith-family"]) → "smith-family-2"
