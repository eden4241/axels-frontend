import React, { useState } from 'react';
import {
	Box,
	Button,
	Typography,
	TextField,
	Stack,
	Checkbox,
	FormControlLabel,
	Divider,
	IconButton,
	CircularProgress,
	Link,
} from '@mui/material';
import { useReactiveVar, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { basketItemsVar, clearBasket, userVar } from '../../apollo/store';
import { CREATE_ORDER } from '../../apollo/user/mutation';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import BlockIcon from '@mui/icons-material/Block';

const Checkout = () => {
	const basketItems = useReactiveVar(basketItemsVar);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	const [specialInstructions, setSpecialInstructions] = useState('');
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [giftWrap, setGiftWrap] = useState(false);
	const [shippingFee, setShippingFee] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);

	const [cardName, setCardName] = useState('');
	const [cardNumber, setCardNumber] = useState('');
	const [cardCvv, setCardCvv] = useState('');

	const [createOrder] = useMutation(CREATE_ORDER);

	if (user?.memberType !== 'USER') {
		return (
			<Box p={5} textAlign="center">
				<Typography
					variant="h3"
					fontWeight={600}
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 1,
						color: '#a94442',
						fontFamily: 'Playfair Display, serif',
						marginBottom: 2,
					}}
				>
					<BlockIcon sx={{ fontSize: 78 }} />
					Only regular users can place orders.
				</Typography>
			</Box>
		);
	}

	const handleQuantityChange = (id: string, delta: number) => {
		const updated = [...basketItemsVar()];
		const index = updated.findIndex((i) => i.productId === id);
		if (index > -1) {
			updated[index].itemQuantity = Math.max(1, updated[index].itemQuantity + delta);
			basketItemsVar(updated);
		}
	};

	const handleRemove = (id: string) => {
		const filtered = basketItemsVar().filter((i) => i.productId !== id);
		basketItemsVar(filtered);
	};

	const subtotal = basketItems.reduce((acc, item) => acc + item.productPrice * item.itemQuantity, 0);
	const giftWrapFee = giftWrap ? 10000 : 0;
	const total = subtotal + (shippingFee ?? 0) + giftWrapFee;

	const formatCardNumber = (value: string) => {
		return value
			.replace(/\D/g, '')
			.slice(0, 16)
			.replace(/(.{4})/g, '$1 ')
			.trim();
	};

	const handleFakePayment = async () => {
		if (!agreeTerms || !cardNumber || !cardCvv || !cardName) return;

		setLoading(true);

		try {
			// Create the order with items from basket
			const { data } = await createOrder({
				variables: {
					input: basketItems.map((item) => ({
						productId: item.productId,
						itemQuantity: item.itemQuantity,
						itemPrice: item.productPrice,
					})),
				},
			});

			const newOrder = data?.createOrder;
			const newOrderId = newOrder?._id;
			const orderTotal = newOrder?.orderTotal ?? total;

			// Persist for success page (and as a fallback on refresh)
			try {
				sessionStorage.setItem('lastOrderId', String(newOrderId ?? ''));
				sessionStorage.setItem('lastOrderTotal', String(orderTotal ?? ''));
			} catch {}

			// Clear cart for the next purchase flow
			clearBasket();

			// Go to success with real orderId/total
			router.push({
				pathname: '/checkout/success',
				query: {
					orderId: String(newOrderId ?? ''),
					total: String(orderTotal ?? ''),
				},
			});
		} catch (err: any) {
			alert('Failed to place order. Please try again.');
			console.error(err?.message || err);
			setLoading(false);
		}
	};

	return (
		<Box id="checkout-page" className="checkout-container">
			<Typography variant="h4" className="checkout-title">
				Your Cart
			</Typography>

			<Stack direction="row" spacing={4}>
				{/* LEFT: Cart Items */}
				<Box className="checkout-left">
					{basketItems.map((item) => (
						<Stack key={item.productId} direction="row" spacing={2} className="checkout-item">
							<img src={item.productImages} alt={item.productTitle} width={80} height={80} />
							<Box className="checkout-item-info">
								<Typography>{item.productTitle}</Typography>
								<Typography>₩{item.productPrice.toLocaleString()}</Typography>

								<Stack spacing={0.25} sx={{ mt: 0.5 }}>
									{/* ✅ Always show weight */}
									{typeof item.weight !== 'undefined' && item.weight !== null && (
										<Typography variant="body2" sx={{ color: '#7a6a58' }}>
											• Weight: <b>{item.weight}</b>
										</Typography>
									)}

									{/* ✅ Only show ring size if present */}
									{typeof item.ringSize !== 'undefined' && item.ringSize !== null && (
										<Typography variant="body2" sx={{ color: '#7a6a58' }}>
											• Size: <b>{item.ringSize}</b>
										</Typography>
									)}

									{/* ✅ Show seller/store name with link */}
									{item.memberId && item.memberNick && (
										<Typography variant="body2" sx={{ color: '#7a6a58' }}>
											• Seller:{' '}
											<Link
												href={`/store/detail?id=${item.memberId}`}
												style={{ color: '#b8860b', textDecoration: 'none', fontWeight: 500 }}
												>
												{item.memberNick}
												</Link>

										</Typography>
									)}
								</Stack>
							</Box>

							<Stack direction="row" spacing={1}>
								<Button onClick={() => handleQuantityChange(item.productId, -1)}>-</Button>
								<Typography>{item.itemQuantity}</Typography>
								<Button onClick={() => handleQuantityChange(item.productId, 1)}>+</Button>
							</Stack>
							<Typography>₩{(item.productPrice * item.itemQuantity).toLocaleString()}</Typography>
							<IconButton onClick={() => handleRemove(item.productId)}>
								<DeleteOutlineIcon />
							</IconButton>
						</Stack>
					))}

					{/* Notes */}
					<Box className="checkout-note">
						<Typography>Order Special Instructions:</Typography>
						<TextField
							placeholder="Additional Information"
							multiline
							fullWidth
							rows={1}
							value={specialInstructions}
							onChange={(e) => setSpecialInstructions(e.target.value)}
						/>
					</Box>

					{/* Gift Wrap */}
					<FormControlLabel
						control={<Checkbox checked={giftWrap} onChange={() => setGiftWrap(!giftWrap)} />}
						label="Gift wrap your purchase for just ₩10,000"
					/>
				</Box>

				{/* RIGHT: Checkout Summary */}
				<Box className="checkout-summary">
					<Typography variant="h6">Shipping Estimates</Typography>
					<TextField fullWidth placeholder="Country / Region" />
					<TextField fullWidth placeholder="State" />
					<TextField fullWidth placeholder="Postal / Zip Code" />
					<Button onClick={() => setShippingFee(30000)}>Calculate Shipping</Button>

					<Divider />

					<Typography>Subtotal: ₩{subtotal.toLocaleString()}</Typography>
					{shippingFee !== null && <Typography>Shipping Fee: ₩{shippingFee.toLocaleString()}</Typography>}
					{giftWrap && <Typography>Gift Wrap: ₩{giftWrapFee.toLocaleString()}</Typography>}
					<Typography>Total: ₩{total.toLocaleString()}</Typography>

					<Divider />

					<Typography variant="h6">Card Payment</Typography>
					<TextField fullWidth label="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
					<TextField
						fullWidth
						label="Card Number"
						value={cardNumber}
						onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
						placeholder="XXXX XXXX XXXX XXXX"
						inputProps={{ maxLength: 19 }}
					/>
					<TextField
						fullWidth
						label="CVV"
						value={cardCvv}
						onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
						placeholder="123"
						inputProps={{ maxLength: 3 }}
					/>

					<FormControlLabel
						control={<Checkbox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />}
						label="I agree with the terms & conditions"
					/>

					<Button fullWidth variant="contained" disabled={!agreeTerms || loading} onClick={handleFakePayment}>
						{loading ? <CircularProgress size={20} /> : 'Proceed to Checkout'}
					</Button>

					<Stack direction="row" justifyContent="space-between">
						<Button onClick={() => router.push('/store')}>Return to Sellers</Button>
						<Button color="error" onClick={() => basketItemsVar([])}>
							Empty Cart
						</Button>
					</Stack>
				</Box>
			</Stack>
		</Box>
	);
};

export default withLayoutBasic(Checkout);
