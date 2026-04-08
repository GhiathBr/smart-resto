export interface CreateMenuItemInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateMenuItemInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
}

export interface MenuItemFilters {
  categoryId?: string;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
