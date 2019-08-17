import parse from 'csv-parse';
import fs from 'fs';
import j2c from 'json2csv';

export default getDaylilyData;

function getDaylilyData(ahsData, callback){
  fs.readFile(ahsData, function (err, fileData) {
    parse(fileData, {columns: true, trim: true}, function(err, rows) {
      let output = [];
      for (let i = 0; i < rows.length; i++){
        let row = rows[i];
        let data = {
          id:row.id, 
          name:row.cultivar, 
          image:row.image === 'https://www.daylilies.org/DaylilyDB/None' ? '' : row.image, 
          hybridizer:row.hybridizer, 
          year:row.year
        };
        output.push(data);
      }
      const csv = j2c.parse(output);
      fs.writeFile('searchAhs.csv', csv, (err)=>{
        if (err) console.log;
      });
    });
  });
}

getDaylilyData('ahs.csv');