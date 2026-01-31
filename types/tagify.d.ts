declare module "@yaireo/tagify" {
  export interface TagifyConfig {
    whitelist?: string[];
    blacklist?: string[];
    maxTags?: number;
    maxChars?: number;
    editTags?: boolean;
    readonly?: boolean;
    placeholder?: string;
    dropdown?: {
      enabled?: number;
      maxItems?: number;
      classname?: string;
      closeOnSelect?: boolean;
      fuzzySearch?: boolean;
      accentedSearch?: boolean;
    };
    originalInputValueFormat?: (value: Array<{ value: string }>) => string;
    transformTag?: (tagData: { value: string; title?: string }) => void;
    keepInvalidTags?: boolean;
    skipInvalid?: boolean;
    mixTagsInterpolation?: string[];
    mixTagsAllowedAfter?: RegExp;
    createTagSource?: (data: { value: string }) => HTMLElement | null;
  }

  export interface TagData {
    value: string;
    title?: string;
  }

  export default class Tagify {
    constructor(element: HTMLInputElement | HTMLTextAreaElement, config?: TagifyConfig);
    attach(element: HTMLInputElement | HTMLTextAreaElement): void;
    destroy(): void;
    addTags(tags: string[] | TagData[]): Tagify;
    removeAllTags(): Tagify;
    removeTag(tag: Element | number): Tagify;
    loadOriginalValues(): Tagify;
    getCleanValue(): TagData[];
    readonly value: string;
    readonly DOM: {
      scope: Element;
      input: HTMLElement;
      tagList: HTMLElement;
    };
  }
}
