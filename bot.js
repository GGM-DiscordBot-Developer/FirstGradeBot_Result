const fs = require('fs');
const Timetable = require('comcigan-parser');
const TimetableReader = require('./timetableReader');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({intents : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

var timetableEmbed = new EmbedBuilder()
.setColor(`#ff9696`)
.setTitle('**시간표** :calendar_spiral:')
.setFooter({text : 'Made by DevSeok & SEH00N'});

const nameFile = require('./teacherName.json');
const dayFile = require('./day.json');
const classFile = require('./class.json');

client.on('messageCreate', msg => {
    if(!msg.content.startsWith('!')) return;
    var date = new Date();

    const args = msg.content.split('!')[1].split(' ');
    console.log(args);
    switch(args[0])
    {
        case '시간표':
            if(args[1] == undefined || Object.keys(classFile).indexOf(args[1][0]) == -1)
            {
                msg.reply("올바른 학년을 입력해주세요.");
                return;
            }
            if(args[2] == undefined || classFile[args[1][0]][args[2][0]] == undefined)
            {
                msg.reply("올바른 학급을 입력해주세요.");
                return;
            }
            if(args[3] != undefined && dayFile[args[3]] == undefined)
            {
                msg.reply("올바른 요일을 입력해주세요.");
                return;
            }
            
            msg.channel.send({embeds : [GetTimetableEmbed(args, date)]});
            break;
        }
    });
    
client.login(require('../HappyBirthday/token.json').token);
    
const GetTimetableEmbed = (args, date) => {
    TimetableReader.GetComci();
    var file = require('./timetable.json');
    let field = '';

    const day = (args[3] == undefined ) ? date.getDay() - 1 : dayFile[args[3]];
    const today = Object.keys(dayFile)[day];
    if(day > 4) 
        field += `${today}은 주말입니다!`;
    else
        file[args[1][0]][args[2][0]][day].forEach((cell, index) => {
            if(cell['teacher'] == '') 
            {
                field += `${today} ${index + 1}교시 시간표가 없습니다.\n`;
                return;
            }
            if(nameFile[cell['teacher']] == undefined) console.log(cell['teacher']);
            
            field += `**${index + 1}**교시 ${nameFile[cell['teacher']]} 선생님 **${cell['subject']}**\n`;
        });

    timetableEmbed.setFields({name : `${args[1]} ${args[2]} ${today} 시간표`, value : field});

    return timetableEmbed;
};