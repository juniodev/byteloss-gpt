FROM node:14-slim

# Instalação do Google Chrome
RUN apt-get update \
	&& apt-get install -y wget gnupg \
	&& wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
	&& apt-get update \
	&& apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
	--no-install-recommends \
	&& rm -rf /var/lib/apt/lists/*

# Criação do diretório de trabalho e ajustes de permissão
WORKDIR /home/pptruser

# Copiar apenas yarn.lock inicialmente
COPY --chown=pptruser:pptruser yarn.lock ./

# Criação do usuário no sistema
USER pptruser
RUN adduser --no-update-notifier --disabled-password --gecos "" pptruser

# Instalação de dependências do Node.js usando yarn
RUN yarn install --quiet

# Copia o restante dos arquivos
COPY --chown=pptruser:pptruser . .

CMD ["yarn", "start"]
