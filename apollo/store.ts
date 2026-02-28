import { InMemoryCache, makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
  _id: '',
  memberType: '',
  memberStatus: '',
  memberAuthType: '',
  memberPhone: '',
  memberNick: '',
  memberFullName: '',
  memberImage: '',
  memberAddress: '',
  memberDesc: '',
  memberProducts: 0,
  memberRank: 0,
  memberArticles: 0,
  memberPoints: 0,
  memberLikes: 0,
  memberViews: 0,
  memberWarnings: 0,
  memberBlocks: 0,
});

/* ===== Product In Basket Type ===== */
export interface ProductInBasket {
  id: string;
  _id: string;
  productId: string;
  productTitle: string;
  productImages: string; // full image URL
  productPrice: number;
  itemQuantity: number;
  ringSize?: string | null;
  weight?: string | null;
  memberNick?: string;
  memberId?: string | null;
}

/* ===== LocalStorage Key ===== */
const CART_KEY = 'velouraCart';

/* ===== Load Initial Cart ===== */
function loadCart(): ProductInBasket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ===== Reactive Var ===== */
export const basketItemsVar = makeVar<ProductInBasket[]>(loadCart());

/* ===== Cart Helpers ===== */
export function setBasketItems(next: ProductInBasket[]) {
  basketItemsVar(next);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }
}

export function updateBasket(updater: (curr: ProductInBasket[]) => ProductInBasket[]) {
  const next = updater(basketItemsVar());
  setBasketItems(next);
}

export function clearBasket() {
  basketItemsVar([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_KEY);
  }
}

export function rehydrateBasketForCurrentUser() {
  setBasketItems(loadCart());
}

/* Apollo cache */
export const cache = new InMemoryCache({
  typePolicies: {
  },
});

/* Native WebSocket ref (nullable to avoid TS undefined issues) */
export const socketVar = makeVar<WebSocket | null>(null);
