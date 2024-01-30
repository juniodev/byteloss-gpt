import * as readline from 'readline';

const prompt = (query: string, hidden = false): Promise<string> =>
	new Promise((resolve, reject) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		try {
			if (hidden) {
				const stdin = process.openStdin();
				process.stdin.on('data', (char: string) => {
					char = char + '';
					switch (char) {
						case '\n':
						case '\r':
						case '\u0004':
							stdin.pause();
							break;
						default:
							process.stdout.clearLine(0);
							readline.cursorTo(process.stdout, 0);
							process.stdout.write(query + Array(rl.line.length + 1).join('*'));
							break;
					}
				});
			}
			rl.question(query, (value) => {
				resolve(value);
				rl.close();
			});
		} catch (err) {
			reject(err);
		}
	});

export { prompt }
