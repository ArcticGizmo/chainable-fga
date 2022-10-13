export interface CompleteTuple {
  user: string;
  object: string;
  relation: string;
}

export interface CompleteTypeTuple {
  user: string;
  type: string;
  relation: string;
}

export interface PartialTuple {
  user?: string;
  object?: string;
  relation?: string;
}

export interface PartialTypeTuple {
  user?: string;
  type?: string;
  relation?: string;
}
