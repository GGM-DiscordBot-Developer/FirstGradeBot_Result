const TimetableReader = require('./timetableReader.js');
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, Partials } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]});

const nameFile = require('./teacherName.json');
const dayFile = require('./day.json');
const classFile = require('./class.json');
const subjectFile = require('./subject.json');
const timeFile = require('./classTime.json');
const iconURL = "https://cdn.discordapp.com/attachments/953627968222138389/1007704753205157978/ggmboticon.png";

var timetableEmbed = new EmbedBuilder()
    .setColor(`#ff9696`)
    .setFooter({ text: 'Made by DevSeok & SEH00N', iconURL: iconURL });

var helpEmbed = new EmbedBuilder()
    .setColor(`#24acf2`)
    .setTitle('**명령어** :calendar_spiral:')
    .setFields(
        { name: "!시간표", value: "시간표 명령어를 알려줍니다." },
        { name: "!시간표 [학년] [반]", value: "N학년 N반의 현재 교시 시간표와 다음 교시 시간표를 알려줍니다." },
        { name: "!시간표 [학년] [반] [요일]", value: "N학년 N반의 특정 요일 시간표를 알려줍니다." }
    )
    .setFooter({ text: 'Made by DevSeok & SEH00N', iconURL: iconURL });

client.on('ready', () => {
    client.user.setActivity({ name: '!시간표', type: ActivityType.Playing });
    console.log("Bot on");
});


client.on('messageCreate', (msg) => {
    if (!msg.content.startsWith('!')) return;

    // if(msg.content == "!삭제")
    // {
    //     console.log("삭제");
    //     msg.channel.messages.fetch().then(mss => {
    //         mss.forEach(item => {
    //             console.log(item.author.tag);
    //             if(item.author.tag == "겜마고 시간표#0242")
    //             {
    //                 console.log("delete comp");
    //                 console.log(item.id);
    //                 item.delete();
    //             }
    //         });
    //     })
    // }
    // return;
    var date = new Date();

    const args = msg.content.split('!')[1].split(' ');
    console.log(args);
    switch (args[0]) {
        case '살아나라':
            console.log(msg.author.tag);
            if(args[1] == '얍' && (msg.author.id == "박세훈#4860" || msg.author.tag == "곽석현#9999" || msg.author.tag == "평생소원이 플래티넘#4005"))
                msg.reply('살아났다 얍');
            break;
        case '시간표':
            if (args[1] == undefined) {
                msg.channel.send({ embeds: [helpEmbed] });
                return;
            }
            if (Object.keys(classFile).indexOf(args[1][0]) == -1) {
                msg.reply("올바른 학년을 입력해주세요.");
                return;
            }
            if (args[2] == undefined || classFile[args[1][0]][args[2][0]] == undefined) {
                msg.reply("올바른 학급을 입력해주세요.");
                return;
            }
            if (args[3] != undefined && dayFile[args[3]] == undefined) {
                msg.reply("올바른 요일을 입력해주세요.");
                return;
            }

            msg.channel.send({ embeds: [GetTimetableEmbed(args, date)] });
            timetableEmbed.data.fields = null;
            break;
    }
});

client.login(process.env.TOKEN);

/**
 * @param {string[]} args 
 * @param {Date} date 
 * @returns 
 */
const GetTimetableEmbed = (args, date) => {
    TimetableReader.GetComci();
    var file = require('./timetable.json');

    let day = (args[3] == undefined) ? date.getDay() - 1 : dayFile[args[3]];
    if (day == -1) day += 7;
    console.log(`today : ${day}`);
    const today = Object.keys(dayFile)[day];
    timetableEmbed.setTitle(`${args[1][0]}학년 ${args[2][0]}반 ${today} 시간표 :calendar_spiral:`);

    if (day > 4)
        timetableEmbed.setTitle(`${today}은 주말입니다!`);
    else if (args[3] == undefined) {
        const dateToMin = (date.getHours() * 60) + date.getMinutes();
        let period;


        for (let i = 1; i <= Object.keys(timeFile).length; i++) {
            if (dateToMin < (((Number)(timeFile[i].split(':')[0]) * 60) + (Number)(timeFile[i].split(':')[1]))) {
                period = i - 2;
                break;
            }
        }

        if (period != undefined && period != -1) {
            const cell = file[args[1][0]][args[2][0]][day][period];
            const nextCell = file[args[1][0]][args[2][0]][day][period + 1];
            timetableEmbed.setTitle(`${args[1][0]}학년 ${args[2][0]}반 현재 시간표 :calendar_spiral:`);
            if (cell['teacher'] == '') {
                timetableEmbed.addFields({
                    name: `현재 ${period + 1}교시`,
                    value: "수업이 없습니다."
                },
                {
                    name: `다음 ${period + 2}교시`,
                    value: "수업이 없습니다."
                });
                return timetableEmbed;
            }
            timetableEmbed.addFields({ name: `현재 ${period + 1}교시 ${subjectFile[cell.subject]}`, value: `${nameFile[cell.teacher]} 선생님` });
            if (period + 1 != 9 && subjectFile[nextCell.subject] != undefined)
                timetableEmbed.addFields({ name: `다음 ${period + 2}교시 ${subjectFile[nextCell.subject]}`, value: `${nameFile[nextCell.teacher]} 선생님` });
            else
                timetableEmbed.addFields({ name: `다음 교시`, value: "수업이 없습니다." });
        }
        else if (period == -1) {
            timetableEmbed.setTitle(`${args[1][0]}학년 ${args[2][0]}반 오늘 시간표 :calendar_spiral:`);
            setAllTimeTable(file, args, day);
        }
        else {
            if (day + 1 > 4)
                timetableEmbed.setTitle("내일은 주말입니다!");
            else {
                timetableEmbed.setTitle(`${args[1][0]}학년 ${args[2][0]}반 내일 시간표 :calendar_spiral:`);
                setAllTimeTable(file, args, day + 1);
            }
        }
    }
    else
        setAllTimeTable(file, args, day);

    return timetableEmbed;
};

const setAllTimeTable = (file, args, day) => {
    file[args[1][0]][args[2][0]][day].forEach((cell, index) => {
        if (cell['teacher'] == '') {
            timetableEmbed.addFields({
                name: `${index + 1}교시`,
                value: "수업이 없습니다."
            });
            return;
        }
        // 디버그 위해 수정됨.
        if (nameFile[cell['teacher']] == undefined) {
            console.log(cell['teacher']);
            timetableEmbed.addFields({
                name: `${index + 1}교시 ${subjectFile[cell['subject']]}`,
                value: `${cell['teacher']}* 선생님`
            });
        }
        else
            timetableEmbed.addFields({
                name: `${index + 1}교시 ${subjectFile[cell['subject']]}`,
                value: `${nameFile[cell['teacher']]} 선생님`
            });
    });
};