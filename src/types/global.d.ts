// Array Prototype Enhancements
interface Array<T> {
    /**
     * Shuffles the array and returns a new shuffled array.
     */
    shuffle(): Array<T>;

    /**
     * Gets a random item from the array without modifying the original array.
     */
    getRandom(): T;
}

// String Prototype Enhancements
interface String {
    /**
     * Converts a string to title case.
     */
    toTitle(): string;

    /**
     * Capitalizes the first character of a string.
     */
    toCapitalize(): string;

    /**
     * Trims unnecessary indentation from multiline strings.
     */
    trimIndent(): string;

    /**
     * Converts a string into a code block of the specified type.
     * @param type Code script type (e.g., "js", "json").
     */
    toCodeScript(type?: CodeScriptType): string;

    /**
     * Converts a string to bold text.
     * @returns The string wrapped in bold formatting **here**.
     */
    toBold(): string;

    /**
     * Wraps a string in backticks.
     * @returns The string wrapped in backticks `here`.
     */
    toBackTick(): string;

    /**
     * Converts a string to italic text.
     * @returns The string wrapped in italic formatting _here_.
     */
    toItalic(): string;
}

// Number Prototype Enhancements
interface Number {
    /**
     * Converts a number to superscript.
     */
    toSupperScript(): string;
}

namespace NodeJS {
    interface ProcessEnv {
        API_KEY?: string;
        SECRET_KEY?: string;
        PG_URL: string;
        REDIS_URL?: string;
    }
}
