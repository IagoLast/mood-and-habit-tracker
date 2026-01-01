export class ElementResponseDto {
  id: number;
  category_id: number;
  name: string;
  icon_name: string | null;
  created_at: Date;
  updated_at: Date;
  created_at_timestamp_ms: number;
  updated_at_timestamp_ms: number;
}

export interface ListElementsResult {
  data: ElementResponseDto[];
}
