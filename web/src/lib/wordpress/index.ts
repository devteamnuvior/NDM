import "server-only";

/**
 * The WordPress data layer. Server Components (and route handlers) import from here; UI components
 * never fetch by themselves, they receive the data as props.
 *
 * Adding a content type: add its answer type to `@/types/wordpress`, then a module like `posts.ts`
 * (REST path, fields, cached readers built on `content.ts`), and export it below.
 */
export { getBeforeAfter } from "./before-after";
export { isWordPressConfigured } from "./config";
export { settle, WordPressError, type Settled, type WordPressErrorKind } from "./errors";
export { getWordPressHealth } from "./health";
export { getPageBySlug, getPages, type PagesQuery, type WPPageSummary } from "./pages";
export { getPricingAdminTree, getPricingAdminUser, getPricingTree, savePricing, searchPricingProducts } from "./pricing";
export { getAdminPromotions, getPromotions, savePromotions, uploadPromotionPhoto } from "./promotions";
export { placeOrderRequest, type OrderRequestInput, type PlacedOrder } from "./orders";
export { getPostBySlug, getPosts, type PostsQuery, type WPPostSummary } from "./posts";
export { getPopularSearchTerms, logSearchTerm } from "./search";
export { WP_TAGS } from "./tags";
