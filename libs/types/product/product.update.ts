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
	productAddress?: string;
	productMaterial?: ProductMaterial;
	productSize?: ProductSize;
	productTitle?: string;
	productPrice?: number;
	productImages?: string[];
	productDesc?: string;
	soldAt?: Date;
	deletedAt?: Date;
}
