// import { productWeight } from './../../config'
import { Direction } from '../../enums/common.enum';
import {
	ProductBrand,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';

export interface ProductInput {
	productType: ProductType;
	productBrand: ProductBrand;
	productOrigin: string;
	productAddress: string;
	productColor?: string;
	productMaterial: ProductMaterial;
	productSize: ProductSize;
	productTitle: string;
	productPrice: number;
	// productStock: number;
	productWeightUnit: number; // 0 - kg, 1 - g, 2 - l
	productComments: number;
	productRank: number;
	productViews: number;
	productLikes: number;
	productImages: string[];
	productDesc?: string;
	productBarter?: boolean;
	productLimited?: boolean;
	memberId?: string;
}

interface PISearch {
	memberId?: string;
	brandList?: ProductBrand[];
	typeList?: ProductType[];
	materialList?: ProductMaterial[];
	sizeList?: ProductSize[];
	colorList?: string[];              // ✅ Optional, if you use it
	weightList?: number[];
	options?: string[];
	pricesRange?: PricesRange;
	dateRange?: DateRange;
	brand?: string[],
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	productStatus?: ProductStatus;
}

export interface StoreProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	productStatus?: ProductStatus;
	productBrand?: ProductBrand[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface PricesRange {
	start: number;
	end: number;
}

interface DateRange {
	start: Date | number;
	end: Date | number;
}
