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
    });
  });
}

exports.GetComci = GetComci;