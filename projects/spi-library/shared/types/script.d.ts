declare function runInIllustrator(
    scriptFilePath: string,
    args: any[]
): {
    value: any;
    erred: boolean;
    error: any;
    logs: { time: string; message: string }[];
};
