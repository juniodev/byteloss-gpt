import { Browser } from 'puppeteer';
import { startBot } from './bot'
import { checkLogin } from './utils/checkLogin';
import { browserInstance } from './browser';


let bwr: Browser | undefined
(async () => {

	bwr = await browserInstance()

	await checkLogin(
		bwr
	)

	console.log('Starting bot...')

	await startBot(
		bwr
	)

	console.log('Bot started!')

})();
