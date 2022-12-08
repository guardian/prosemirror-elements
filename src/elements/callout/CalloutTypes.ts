export type Fields = {
  callout: string;
  formId: number;
  tagName: string;
  description?: string;
  formUrl?: string;
  _type: string;
};

export type Rules = {
  requiredTags: string[];
  lackingTags: string[];
  matchAllTags: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  fields: Fields;
  rules: Rules[];
  priority: number;
  displayOnSensitive: boolean;
  activeFrom?: number;
  activeUntil?: number;
};
