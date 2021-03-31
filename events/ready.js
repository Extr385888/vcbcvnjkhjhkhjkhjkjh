const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const { readdirSync } = require("fs");
const fs = require("fs");
const ascii = require("ascii-table");
const db = require("quick.db")
let kanal = db.fetch(`rebootkanal`)
let kontrol = db.fetch(`reboot`) 
var prefix = ayarlar.prefix;
module.exports = client => {
  
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Aktif, Komutlar yüklendi!`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: ${client.user.username} ismi ile giriş yapıldı!`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Toplam kullanıcı ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`);
  client.user.setStatus("idle");
   var oyun = [
        "!help",
        `Bot ${client.guilds.cache.size} Sunucu Ve ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Kullanıcıya Hizmet Veriyor`,
    ];
    setInterval(function() {
        var random = Math.floor(Math.random()*(oyun.length-0+1)+0);
        client.user.setActivity(oyun[random], "https://rapp");
        }, 15000);
    client.channels.cache.get(kanal).send("Yeniden Başlatma işlemi tamamlandı")  
}