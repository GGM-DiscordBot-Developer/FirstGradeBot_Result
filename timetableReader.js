const Timetable = require('comcigan-parser');
const timetable = new Timetable();
const fs = require('fs');

const GetComci = () => {
  timetable.init().then(() => {
    console.log('init comp');
    timetable.search('경기게임').then(x => {
      console.log(x[0].code);
      timetable.setSchool(x[0].code);
      timetable.getTimetable().then(x => {
        fs.writeFileSync('./timetable.json', JSON.stringify(x));
      });
      timetable.getClassTime().then(x => {
        var timeData = {};
        x.forEach(string => {
          timeData[string[0]] = string.split('(')[1].replace(')', "");
        });
        fs.writeFileSync('./classTime.json', JSON.stringify(timeData));
      })
    });
  });
}

GetComci();

exports.GetComci = GetComci;