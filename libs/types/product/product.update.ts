import {
	ProductBrand,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productBrand?: ProductBrand;
	productOrigin?: string;
	productColor?: string;
	productWeightUnit? : number; // 0 - kg, 1 - g, 2 - l
	productAddress?: string;
	productMaterial?: ProductMaterial;
	productSize?: ProductSize;
	productTitle?: string;
	productPrice?: number;
	productImages?: string[];
	productDesc?: string;
	productLimited?: boolean;
	productBarter?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
}
