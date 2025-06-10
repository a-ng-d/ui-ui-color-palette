import translations from '../content/translations/en-US.json';

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[]> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}.${Join<Extract<R, string[]>>}`
    : never
  : string;

export type TranslationKeys = Join<PathsToStringProps<typeof translations>>;

declare global {
  interface Window {
    __TRANSLATIONS__: Record<TranslationKeys, string>;
  }
}
