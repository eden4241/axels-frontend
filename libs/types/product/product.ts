import {
	ProductBrand,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Product {
	_id: string;
	productType: ProductType;
	productBrand: ProductBrand;
	productAddress: string;
	productStatus: ProductStatus;
	productOrigin: string;
	productColor?: string;
	productMaterial: ProductMaterial;
	productSize: ProductSize;
	productTitle: string;
	productPrice: number;
	productStock: number;
	productComments: number;
	productRank: number;
	productViews: number;
	productLikes: number;
	productImages: string[];
	productDesc?: string;
	productWeightUnit?: boolean;
	productBarter?: boolean;
	productLimited?: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
