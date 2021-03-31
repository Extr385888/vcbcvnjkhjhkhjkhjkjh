const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');

const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + "matador");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);

//---------------------------------KOMUTLAR---------------------------------\\



//everyone here engel

client.on("message", async msg => {
  let hereengelle = await db.fetch(`hereengel_${msg.guild.id}`);
  if (hereengelle == "acik") {
    const here = ["@here", "@everyone"];
    if (here.some(word => msg.content.toLowerCase().includes(word))) {
      if (!msg.member.hasPermission("ADMINISTRATOR")) {
        msg.delete();
        msg.channel
          .send(`<@${msg.author.id}>`)
          .then(message => message.delete());
        var e = new Discord.MessageEmbed()
          .setColor("BLACK")
          .setDescription(`Bu Sunucuda Everyone ve Here Yasak!`);
        msg.channel.send(e);
      }
    }
  } else if (hereengelle == "kapali") {
  }
});

//prefix

client.on("message", async message => {

  if (message.author.bot) return;

  if (!message.guild) return;

  let prefix = db.get(`prefix_${message.guild.id}`);

  if (prefix === null) prefix = prefix;



  if (!message.content.startsWith(prefix)) return;



  if (!message.member)

    message.member = await message.guild.members.fetch(message);
//


  const args = message.content

    .slice(prefix.length)

    .trim()

    .split(/ +/g);

  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;
  
  let command = client.commands.get(cmd);

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) command.run(client, message, args);

});

//mesaj log

client.on("messageDelete", async message => {
  let mslog = await db.fetch(`mslog_${message.guild.id}`);
  if (!mslog) return;
  const entry = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first());
  let embed = new Discord.MessageEmbed()
  .setTitle("Mesaj Silme")
  .addField("**Mesajın Sahibi**", `<@${message.author.id}> **|** \`${message.author.id}\``)
  .addField("**Mesaj**", `${message.content}`)
  .setTimestamp()
  .setColor("RED")
  client.channels.cache.get(mslog).send(embed)
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  let mslog = await db.fetch(`mslog_${oldMessage.guild.id}`);
  if (!mslog) return;
  const embed = new Discord.MessageEmbed()
  .setTitle("Mesaj Düzenleme")
  .addField("**Mesajın Sahibi**", `<@${oldMessage.author.id}> | **${oldMessage.author.id}**`)
  .addField("**Eski Mesajı**", `${oldMessage.content}`)
  .addField("**Yeni Mesajı**", `${newMessage.content}`)
  .setTimestamp()
  .setColor("RED")
  client.channels.cache.get(mslog).send(embed)
});





//Eklendim-Atıldım/
client.on('guildDelete', guild => {

let embed = new Discord.MessageEmbed()

.setColor("RED")
.setTitle(" Bot Kickledi ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('784852732380708864').send(embed);

});


client.on('guildCreate', guild => {

let embed = new Discord.MessageEmbed()

.setColor("GREEN")
.setTitle(" Bot Eklendi ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('784852732380708864').send(embed);

}); 



//snipe 

client.on('messageDelete', message => {
  const emirhan = require("quick.db")
  emirhan.set(`snipe.mesaj.${message.guild.id}`, message.content)
  emirhan.set(`snipe.id.${message.guild.id}`, message.author.id)

})


//afk
client.on("message" , async msg => {
  
  if(!msg.guild) return;
  if(msg.content.startsWith(ayarlar.prefix+"afk")) return; 
  
  let afk = msg.mentions.users.first()
  
  const kisi = db.fetch(`afkid_${msg.author.id}_${msg.guild.id}`)
  
  const isim = db.fetch(`afkAd_${msg.author.id}_${msg.guild.id}`)
 if(afk){
   const sebep = db.fetch(`afkSebep_${afk.id}_${msg.guild.id}`)
   const kisi3 = db.fetch(`afkid_${afk.id}_${msg.guild.id}`)
   if(msg.content.includes(kisi3)){

       msg.reply(`Etiketlediğiniz Kişi Afk \nSebep : ${sebep}`)
   }
 }
  if(msg.author.id === kisi){

       msg.reply(`Afk'lıktan Çıktınız`)
   db.delete(`afkSebep_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkid_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkAd_${msg.author.id}_${msg.guild.id}`)
    msg.member.setNickname(isim)
    
  }
  
});


/////////

process.on('unhandledRejection', error => {
    console.error('API Hatası:', error);
  });


  client.on('error', error => {
    console.error('WebSocket bir hatayla karşılaştı:', error);
});  

//normal kodlar

client.on('message', msg => {
  if (msg.content.toLowerCase() === '!normal') {  // İstediğiniz Komut
    msg.member.roles.add('784748070264504361'); //Rolü bir yerde bahsedin sonra sağ tıklayıp İD'sini alın
    msg.reply('Normal Kodlar Rolünü Başarıyla Aldın.'); //Komutu Yazınca cevap ne yazsın?
  }
});

//member

client.on('message', msg => {
  if (msg.content.toLowerCase() === '!member') {  // İstediğiniz Komut
    msg.member.roles.add('722547179067015219'); //Rolü bir yerde bahsedin sonra sağ tıklayıp İD'sini alın
    msg.reply('Member Rolünü Başarıyla Aldın.'); //Komutu Yazınca cevap ne yazsın?
  }
});

//bildirim
client.on('message', msg => {
  if (msg.content.toLowerCase() === '!bildirim') {  // İstediğiniz Komut
    msg.member.roles.add('780124038755778590'); //Rolü bir yerde bahsedin sonra sağ tıklayıp İD'sini alın
    msg.reply('Bildirim Rolünü Başarıyla Aldın.'); //Komutu Yazınca cevap ne yazsın?
  }
});

// sunucu bildirim
client.on('message', msg => {
  if (msg.content.toLowerCase() === '!sunucubildirim') {  // İstediğiniz Komut
    msg.member.roles.add('814220358868664320'); //Rolü bir yerde bahsedin sonra sağ tıklayıp İD'sini alın
    msg.reply('Sunucu Bildirim Rolünü Başarıyla Aldın.'); //Komutu Yazınca cevap ne yazsın?
  }
});

//caps lock engel
function percentage(partialValue, totalValue) {
   return (100 * partialValue) / totalValue;
} 

client.on('message', async(message) => {
if (!message.guild) return
let acikmi = await db.fetch(`${message.guild.id}.capsengel`)
if (!acikmi) return
if (message.author.bot) return
if (message.member.hasPermission("MANAGE_MESSAGES")) return
let matched = message.content.replace(/[^A-Z]/g, "").length
let yuzde = percentage(matched, message.content.length)
if (Math.round(yuzde) > acikmi.yuzde) {
  message.delete()
  message.author.send(new Discord.MessageEmbed().setColor("RED").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("CapsLock Engelleme Sistemi").setDescription("**Uyarı! "+message.guild.name+" sunucusunda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi."))
  message.channel.send(new Discord.MessageEmbed().setColor("RED").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("CapsLock Engelleme Sistemi",message.author.displayAvatarURL({dynamic:true})).setDescription(message.author.username+" - "+(message.member.nickname ? `${message.member.nickname} - ${message.author.id}` : message.author.id)+"\n**Uyarı!  Bu sunucuda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi.")).then(msg=>msg.delete({timeout:3000}))
}else{return}
})

  // İsim Reklam Koruma
  // İsim Reklam Koruma
  client.on('guildMemberAdd', youthanasia => {
    if (db.has(`isimreklamkoruma.${youthanasia.guild.id}`) && youthanasia.user.username.toLowerCase().replace(/ /g, '').includes('discord.gg')) {
      youthanasia.send('İsminde reklam içerikli bir şey olabileceğinden dolayı seni yasakladım.').catch(err => console.warn('Bir kişiyi reklam içerikli isimden banladım ancak o kişiye mesaj yollayamadım.'));
      youthanasia.ban({ reason: 'Reklam içerikli kullanıcı adı.' });
    };
  });

  client.on('guildMemberUpdate', (rifleman, youthanasia) => {
    if (db.has(`isimreklamkoruma.${youthanasia.guild.id}`) && youthanasia.displayName.toLowerCase().replace(/ /g, '').includes('discord.gg')) {
      youthanasia.send('İsminde reklam içerikli bir şey olabileceğinden dolayı seni yasakladım.').catch(err => console.warn('Bir kişiyi reklam içerikli isimden banladım ancak o kişiye mesaj yollayamadım.'));
      youthanasia.ban({ reason: 'Reklam içerikli kullanıcı adı.' });
    };
  });
  


//saas
client.on('message', async msg => {
  if (msg.author.bot) return;
  const i = await db.fetch(`saas_${msg.guild.id}`);
  if (!i) return;
   if (msg.content.toLowerCase() === 'selam') {
    if (msg.author.bot) return;  

        if (!msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")) {
            msg.reply('**Aleyküm Selam**'); 
        } else {
        msg.reply('**Aleyküm Selam :)**');
        }      
    
    }

  if (msg.content.toLowerCase() === 'sa') {
    if (msg.author.bot) return;  

        if (!msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")) {
            msg.reply('**Aleyküm Selam**'); 
        } else {
        msg.reply('**Aleyküm Selam :)**');
        }      

    }

  if (msg.content.toLowerCase() === 'sea') {
    if (msg.author.bot) return;  

        if (!msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")) {
            msg.reply('**Aleyküm Selam**'); 
        } else {
        msg.reply('**Aleyküm Selam :)**');
        }      
    }


  if (msg.content.toLowerCase() === 'selamün aleyküm') {
    if (msg.author.bot) return;  

        if (!msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")) {
            msg.reply('**Aleyküm Selam**'); 
        } else {
        msg.reply('**Aleyküm Selam :)**');
        }      
    
    }
});

//ready
client.on('ready', () => {
  let kontrol = db.fetch(`reboot`)   
  if(kontrol == "ack") { 
  client.user.setActivity("rebooting...")
  db.set(`reboot`, "kapalı")
} 
if(kontrol == "kapalı") { 
    client.user.setActivity(`${client.guilds.cache.size} Sunucu ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Kullanıcı`);
}
})

//mute
////DATABASE
const qdb = require('quick.db');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const sunucuadapter = new FileSync('./database/systems.json')

const sdb = low(sunucuadapter)

  sdb.defaults({mute: [], ban: [], kufurEngel: [], autorole: [], reklamEngel: [], security: [], counter: []})
  .write()

  sdb.read()
  
////////DATABASE-UPDATER
/*
client.on("message", async msg => {
  if(!msg.guild) return;
  
  db.add(`mesajsayi_${msg.author.id}`, 1);
});
*/
setInterval(function(){  
  sdb.read()
 },1000);


 client.on('ready', async () => {
  client.guilds.cache.forEach(async guild => {
  guild.members.cache.forEach(async member => {
  
    sdb.read()
    var muteverisi = sdb.get('mute').find({guild: guild.id, user: member.id}).value()
  
    if(muteverisi) {
      var mutebitiszamani = muteverisi.finishtime
      var mutekanali = muteverisi.channel
    } else {
      var mutebitiszamani = null;
      var mutekanali = null;
    }
  const ainterval = setInterval(async function(){
    sdb.read()
  if(mutebitiszamani && mutebitiszamani !== null && mutebitiszamani !== "INFINITY") {
    if(mutebitiszamani <= Date.now()) {
      clearInterval(ainterval)
      var muterole1 = qdb.fetch(`muteroluid_${guild.id}`);
      var muterole2 = guild.roles.cache.find(r => r.id === muterole1);
      if(member.roles.cache.has(muterole2.id)) await member.roles.remove(muterole2.id);
      var mutekanali2 = guild.channels.cache.find(c => c.id === mutekanali);
      if(mutekanali2) mutekanali2.send(`${member} Susturulması Açıldı!`)
      sdb.get('mute').remove(sdb.get('mute').find({guild: guild.id, user: member.id}).value()).write()   
    }
  }
  }, 6000)
      })
    })
  });
  
  
  