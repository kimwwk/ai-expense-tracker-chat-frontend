/**
 * Categories API client
 */

import { apiClient } from "./client"

export interface Category {
  category_id: number
  category_name: string
  category_type: string
  category_group: string | null
  color_code: string | null
  icon_name: string | null
  is_active: boolean
  created_at: string
}

export interface CategoryCreate {
  category_name: string
  category_type: "income" | "expense" | "transfer"
  category_group?: string
  color_code?: string
  icon_name?: string
  is_active?: boolean
}

export interface CategoryUpdate {
  category_name?: string
  category_type?: "income" | "expense" | "transfer"
  category_group?: string
  color_code?: string
  icon_name?: string
  is_active?: boolean
}

export interface CategoryFilters {
  category_type?: string
  category_group?: string
  is_active?: boolean
  limit?: number
  offset?: number
}

export interface CategoriesResponse {
  data: Category[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  return apiClient<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getCategories(filters?: CategoryFilters): Promise<CategoriesResponse> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/categories?${queryString}` : "/categories"

  return apiClient<CategoriesResponse>(endpoint)
}

export async function getCategory(categoryId: number): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`)
}

export async function updateCategory(categoryId: number, data: CategoryUpdate): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await apiClient<void>(`/categories/${categoryId}`, {
    method: "DELETE",
  })
}
