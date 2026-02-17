// src/api/reviews.js
import { request } from "./http";

async function tryMany(paths, options) {
  let lastErr = null;

  for (const p of paths) {
    try {
      return await request(p, options);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Error inesperado");
}

export const reviewsApi = {
  async getByProduct(productId) {
    return tryMany(
      [
        `/api/reviews/product/${productId}`,
        `/api/products/${productId}/reviews`,
      ],
      { method: "GET" }
    );
  },

  async upsertMine(productId, payload) {
    return tryMany(
      [
        `/api/reviews/product/${productId}`,
        `/api/products/${productId}/reviews`,
      ],
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteMine(productId) {
    return tryMany(
      [
        `/api/reviews/product/${productId}`,
        `/api/products/${productId}/reviews`,
      ],
      { method: "DELETE" }
    );
  },
};
