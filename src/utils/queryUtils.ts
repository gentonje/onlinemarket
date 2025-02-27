
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { supabase } from "@/integrations/supabase/client";

// Optimized select query builder
export const optimizedSelect = <T>(
  table: string,
  columns: string = "*",
  options: {
    limit?: number;
    page?: number;
    filters?: Record<string, any>;
  } = {}
) => {
  const { limit = 10, page = 0, filters = {} } = options;

  let query = supabase
    .from(table)
    .select(columns, { count: "exact" })
    .range(page * limit, (page + 1) * limit - 1);

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = (query as PostgrestFilterBuilder<any, any, any>).eq(key, value);
    }
  });

  return query;
};

// Function to generate consistent query keys
export const generateQueryKey = (
  table: string,
  params: Record<string, any> = {}
): string[] => {
  const baseKey = [table];
  Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        baseKey.push(`${key}:${value}`);
      }
    });
  return baseKey;
};

// Prefetch helper for common queries
export const prefetchCommonQueries = async (queryClient: any) => {
  const commonQueries = [
    {
      table: "products",
      columns: "id,title,price,category",
      options: { limit: 10 },
    },
    {
      table: "cart_items",
      columns: "*",
    },
    {
      table: "wishlist_items",
      columns: "*",
    },
  ];

  await Promise.all(
    commonQueries.map(async ({ table, columns, options = {} }) => {
      const query = optimizedSelect(table, columns, options);
      const queryKey = generateQueryKey(table, options);
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => query,
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    })
  );
};
