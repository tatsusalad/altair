const { MessageEmbed } = require('discord.js');
const got = require('got');

module.exports = {
	name: 'urban',
	description: 'Searches a word on the UrbanDictionary.',
	usage: 'urban <search term>',
	args: true,
	aliases: ['urb', 'ud'],
	async execute(client, message, args, functions) {
		const { body: result } = await got(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(args.join(' '))}`, { responseType: 'json' });
		if (!result.list[0]) {
			return await message.reply(functions.simpleEmbed('Nothing found!'));
		}

		const definitions = result.list.sort((a, b) => {
			return (b.thumbs_up || 0) - (a.thumbs_up || 0);
		});

		const embed = new MessageEmbed()
			.setTitle(definitions[0].name || args.join(' '))
			.setURL(definitions[0].permalink || `http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(args.join(' '))}`)
			.setAuthor({ iconURL: 'https://pbs.twimg.com/profile_images/1149416858426081280/uvwDuyqS_400x400.png', name: 'Urban Dictionary' })
			.setFooter({ text: 'Definition by ' + definitions[0].author })
			.setColor(client.colors.blue)
			.setDescription(definitions[0].definition.replace(/\[|\]/g, ''));

		return await message.reply({ embeds: [embed] });
	},
};