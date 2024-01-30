import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { Browser } from 'puppeteer'
import { sendMessageGPT } from '../gpt'


const TOKEN = process.env.BOT_TOKEN ?? ''

const bot = new Telegraf(TOKEN)

const start = async (bwr: Browser) => {

	bot.on(message('text'), (ctx) => {

		ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

		sendMessageGPT(
			bwr,
			{
				url: 'https://chat.openai.com',
				chat_id: ctx.chat.id,
				name: ctx.from.first_name,
				message: ctx.message.text,
				message_id: ctx.update.message.message_id
			}
		)
	})

	await bot.launch({ dropPendingUpdates: true })
}

export { start as startBot, bot }
