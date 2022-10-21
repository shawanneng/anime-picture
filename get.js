const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM(
  `<!DOCTYPE html><html><head></head><body>hello</body></html>`
);

//转base64
function getBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

//获取随机图片
async function getFileLink(count) {
  const { data } = await axios({
    url: 'http://aimg2.njkuotai.com/app/api/getComicInfoRandom',
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'cache-control': 'no-cache',
      'content-type': 'application/json;charset-UTF-8',
      pragma: 'no-cache',
    },
    method: 'post',
    data: `{"limit":${count}}`,
  });

  const { result } = data;
  return result.map((x) => ({
    id: x.id,
    title: x.introduction,
    url: x.imgUrl,
  }));
}

//渲染图片
async function readDataOfImg(fileUrl) {
  let link = fileUrl.replace('jpg', 'data').replace('png', 'data');
  const { data } = await axios({
    url: `http://aimg2.njkuotai.com/app/api/upload/getData/${link}`,
    responseType: 'arraybuffer',
  });

  let e = new Uint8Array(data),
    o = new window.Blob([e.subarray(2, e.length)], {
      type: 'image/jpg',
    });
  const ress = await getBase64(o);
  return ress;
}

async function render(count) {
  if (!Number.isFinite(+count)) {
    return {
      code: -1,
      msg: 'count为随机图片数量,默认不传为6张,请传int类型',
    };
  }

  if (+count > 50) {
    return {
      code: -1,
      msg: '一次最大随机图片数量为50张,请调整数量后重新获取',
    };
  }
  const list = await getFileLink(+count);
  for (let i = 0; i < list.length; i++) {
    const base64 = await readDataOfImg(list[i].url);
    list[i].url = base64;
  }
  return list;
}

module.exports = render;
