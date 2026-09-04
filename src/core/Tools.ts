export interface Tools {
    name: string;
    description: string;
    // this line to be explained..
    execute: (args: Record<string, unknown>) => Promise<unknown>;
}