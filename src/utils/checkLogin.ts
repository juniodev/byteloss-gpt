import { prompt } from "./prompt"
import { Browser, Page } from 'puppeteer'

const checkLogin = async (bwr: Browser) => {

	let page: Page | undefined
	try {

		if (bwr === undefined) {
			throw new Error(
				'Browser not found'
			)
		}

		console.log('Iniciando bot...')

		page = await bwr.newPage()

		await page.goto(
			'https://chat.openai.com/auth/login',
			{
				waitUntil: 'domcontentloaded'
			}
		)

		const gptLogin = await page.waitForSelector(
			'[data-testid="login-button"]',
			{
				timeout: 10000
			}
		)

		if (gptLogin === null) {
			throw new Error(
				'Login button not found'
			)
		}

		await gptLogin.click()

		await page.waitForNavigation()

		const googleLogin = await page.$(
			'[data-provider="google"]'
		)

		if (googleLogin === null) {
			throw new Error(
				'Google login button not found'
			)
		}

		await googleLogin.click()

		await page.waitForNavigation()

		const email = await page.$(
			'[type="email"]'
		)

		if (!email) {
			throw new Error(
				'Email input not found'
			)
		}

		const emailValue = await prompt('Email or phone: ');
		// const emailValue = process.env.EMAIL ?? '';

		await page.type('input[type="email"]', emailValue, { delay: 200 });

		await page.waitForTimeout(1000);

		await page.keyboard.press('Enter');

		await page.waitForNavigation();

		await page.waitForSelector('input[type="password"]')

		// const passwordValue = process.env.PASSWORD ?? '';
		const passwordValue = await prompt('Password: ');

		await page.type(
			'input[type="password"]', passwordValue, { delay: 200 }
		);

		await page.waitForTimeout(2000);

		await page.keyboard.press('Enter');

		await page.waitForNavigation();

		await page.waitForTimeout(30000);

		await page.close()

	} catch (error) {
		if (page) await page.close()
	}
}

export { checkLogin }
