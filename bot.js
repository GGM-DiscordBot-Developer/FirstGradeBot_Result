const TimetableReader = require('./timetableReader');
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const client = new Client({intents : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

const nameFile = require('./teacherName.json');
const dayFile = require('./day.json');
const classFile = require('./class.json');
const iconURL = "https://cdn.discordapp.com/attachments/953627968222138389/1007704753205157978/ggmboticon.png";

var timetableEmbed = new EmbedBuilder()
.setColor(`#ff9696`)
.setTitle('**시간표** :calendar_spiral:')
.setFooter({text : 'Made by DevSeok & SEH00N', iconURL : iconURL});

var helpEmbed = new EmbedBuilder()
.setColor(`#24acf2`)
.setTitle('**명령어** :calendar_spiral:')
.setFields(
    { name : "!시간표", value : "시간표 명령어를 알려줍니다." },
    { name : "!시간표 [학년] [반] or !시간표 N학년 N반", value : "N학년 N반의 당일 시간표를 알려줍니다." },
    { name : "!시간표 [학년] [반] [요일] or !시간표 N학년 N반 N요일", value : "N학년 N반의 특정 요일 시간표를 알려줍니다." }
)
.setFooter({text : 'Made by DevSeok & SEH00N', iconURL : iconURL});

client.on('ready', () => {
    client.user.setActivity({name : '!시간표', type : ActivityType.Playing});
});

client.on('messageCreate', msg => {
    if(!msg.content.startsWith('!')) return;
    var date = new Date();

    const args = msg.content.split('!')[1].split(' ');
    console.log(args);
    switch(args[0])
    {
        case '시간표':
            if(args[1] == undefined)
            {
                msg.channel.send({embeds : [helpEmbed]});
                return;
            }
            if(Object.keys(classFile).indexOf(args[1][0]) == -1)
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
    
client.login(require('../tokens.json').GGMBot);
    
const GetTimetableEmbed = (args, date) => {
    TimetableReader.GetComci();
    var file = require('./timetable.json');
    let field = '';

    let day = (args[3] == undefined ) ? date.getDay() - 1 : dayFile[args[3]];
    if(day == -1) day += 7; 
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
            // 디버그 위해 수정됨.
            if(nameFile[cell['teacher']] == undefined) 
            {
                console.log(cell['teacher']);
                field += `**${index + 1}**교시 ${cell['teacher']}* 선생님 **${cell['subject']}**\n`;
            }
            else
            field += `**${index + 1}**교시 ${nameFile[cell['teacher']]} 선생님 **${cell['subject']}**\n`;
        });

    timetableEmbed.setFields({name : `${args[1][0]}학년 ${args[2][0]}반 ${today} 시간표`, value : field});

    return timetableEmbed;
};