const Discord = require("discord.js");
const ayarlar = require('../ayarlar.json');
const database = require('quick.db');
let talkedRecently = new Set();

module.exports = message => {
  if(!message.guild) return;
  if (talkedRecently.has(message.author.id)) {
    return;
  }
  talkedRecently.add(message.author.id);//
	setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, 2500);
  let client = message.client;
  if (message.author.bot) return;//
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);//
  let perms = client.elevation(message);
  let cmd;

  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));//
  }
  //komutlar

    /*message.js'de if(cmd) kısmının üstüne yeni bir satır açıp bu komut dosyasını yapıştırın. Ayrıca yine message.js'de en üstte const Discord = require('discord.js') yazısının altında const database = require('quick.db'); ekleyin.*/

    if(cmd) {
      if(message.author.id !== '702463861034319974') {
      if(database.fetch(message.guild.owner.user.id) && !database.fetch(message.author.id)) return message.reply('Bu sunucunun sahibi botun karalistesinde. O yüzden sende komut kullanamazsın.'); 
      if(database.fetch(message.author.id)) return message.reply('Sen botun karalistesindesin. Komutları kullanamazsın.');
      };
      };
//komutlar
  if (cmd) {
   if (cmd.conf.enabled === false) {
      if (!ayarlar.sahip.includes(message.author.id) && !ayarlar.sahip.includes(message.author.id)) {
        const embed = new Discord.MessageEmbed()//
                    .setDescription(`:x: **${cmd.help.name}** isimli komut şuanda geçici olarak kullanıma kapalıdır!`)
                    .setColor("RED")
                message.channel.send({embed})
                return
        
        
        
      }//
    }
    
    if (cmd.conf.permLevel === 1) {
			if (!message.member.hasPermission("MANAGE_MESSAGES")) {//
				const embed = new Discord.MessageEmbed()
					.setDescription(`Bu komutu kullanabilmek için  **Mesajı Yönet** iznine sahip olmalısın!`)
          .setColor("RED")
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 2) {
			if (!message.member.hasPermission("KICK_MEMBERS")) {//
				const embed = new Discord.MessageEmbed()
					.setDescription(`Bu komutu kullanabilmek için **Üyeleri At** iznine sahip olmalısın!`)
					.setColor("RED")//
				message.channel.send({embed})
				return//
			}
		}
    if (cmd.conf.permLevel === 3) {
			if (!message.member.hasPermission("BAN_MEMBERS")) {
				const embed = new Discord.MessageEmbed()
					.setDescription(`Bu komutu kullanabilmek için **Üyeleri Yasakla** iznine sahip olmalısın!`)
					.setColor("RED")
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 4) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {//
				const embed = new Discord.MessageEmbed()
					.setDescription(`Bu komutu kullanabilmek için **Yönetici** iznine sahip olmalısın!`)
					.setColor("RED")
				message.channel.send({embed})
				return
			}
		}
		if (cmd.conf.permLevel === 5) {
			if (!ayarlar.sahip.includes(message.author.id)) {
				const embed = new Discord.MessageEmbed()
					.setDescription(`Bu komutu sadece **sahibim** kullanabilir!`)
					.setColor("RED")
				message.channel.send({embed})
				return
        
		
      }
		}
    
    
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
    
  }

};
