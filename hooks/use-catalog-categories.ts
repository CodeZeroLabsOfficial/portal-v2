"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  createCatalogCategoryAction,
  listCatalogCategoryOptionsAction,
} from "@/server/actions/catalog-categories";
import type { CatalogCategoryOption } from "@/types/catalog-category";

export function useCatalogCategories() {
  const [categories, setCategories] = React.useState<CatalogCategoryOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCatalogCategoryOptionsAction();
      if (res.ok) {
        setCategories(res.categories);
      } else {
        toast.error(res.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCategory = React.useCallback(async (label: string) => {
    const res = await createCatalogCategoryAction(label);
    if (!res.ok) {
      toast.error(res.message);
      return null;
    }
    setCategories((prev) => {
      if (prev.some((c) => c.id === res.category.id)) {
        return prev.map((c) => (c.id === res.category.id ? res.category : c));
      }
      return [...prev, res.category].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
    });
    return res.category;
  }, []);

  return { categories, loading, refresh, createCategory };
}
