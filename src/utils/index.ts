/**
 * Utility functions for the Shopee SDK.
 */

/**
 * Filters out undefined values from an object.
 * This is useful for preparing request bodies where optional fields should be omitted.
 */
export function filterUndefined<T extends Record<string, unknown>>(
	obj: T,
): Partial<T> {
	const result: Partial<T> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) {
			result[key as keyof T] = value as T[keyof T];
		}
	}
	return result;
}

/**
 * Normalizes a snake_case key to camelCase.
 * (Optional: can be used for automated normalization)
 */
export function snakeToCamel(str: string): string {
	return str.replace(/([-_][a-z])/g, (group) =>
		group.toUpperCase().replace("-", "").replace("_", ""),
	);
}
