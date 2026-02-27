import React, { useCallback, useMemo, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

type Country = { code: string; name: string; dial: string };

const COUNTRIES: Country[] = [
	{ code: 'KR', name: 'South Korea', dial: '82' },
	{ code: 'US', name: 'United States', dial: '1' },
	{ code: 'JP', name: 'Japan', dial: '81' },
	{ code: 'CN', name: 'China', dial: '86' },
	{ code: 'GB', name: 'UK', dial: '44' },
	{ code: 'DE', name: 'Germany', dial: '49' },
	{ code: 'FR', name: 'France', dial: '33' },
	{ code: 'UZ', name: 'Uzbekistan', dial: '998' },
];

// === Limits you requested ===
const MIN_NICK = 3;
const MIN_PASS = 6;

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation();

	/** Tabs */
	const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

	/** ===== Login state ===== */
	const [loginInput, setLoginInput] = useState({
		nick: '',
		password: '',
		agree: false,
		remember: true,
	});
	const [loginTouched, setLoginTouched] = useState<{ nick?: boolean; password?: boolean }>({});
	const [loginGlow, setLoginGlow] = useState(false);

	/** ===== Signup state ===== */
	const [signupInput, setSignupInput] = useState({
		nick: '',
		password: '',
		type: 'USER' as 'USER' | 'STORE',
		agree: false,
		country: 'KR',
		phoneNational: '',
	});
	const [signupTouched, setSignupTouched] = useState<{ nick?: boolean; password?: boolean; phone?: boolean }>({});
	const [signupGlow, setSignupGlow] = useState(false);

	/** Derived phone (E.164) */
	const dialCode = useMemo(
		() => COUNTRIES.find((c) => c.code === signupInput.country)?.dial ?? '82',
		[signupInput.country],
	);
	const phoneE164 = useMemo(() => {
		const digits = signupInput.phoneNational.replace(/\D+/g, '');
		return digits ? `+${dialCode}${digits}` : '';
	}, [signupInput.phoneNational, dialCode]);

	/** Validation */
	const validNick = (v: string) => v.trim().length >= MIN_NICK;
	const validPass = (v: string) => v.trim().length >= MIN_PASS;

	const loginValid = validNick(loginInput.nick) && validPass(loginInput.password) && loginInput.agree;
	const signupValid =
		validNick(signupInput.nick) && validPass(signupInput.password) && signupInput.agree && phoneE164.length > 3;

	/** Handlers */
	const onLoginChange = useCallback((name: keyof typeof loginInput, value: any) => {
		setLoginInput((s) => ({ ...s, [name]: value }));
	}, []);
	const onSignupChange = useCallback((name: keyof typeof signupInput, value: any) => {
		setSignupInput((s) => ({ ...s, [name]: value }));
	}, []);

	// helper: flash red glow if agreement missing
	const nudgeGlow = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
		setter(true);
		setTimeout(() => setter(false), 1200);
	};

	const doLogin = useCallback(async () => {
		if (!loginValid) {
			if (!loginInput.agree) nudgeGlow(setLoginGlow);
			return;
		}
		try {
			await logIn(loginInput.nick.trim(), loginInput.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [loginInput, loginValid]);

	const doSignUp = useCallback(async () => {
		if (!signupValid) {
			if (!signupInput.agree) nudgeGlow(setSignupGlow);
			return;
		}
		try {
			await signUp(signupInput.nick.trim(), signupInput.password, phoneE164, signupInput.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [signupInput, signupValid, phoneE164]);

	return (
		<Stack className="join-page">
			<Stack className="container">
				<Stack className="main centered">
					<Stack
						className="form-card tabs-card"
						onKeyDown={(e: any) => {
							if (e.key === 'Enter') {
								if (activeTab === 'login') {
									if (!loginValid && !loginInput.agree) nudgeGlow(setLoginGlow);
									if (loginValid) doLogin();
								}
								if (activeTab === 'signup') {
									if (!signupValid && !signupInput.agree) nudgeGlow(setSignupGlow);
									if (signupValid) doSignUp();
								}
							}
						}}
					>
						{/* Tabs Header */}
						<Box className="tabs-header" role="tablist" aria-label="Authentication tabs">
							<button
								role="tab"
								aria-selected={activeTab === 'login'}
								className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
								onClick={() => setActiveTab('login')}
							>
								{t('Login')}
							</button>
							<button
								role="tab"
								aria-selected={activeTab === 'signup'}
								className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
								onClick={() => setActiveTab('signup')}
							>
								{t('Signup')}
							</button>
							<span className={`pill ${activeTab}`} aria-hidden />
						</Box>

						{/* Panel: LOGIN */}
						{activeTab === 'login' && (
							<Box role="tabpanel" className="tab-panel">
								<Box className="info">
									<span>{t('Login')}</span>
									<p>{t('Welcome back to Veloura — please sign in to continue.')}</p>
								</Box>

								<Box className="input-wrap">
									<div className="input-box">
										<span>{t('Nickname')}</span>
										<input
											type="text"
											placeholder={t('Enter Nickname')}
											value={loginInput.nick}
											onChange={(e) => onLoginChange('nick', e.target.value)}
											onBlur={() => setLoginTouched((t) => ({ ...t, nick: true }))}
										/>
										{loginTouched.nick && !validNick(loginInput.nick) && (
											<em className="field-error">{t('Please enter at least 3 characters')}</em>
										)}
									</div>

									<div className="input-box">
										<span>{t('Password')}</span>
										<input
											type="password"
											placeholder={t('Enter Password')}
											value={loginInput.password}
											onChange={(e) => onLoginChange('password', e.target.value)}
											onBlur={() => setLoginTouched((t) => ({ ...t, password: true }))}
										/>
										{loginTouched.password && !validPass(loginInput.password) && (
											<em className="field-error">{t('Please enter at least 6 characters')}</em>
										)}
									</div>
								</Box>

								<Box className="register">
									<div className="remember-info">
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={loginInput.remember}
														onChange={(e) => onLoginChange('remember', e.target.checked)}
													/>
												}
												label={t('Remember me')}
											/>
										</FormGroup>
										<a>{t('Lost your password?')}</a>
									</div>

									<div className="agreements">
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={loginInput.agree}
														onChange={(e) => onLoginChange('agree', e.target.checked)}
														sx={{
															boxShadow: loginGlow ? '0 0 0 4px rgba(255,0,0,0.55)' : 'none',
															borderRadius: '4px',
															transition: 'box-shadow 0.25s ease',
														}}
													/>
												}
												label={
													<span>
														{t('I agree to the')} <b className="linkish">{t('Terms')}</b> {t('and')}{' '}
														<b className="linkish">{t('Privacy Policy')}</b>
													</span>
												}
											/>
										</FormGroup>
									</div>

									<Button
										variant="contained"
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										// keep enabled so click always works
										disabled={!(validNick(loginInput.nick) && validPass(loginInput.password))}
										onClick={doLogin}
									>
										{t('LOGIN')}
									</Button>
								</Box>
							</Box>
						)}

						{/* Panel: SIGNUP */}
						{activeTab === 'signup' && (
							<Box role="tabpanel" className="tab-panel">
								<Box className="info">
									<span>{t('SIGNUP')}</span>
									<p>{t('Create your Veloura account to explore luxurious pieces.')}</p>
								</Box>

								<Box className="input-wrap">
									<div className="input-box">
										<span>{t('Nickname')}</span>
										<input
											type="text"
											placeholder={t('Choose a Nickname')}
											value={signupInput.nick}
											onChange={(e) => onSignupChange('nick', e.target.value)}
											onBlur={() => setSignupTouched((t) => ({ ...t, nick: true }))}
										/>
										{signupTouched.nick && !validNick(signupInput.nick) && (
											<em className="field-error">{t('Please enter at least 3 characters')}</em>
										)}
									</div>

									<div className="input-box">
										<span>{t('Password')}</span>
										<input
											type="password"
											placeholder={t('Create Password')}
											value={signupInput.password}
											onChange={(e) => onSignupChange('password', e.target.value)}
											onBlur={() => setSignupTouched((t) => ({ ...t, password: true }))}
										/>
										{signupTouched.password && !validPass(signupInput.password) && (
											<em className="field-error">{t('Password must be at least 6 characters')}</em>
										)}
									</div>

									<div className="input-box">
										<span>{t('Phone')}</span>
										<div className="phone-row">
											<select
												className="country"
												value={signupInput.country}
												onChange={(e) => onSignupChange('country', e.target.value)}
												aria-label="Country"
											>
												{COUNTRIES.map((c) => (
													<option key={c.code} value={c.code}>
														{t(c.name)} (+{c.dial})
													</option>
												))}
											</select>

											<div className="dial">+{dialCode}</div>

											<input
												className="phone"
												type="tel"
												inputMode="numeric"
												placeholder={t('Phone number')}
												value={signupInput.phoneNational}
												onChange={(e) => onSignupChange('phoneNational', e.target.value.replace(/[^\d]/g, ''))}
												onBlur={() => setSignupTouched((t) => ({ ...t, phone: true }))}
											/>
										</div>
										{signupTouched.phone && phoneE164.length <= 3 && (
											<em className="field-error">{t('Please enter a valid phone number.')}</em>
										)}
									</div>
								</Box>

								<Box className="register">
									<div className="type-option">
										<span className="text">{t('I want to be registered as:')}</span>
										<div>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															checked={signupInput.type === 'USER'}
															onChange={() => onSignupChange('type', 'USER')}
														/>
													}
													label={t('User')}
												/>
											</FormGroup>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															checked={signupInput.type === 'STORE'}
															onChange={() => onSignupChange('type', 'STORE')}
														/>
													}
													label={t('Seller')}
												/>
											</FormGroup>
										</div>
									</div>

									<div className="agreements">
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={signupInput.agree}
														onChange={(e) => onSignupChange('agree', e.target.checked)}
														sx={{
															boxShadow: signupGlow ? '0 0 0 2px rgb(238, 30, 30)' : 'none',
															borderRadius: '2px',
															transition: 'box-shadow 0.25s ease',
														}}
													/>
												}
												label={
													<span>
														{t('I agree to the')} <b className="linkish">{t('Membership Terms')}</b> {t('and')}{' '}
														<b className="linkish">{t('Privacy Policy')}</b>
													</span>
												}
											/>
										</FormGroup>
									</div>

									<Button
										variant="contained"
										endIcon={<img src="/img/icons/rightup.svg" alt="" />}
										disabled={!(validNick(signupInput.nick) && validPass(signupInput.password) && phoneE164.length > 3)}
										onClick={doSignUp}
									>
										{t('SIGNUP')}
									</Button>
								</Box>
							</Box>
						)}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
