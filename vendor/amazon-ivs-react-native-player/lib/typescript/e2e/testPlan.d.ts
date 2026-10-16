import { element } from 'detox';
type NativeMatcher = Parameters<typeof element>[0];
export declare const beforeAllTestPlan: () => Promise<void>;
export declare const afterAllTestPlan: () => Promise<void>;
export declare const waitForTestPlan: (testPlan: string) => Promise<void>;
export declare const waitToBeVisible: (match: NativeMatcher, seconds?: number) => Promise<void>;
export declare const waitForTap: (match: NativeMatcher, seconds?: number) => Promise<void>;
export declare const waitForReplaceText: (match: NativeMatcher, text: any, seconds?: number) => Promise<void>;
export declare const waitForLogID: (id: string, seconds?: number) => Promise<void>;
export declare const waitForLogLabel: (label: string, seconds?: number) => Promise<void>;
export declare const waitForClearLogs: () => Promise<void>;
export declare const tempHold: (seconds?: number) => Promise<void>;
export {};
//# sourceMappingURL=testPlan.d.ts.map