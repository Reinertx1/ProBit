const { MessageEmbed } = require('discord.js');

let schema = require('../../DataBase/models/badwords.js');

// Function to generate a random numeric ID

function generateNumericId(length) {

    const numbers = '0123456789';

    let result = '';

    for (let i = 0; i < length; i++) {

        result += numbers.charAt(Math.floor(Math.random() * numbers.length));

    }

    return result;

}

module.exports = {

    name: 'badwords',

    description: 'To manage bad words',

    type: 1, // Must be 1 if using options and description

    options: [

        {

            name: "add",

            description: "To add a bad word",

            type: 1, // CHAT_INPUT

            options: [

                {

                    name: 'word',

                    description: 'The word to add',

                    required: true,

                    type: 3,

                    minLength: 2,

                    maxLength: 10

                }

            ]

        },

        {

            name: "list",

            description: "To list all bad words",

            type: 1 // CHAT_INPUT

        },

        {

            name: "remove",

            description: "To remove a bad word by ID",

            type: 1, // CHAT_INPUT

            options: [

                {

                    name: 'id',

                    description: 'The ID of the word to remove',

                    required: true,

                    type: 3,

                    maxLength: 15

                }

            ]

        }

    ],

    cooldown: 15,

    run: async (client, interaction, args) => {

        let subCommand = interaction.options.getSubcommand();

        if (subCommand === "list") {

            if (!interaction.member.permissions.has("ADMINISTRATOR"))

                return interaction.reply({ content: "YOU DON'T HAVE ADMINISTRATOR", ephemeral: true });

            let data = await schema.find({ guildID: interaction.guild.id });

            if (data && data.length > 0) {

                let des = data.map((na) => {

                    return [

                        `**word :** ${na.word}`,

                        `**id :** \`${na.id}\``,

                        `**CreateAt :**<t:${Math.floor(na.at / 1000)}:R>`

                    ].join("\n");

                }).join("\n\n");

                let embed = new MessageEmbed()

                    .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))

                    .setDescription(`${des}`)

                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

                    .setColor("2F3136")

                    .setFooter(client.user.username, client.user.avatarURL());

                interaction.reply({ embeds: [embed] });

            } else {

                return interaction.reply({ content: "There are no bad words on this server", ephemeral: true });

            }

        }

        if (subCommand === "remove") {

            let id = interaction.options.getString("id");

            if (!interaction.member.permissions.has("ADMINISTRATOR"))

                return interaction.reply({ content: "YOU DON'T HAVE ADMINISTRATOR", ephemeral: true });

            let data = await schema.findOne({ guildID: interaction.guild.id, id: id });

            if (data) {

                await schema.findOneAndDelete({ guildID: interaction.guild.id, id: id });

                interaction.reply({ content: `☑️ | Done Deleted : \n Word : ${data.word} \n Added at: <t:${Math.floor(data.at / 1000)}:R>`, ephemeral: true });

            } else {

                interaction.reply({ content: "Invalid Reply Id!", ephemeral: true });

            }

        }

        if (subCommand === "add") {

            let word = interaction.options.getString("word");

            if (!interaction.member.permissions.has("ADMINISTRATOR"))

                return interaction.reply({ content: "YOU DON'T HAVE ADMINISTRATOR", ephemeral: true });

            // Generate numeric ID

            let id = generateNumericId(6); // Adjust the length as needed

            let data = await schema.findOne({ guildID: interaction.guild.id, word: word.toLowerCase() });

            if (!data) {

                let newData = {

                    guildID: interaction.guild.id,

                    word: word.toLowerCase(),

                    modreatorId: interaction.user.id,

                    at: Date.now(),

                    id: id,

                    badsok: "true"

                };

                await schema(newData).save();

                interaction.reply({ content: `☑️ | Done set:\nWord : \`${word}\`\nId : ${id}`, ephemeral: true });

            } else {

                interaction.reply({ content: "This word already exists", ephemeral: true });

            }

        }

    }

};