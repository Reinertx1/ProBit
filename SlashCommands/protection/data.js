  const { MessageAttachment , version, Util, MessageActionRow, MessageButton, MessageEmbed, Collection, Client, Intents, Permissions, codeBlock } = require('discord.js');

module.exports = {

    name: "date",

    description: "To Display Transfer Date", 

    cooldown: 15,

    options: [

        {

            name: "time",

            description: "[month/day/year](09/1/2008) or [mont/day/year 10:00 (PM/AM)] anyone",

            type: 3,

          required: true

		},{

      name : "type", 

      description : "Choose Content Or Embed", 

      type : "STRING", 

      required : true, 

      choices : [{

name : "embed", 

        value : "embed"

},{

        name : "content", 

        value : "content"

}] 

  }],

run: async(client, interaction) => { 

  

    let time = interaction.options.getString("time");

        let status = interaction.options.getString('type')

if(time.startsWith('-') || time.startsWith('*') || time.startsWith('+') || time.startsWith('@') ||

time.startsWith('%') || 

time.startsWith('#') || time.startsWith('.')) return interaction.reply({content : `${time} is not a valid number.`, ephemeral:true})

if(time.endsWith('&') || time.endsWith('*') || time.endsWith('+') || time.endsWith('@') ||

time.endsWith('%') || 

time.endsWith('#') || time.endsWith('.')) return interaction.reply({content : `${time} is not a valid number.`, ephemeral:true})

  

       let ft = new Date(time).getTime() / 1000

  

let embed = new MessageEmbed()

  

.setTitle(`*Time:* __**${time}**__`)

.setDescription(`<t:${ft}:R>

  \`<t:${ft}:R>\`\n

  

<t:${ft}:d>

  \`<t:${ft}:d>\`\n

  

<t:${ft}:f>

  \`<t:${ft}:f>\`\n

  

<t:${ft}:t> 

  \`<t:${ft}:t>\`\n

  

<t:${ft}:F>

  \`<t:${ft}:F>\`\n

  

<t:${ft}:D>

  \`<t:${ft}:D>\`\n

  

<t:${ft}:T>

  \`<t:${ft}:T>\`\n `)

.setAuthor({iconURL: interaction.user.avatarURL({dynamic: true}) , name: interaction.user.tag})

  .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

  

.setColor("#2f3136")

const row = new MessageActionRow()

.addComponents(

new MessageButton()

.setLabel("COPY")

.setStyle("SECONDARY")

.setEmoji("©")

.setCustomId("copy")

  )

  client.on("interactionCreate", async (interaction) => {

    if(interaction.isButton()) {

        if(interaction.customId == "copy") {

          

            interaction.user.send({

                content: `*Time:* __**${time}**__

  <t:${ft}:R>

  \`<t:${ft}:R>\`\n

  

  <t:${ft}:d>

  \`<t:${ft}:d>\`\n

  

  <t:${ft}:f>

  \`<t:${ft}:f>\`\n

  

  <t:${ft}:t> 

  \`<t:${ft}:t>\`\n

  

  <t:${ft}:F>

  \`<t:${ft}:F>\`\n

  

  <t:${ft}:D>

  \`<t:${ft}:D>\`\n

  

  <t:${ft}:T>

  \`<t:${ft}:T>\`\n 

`}).catch(async (error) => {

    console.error(error)

    return interaction.reply({content: `🔴 | Error`, ephemeral: true});

            });

await interaction.reply({

  content: "☑️ | Done Sent Check Your Dm Please",

  ephemeral: true

})

        }}

  })

if(status == "embed") {

interaction.reply({embeds: [embed], components: [row]})

}else if(status == "content") {

interaction.reply({content: `*Time:* __**${time}**__

  <t:${ft}:R>

  \`<t:${ft}:R>\`\n

  

  <t:${ft}:d>

  \`<t:${ft}:d>\`\n

  

  <t:${ft}:f>

  \`<t:${ft}:f>\`\n

  

  <t:${ft}:t> 

  \`<t:${ft}:t>\`\n

  

  <t:${ft}:F>

  \`<t:${ft}:F>\`\n

  

  <t:${ft}:D>

  \`<t:${ft}:D>\`\n

  

  <t:${ft}:T>

  \`<t:${ft}:T>\`\n 

`, components: [row]})

}

      }

}