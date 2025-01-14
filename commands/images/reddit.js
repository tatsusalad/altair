const { MessageEmbed, MessageActionRow, MessageButton, Guild, GuildChannel, Channel, Message } = require('discord.js');
const got = require('got');
module.exports = {
	name: 'reddit',
	description: 'Shows posts from a subreddit.',
	usage: 'reddit <search query> [sort type] [sorting timeframe]',
	cooldown: '10',
	args: true,
	aliases: ['red', 'reddit'],
	async execute(client, message, args, functions) {
		const subName = args.at(0);
		let sortType = args.at(1);
		let timeFrame = args.at(2);
		if (!['hot', 'top', 'new'].includes(sortType)) {
			sortType = 'hot';
		}
		timeFrame ??= 'all';
		const subredditUrl = await got(`https://www.reddit.com/r/${subName}/${sortType}.json?t=${timeFrame}`).json();
		const subreddit = subredditUrl.data.children;
		if (subredditUrl.data.after === null) {
			return message.reply(functions.simpleEmbed('Subreddit does not exist!'));
		}
                if (subreddit.at(0).kind === 't5') {
			return message.reply(functions.simpleEmbed(`Subreddit does not exist. Did you mean "${subreddit.at(0).data.url}"? `));
		}
		let x = 0;
		const nsfw = subreddit.at(x).data.over_18;
		if (nsfw === true & message.channel.nsfw === false) {
			return message.reply(functions.simpleEmbed('Cannot post nsfw content in sfw channel!'));
		}
		const embed = new MessageEmbed()
			.setAuthor({ iconURL: 'https://www.redditinc.com/assets/images/site/reddit-logo.png', name: `r/${subName}` })
			.setDescription(`["${subreddit.at(x).data.title}"](https://reddit.com${subreddit.at(x).data.permalink})`)
			.setColor(client.colors.blue)
			.setImage(subreddit.at(x).data.url)
			.setFooter({ text: `${x + 1}/${subreddit.length} - posted by ${subreddit.at(x).data.author}, ${subreddit.at(x).data.ups} upvotes.` });
		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton({ label: '◀', customId: 'previous', style: 'SECONDARY' }),
				new MessageButton({ label: '▶', customId: 'next', style: 'SECONDARY' }),
				new MessageButton({ label: '✕', customId: 'close', style: 'DANGER' }),
			);
		const imageMessage = await message.reply({ embeds: [embed], components: [buttons] });
		const filter = i => {
			i.deferUpdate();
			return i.user.id === message.author.id;
		};

		const collector = imageMessage.createMessageComponentCollector({ filter, idle: 60000 });
		collector.on('collect', i => {
			switch (i.customId) {
			case 'close':
				collector.stop();
				return;
			case 'next':
				if (x < subreddit.length) x++;
				break;
			case 'previous':
				if (x > 0) x--;
				break;
			default:
				return;
			}
			imageMessage.edit({ embeds: [
				embed.setImage(subreddit.at(x).data.url)
					.setFooter({ text: `${x + 1}/${subreddit.length} - posted by ${subreddit.at(x).data.author}, ${subreddit.at(x).data.ups} upvotes.` })
					.setDescription(`["${subreddit.at(x).data.title}"](https://reddit.com${subreddit.at(x).data.permalink})`),
			] });
		});
		collector.on('end', (collected, reason) => {
			if (reason === 'idle') imageMessage.edit({ components: [] });
			if (reason === 'user') {
				imageMessage.edit({ embeds: [embed.setImage().setDescription(`"${subName}"\nImage search closed.`)] });
				imageMessage.edit({ components: [] });
			}
		});
	},
};
