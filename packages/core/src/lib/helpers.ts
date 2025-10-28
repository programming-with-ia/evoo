/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { globals as G } from "./globals";

/**
 * A higher-order function that wraps another function to manage an Ora spinner.
 * It temporarily stops the spinner before executing the wrapped function and
 * restarts it afterward. This is useful for functions that perform their own
 * console logging (like prompts or log messages) to prevent the spinner from
 * interfering with their output.
 *
 * It correctly handles both synchronous and asynchronous (Promise-based) functions.
 *
 * @template T The type of the function being wrapped.
 * @param {T} fn The function to wrap.
 * @returns {T} A new function with the same signature as the input function.
 */
export function withSpinner<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
        const spinning = G.spinner.isSpinning;
        const t = G.spinner.text;

        if (spinning) {
            G.spinner.stop();
        }

        let result: unknown;
        try {
            result = fn(...args);
            if (result instanceof Promise) {
                return result.finally(() => {
                    if (spinning) {
                        G.spinner.start(t);
                    }
                }) as ReturnType<T>;
            }
            return result as ReturnType<T>;
        } finally {
            if (!(result instanceof Promise) && spinning) {
                G.spinner.start(t);
            }
        }
    }) as T;
}

export const isValidUrl = (str: string) =>
    /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(str);
