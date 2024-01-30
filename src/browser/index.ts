import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import vanilla from 'puppeteer'
import { addExtra } from 'puppeteer-extra'

const exactPath = {
	linux: '/usr/bin/google-chrome',
	win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
} as const

const browserInstance = async () => {

	const puppeteer = addExtra(vanilla)

	puppeteer.use(StealthPlugin())

	const bwr = await puppeteer.launch({
		headless: 'new',
		devtools: false,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-cache',
			'--ignore-certificate-errors',
			'--ignore-certificate-errors-spki-list',
			'--ignore-ssl-errors',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--disable-notifications',
			'--disable-extensions',
			'--mute-audio',
			'--max-old-space-size=1024',
			'--disable-cpu'
		],
		ignoreDefaultArgs: ['--disable-extensions'],
		userDataDir: './datafile',
		executablePath: exactPath[process.platform as keyof typeof exactPath]
	})

	return bwr
}

export { browserInstance }
