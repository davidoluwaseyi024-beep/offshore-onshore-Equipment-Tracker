export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface Site {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state_region: string;
  country: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string;
}
