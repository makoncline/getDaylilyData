import slugify from './slugify.js';
import parse from 'csv-parse';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import j2c from 'json2csv';

export default getDaylilyData;

function getDaylilyData(userData, ahsData, callback){
  let db = new sqlite3.Database(':memory:');
  db.serialize(()=>{
    db.run('CREATE TABLE ahs(url, id, cultivar, image, hybridizer, year, parentage, color, branches, budcount, form, foliagetype, seedlingnum, bloomhabit, fragrance, scapeheight, bloomseason, rebloom, bloomsize, ploidy, sculpting, slug)')
    .run('CREATE TABLE user(cultivar, price, note, slug)');
  });


  fs.readFile(ahsData, function (err, fileData) {
    parse(fileData, {columns: true, trim: true}, function(err, rows) {
      let ahs = rows;
      for (let i = 0; i < ahs.length; i++){
        ahs[i].slug = slugify(ahs[i].cultivar);
        let sql = 'INSERT INTO ahs(' + Object.keys(ahs[0]).join(', ') + ') VALUES("' + Object.values(ahs[i]).map(x=>x.replace(/"/g, '\'')).join('","') + '")';

        db.run(sql,[], (err, res)=>{
          if (err) console.log(ahs[i]);
        });
      }

      // db.all('SELECT * FROM ahs', [], (err,res) => {
      //   console.log(res);
      // });

      fs.readFile(userData, function (err, fileData) {
        parse(fileData, {columns: true, trim: true}, function(err, rows) {
          let user = rows;
          for (let i = 0; i < user.length; i++){
            user[i].slug = slugify(user[i].cultivar);
            let sql = 'INSERT INTO user(' + Object.keys(user[0]).join(', ') + ') VALUES("' + Object.values(user[i]).map(x=>x.replace(/"/g, '\'')).join('","') + '")';
      
            db.run(sql,[], (err, res)=>{
              if (err) console.log(err);
            });
          }
          // db.all('SELECT * FROM user', [], (err,res) => {
          //   console.log(res);
          // });

          let sql = 'SELECT user.cultivar, user.slug, user.price, user.note, ahs.id, ahs.url, ahs.image, ahs.hybridizer, ahs.year, ahs.color, ahs.parentage, ahs.ploidy, ahs.bloomseason, ahs.budcount, ahs.branches, ahs.form, ahs.bloomsize, ahs.bloomhabit, ahs.seedlingnum, ahs.foliagetype, ahs.scapeheight, ahs.fragrance, ahs.sculpting, ahs.rebloom FROM user LEFT JOIN ahs ON user.slug = ahs.slug';
          db.all(sql,[],(err,res)=>{
            if (err) console.log(err);
            //console.log(res);
            const csv = j2c.parse(res);
            //console.log(csv);
            callback(csv);
          });
        });
      });
    });
  });
}
