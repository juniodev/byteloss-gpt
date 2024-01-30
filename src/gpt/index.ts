import { type Browser } from 'puppeteer';
import { bot } from '../bot'

import { escapers } from '@telegraf/entity'

function generateRandomCoordinates() {
	const latitude = (Math.random() * 180) - 90; // Gera um valor entre -90 e 90
	const longitude = (Math.random() * 360) - 180; // Gera um valor entre -180 e 180

	return { latitude, longitude };
}

const sendMessageGPT = async (bwr: Browser, data: any) => {
	try {
		const page = await bwr.newPage()

		const randomCoordinates = generateRandomCoordinates();

		page.setBypassCSP(true)
		page.setCacheEnabled(false)
		page.setGeolocation({ latitude: randomCoordinates.latitude, longitude: randomCoordinates.longitude })
		page.setRequestInterception(true)

		page.on('request', (request) => {
			if (request.resourceType() === 'manifest') {
				request.abort()
			} else if (request.resourceType() === 'other') {
				request.abort()
			} else if (request.resourceType() === 'image') {
				request.abort()
			} else if (request.resourceType() === 'font') {
				request.abort()
			} else if (request.resourceType() === 'cspviolationreport') {
				request.abort()
			} else if (request.resourceType() === 'stylesheet') {
				request.abort()
			} else {
				request.continue()
			}
		})

		await page.goto(
			data.url,
			{
				waitUntil: 'domcontentloaded'
			}
		)

		const input = await page.waitForSelector(
			'#prompt-textarea'
		)

		if (!input) {
			throw new Error('Input not found')
		}

		const message = `Sou ${data.name}, ${data.message}`

		await page.evaluate((message) => {
			const input = document.querySelector('#prompt-textarea') as HTMLInputElement
			if (!input) {
				throw new Error('Input not found')
			}
			input.value = message
		}, message)

		await input.type(' ', { delay: 5 });

		const send = await page.waitForSelector(
			'[data-testid="send-button"]'
		)

		if (!send) {
			throw new Error('Send button not found')
		}

		await send.click({ count: 1, delay: 50 })

		await page.waitForSelector('.markdown')

		await page.waitForResponse(
			response =>
				response.url() === 'https://chat.openai.com/backend-api/lat/r' && response.status() === 200
		);

		await page.exposeFunction('markdown', (message: string) => {
			return escapers.MarkdownV2(message)
		})

		const output = await page.evaluate(async () => {

			const output = document.querySelector('.markdown')

			if (!output) {
				return 'Não consigo responder essa pergunta.'
			}

			const nodes = output.children

			let msg = ""
			for (let i = 0; i < nodes.length; i++) {

				if (nodes[i].nodeName.toLocaleLowerCase() === 'p') {

					const text = nodes[i].innerHTML

					if (text) {
						const t = await window.markdown(text)
						msg += `\n${t}\n`
					}
					continue
				}

				if (nodes[i].nodeName.toLocaleLowerCase() === 'ol') {

					const list = nodes[i].children

					for (let i = 0; i < list.length; i++) {

						const lis = list[i].children

						for (let j = 0; j < lis.length; j++) {

							if (lis[j].tagName.toLocaleLowerCase() === 'p') {
								const text = lis[j].textContent

								if (!text) continue
								const t = await window.markdown(text)
								msg += `\n${t}\n`
							}

							if (lis[j].tagName.toLocaleLowerCase() === 'pre') {

								const code = lis[j].querySelector('code')

								if (code) {

									const co = code.innerText.replace(/[-*_()[\]~`>#+=|{}.!]/g, '\\$&').replaceAll(/"/g, "\\\"").replaceAll('!', '\\!')


									const linguagem = code.classList[code.classList.length - 1].split('-')[1]

									msg += "\n```" + linguagem + '\n' + co + "```\n"
								}
								continue
							}
						}

					}
					continue
				}

				if (nodes[i].tagName.toLocaleLowerCase() === 'pre') {

					const code = nodes[i].querySelector('code')

					if (code) {

						const co = code.innerText.replace(/[-*_()[\]~`>#+=|{}.!]/g, '\\$&').replaceAll(/"/g, "\\\"").replaceAll('!', '\\!')


						const linguagem = code.classList[code.classList.length - 1].split('-')[1]

						msg += "\n```" + linguagem + '\n' + co + "```\n"
					}
					continue
				}

			}

			return msg
		})

		await page.close()

		await bot.telegram.sendMessage(
			data.chat_id,
			output,
			{
				parse_mode: 'MarkdownV2',
				reply_to_message_id: data.message_id
			}
		)
	} catch (e) {
		console.log(e)
	}
}

export { sendMessageGPT }
