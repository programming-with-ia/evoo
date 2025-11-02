export const Consts = {
    CODE_RED: -1,
    isCodeRed(v: unknown): v is -1 {
        return v === Consts.CODE_RED;
    },
} as const;
