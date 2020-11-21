const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');

const AK = '1RboPKatE7pRx7QZhkaIbC-BSd8-aG8HZCp8UCMp';
const SK = 'EtNJonldCtifgAIK5JrHtJbMx-V388lMoG6UrQ5c';
const BUCKET = 'runkid-static';
const QNPath = 'scratch-gui/';
function uploadFile (filePath, fileName) {
    if (!filePath) {
        console.log('文件路径异常', filePath);
        return;
    }
    if (!fileName) {
        console.log('文件名称异常', fileName);
        return;
    }
    const mac = new qiniu.auth.digest.Mac(AK, SK);
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2;
    config.useHttpsDomain = true;
    config.useCdnDomain = true;
    const formUpload = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    if (!fs.existsSync(filePath)) {
        console.log(`文件${fileName}不存在`);
        return;
    }
    const middlePath = filePath.replace(`${path.resolve(__dirname, '../build') }/`, '');
    const key = `${QNPath}${middlePath}`;
    const uploadToken = new qiniu.rs.PutPolicy({scope: `${BUCKET}:${key}`}).uploadToken(mac);
    formUpload.putFile(uploadToken, key, filePath, putExtra, (err, res, resInfo) => {
        if (err) {
            throw err;
        }
        if (resInfo.statusCode === 200) {
            console.log(`${fileName}上传成功`);
        } else {
            console.log(`${fileName}上传失败`, resInfo.statusCode, resInfo.data);
        }
    });
}

// 如果需要刷新缓存的话
function refreshUrls (urls = []) {
    const mac = new qiniu.auth.digest.Mac(AK, SK);
    const cdnManager = new qiniu.cdn.cdnManager(mac);
    cdnManager.refreshUrls(urls, (err, res, resInfo) => {
        if (err) {
            throw err;
        }
        if (resInfo.statusCode !== 200) {
            console.log('刷新失败', resInfo.data);
        }
    });
}

const listFile = (dirPath) => {
    const dir = path.resolve(__dirname, dirPath || '../build');
    const arr = fs.readdirSync(dir);
    arr.map((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            listFile(filePath);
        } else {
            uploadFile(filePath, file);
        }
    });
};

function upload () {
    try {
        console.log('开始上传');
        listFile();
    } catch (error) {
        console.log('上传失败，请重试：', error);
    }
}

upload();
