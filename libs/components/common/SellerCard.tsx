import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { i18n, useTranslation } from 'next-i18next';

interface SellerCardProps {
	seller: any;
	likeMemberHandler: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	user?: any;
}

const SellerCard = (props: SellerCardProps) => {
	const { seller, likeMemberHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [liked, setLiked] = useState(seller?.meLiked?.[0]?.myFavorite || false);
	const [glow, setGlow] = useState(false);

	const imagePath: string = seller?.memberImage
		? `${process.env.REACT_APP_API_URL}/${seller?.memberImage}`
		: '/img/profile/defaultSeller.jpg';

	const handleLikeClick = (e: React.MouseEvent, productId: string) => {
		e.preventDefault();
		e.stopPropagation();
		likeMemberHandler(user, productId);
		setLiked((prev: any) => !prev);
		setGlow(true);
		setTimeout(() => setGlow(false), 600);
	};

	if (device === 'mobile') {
		return <div>SELLER CARD</div>;
	} else {
		return (
			<Stack className="top-seller-card">
				<Stack className="seller-image-container">
					<img src={imagePath} alt={seller.memberNick} />
				</Stack>

				<Stack className="top-seller-card-down">
					<Stack className="top-seller-card-info">
						<h1>
							<img src="/img/stores/address.png" alt="phone" />
							{seller.memberAddress ?? 'Seoul'}
						</h1>
						<strong>{seller.memberNick}</strong>
						<p>
							<img src="/img/stores/contact.png" alt="phone" />
							{seller.memberPhone}
						</p>
					</Stack>

					<Stack className="top-seller-card-middle">
						<span>{seller?.memberDesc ?? 'No Description'}</span>
					</Stack>

					<Stack className="stats-row">
						<div className="stat-item">
							<span className="icon">
								<img src="/img/icons/followers.png" alt="follower" />
							</span>
							<span>{seller.memberFollowers} Followers</span>
						</div>
						<div className="stat-item">
							<span className="icon">
								<img src="/img/icons/followers.png" alt="following" />
							</span>
							<span>{seller.memberFollowings} Followings</span>
						</div>
						<div className="stat-item">
							<span className="icon">
								<img src="/img/icons/product.png" alt="products" />
							</span>
							<span>{seller.memberProducts} Products</span>
						</div>
					</Stack>

					<button
						className="view-seller-btn"
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/seller/detail?id=${seller._id}`);
						}}
					>
						<span>View Seller Info</span>
					</button>

					{!recentlyVisited && (
						<div className="interaction-buttons">
							<Box className="view-box">
								<RemoveRedEyeIcon />
								<Typography>{seller?.memberViews}</Typography>
							</Box>

							<IconButton
								color="default"
								onClick={async (e: any) => {
									e.stopPropagation();
									if (!user || !user._id) {
										let message = '';
										if (i18n?.language === 'kr') {
											message = '좋아요를 누르려면 로그인해야 합니다.';
										} else if (i18n?.language === 'uz') {
											message = 'Tizimga login boling';
										} else {
											message = 'You must be logged in to like';
										}

										await sweetMixinErrorAlert(message, 2000, () => {
											router.push('/account/join'); // navigate AFTER alert closes
										});

										return;
									}
									handleLikeClick(e, seller._id);
								}}
								title={!user?._id ? 'Login required to like' : 'Like this product'}
							>
								{liked || myFavorites || seller?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon color="primary" className={glow ? 'glow' : ''} />
								) : (
									<FavoriteBorderIcon color={!user?._id ? 'disabled' : 'inherit'} />
								)}
							</IconButton>
						</div>
					)}
				</Stack>
			</Stack>
		);
	}
};

export default SellerCard;
