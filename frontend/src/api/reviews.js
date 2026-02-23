import { http } from "./http";

function shouldTryLegacy(err) {
  return err?.status === 404 || err?.status === 405;
}

export const reviewsApi = {
  async getByProduct(productId) {
    const modern = `/api/products/${productId}/reviews`;
    const legacy = `/api/reviews/product/${productId}`;

    try {
      return await http.get(modern);
    } catch (modernErr) {
      if (!shouldTryLegacy(modernErr)) throw modernErr;
    }

    return http.get(legacy);
  },

  async upsertMine(productId, payload) {
    try {
      return await http.postJson(`/api/products/${productId}/reviews`, payload);
    } catch (modernErr) {
      if (!shouldTryLegacy(modernErr)) throw modernErr;
    }

    return http.postJson(`/api/reviews/product/${productId}`, payload);
  },

  async deleteMine(productId) {
    try {
      return await http.del(`/api/products/${productId}/reviews/me`);
    } catch (modernErr) {
      if (!shouldTryLegacy(modernErr)) throw modernErr;
    }

    return http.del(`/api/reviews/product/${productId}`);
  },
};
