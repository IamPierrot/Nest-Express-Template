export type ResponseFormatted<T> = {
    status: boolean;
    data?: T;
    error?: unknown;
};
