var fs = require('fs');
var db = require('../models')
var jwt = require("jsonwebtoken");
var md5 = require("blueimp-md5");
var makeDir = require('make-dir');
var path = require('path');

module.exports.createTopic = async (req, res, next) => {
    var {
        title,
        content,
        category,
        user_id
    } = req.body;

    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var dir_path = path.join(process.cwd(), 'uploads', 'md', `${year}`, `${month}`);
    try {
        var md_dir_path = await makeDir(dir_path);
        var timestamp = new Date().getTime();
        var md_path = path.join(md_dir_path, timestamp + `_${user_id}.md`);
        fs.writeFileSync(md_path, content);
        var sqlStr = `insert into topics (title, md_path, category, user_id, createdAt) values ('${title}','${md_path.replace(/\\/g,'&frasl;')}','${category}','${user_id}',${timestamp})`;
        var result = await db.query(sqlStr);
        return res.send({
            code: 200,
            msg: 'ok',
            data: ""
        })
    } catch (err) {
        console.log(err)
        fs.unlink(md_path, err => {
            return res.send({
                code: 400,
                msg: 'err',
                data: ''
            })
        })
    }

}