// 秘钥
// 百度翻译
const appid = '20221219001502307'
const key = 'NGCed1L42z6L8ciJs0rM'
// 百度ocr
const AK_ocr = 'pwVtFCr7ep4KEmHkk6fQ1ru8'
const SK_ocr = '1HXTzFafdlqxbFZAzDXnw2l74UkgQsN0'
// 百度语音合成
const AK_speech = 'nwMr7BIjxnntZRwOIaGhXPGD'
const SK_speech = 'YtHTBY3gHd52q8jQnWIwsBsg9pcAkkRV'

/**
 * 翻译api支持语种
 */
const languages = [{ name: '中文', code: 'zh', alias: ['china', '中国', '新加坡', '汉语', '中', '简中'] }, { name: '英语', code: 'en', alias: ['english', '大不列颠共和国', '英国', '美国', '大不列颠', '日不落帝国', '日不落', '英'] }, { name: '粤语', code: 'yue', alias: ['广东', '粤', '机车'] }, { name: '文言文', code: 'wyw', alias: ['古汉语'] }, { name: '繁体中文', code: 'cht', alias: ['繁体', '台湾', '繁中', 'hk'] }, { name: '日语', code: 'jp', alias: ['日本', '樱花', '霓虹', '日'] }, { name: '韩语', code: 'kor', alias: ['韩国', '韩'] }, { name: '法语', code: 'fra', alias: ['法国', '法'] }, { name: '西班牙语', code: 'spa', alias: ['西班牙'] }, { name: '泰语', code: 'th', alias: ['泰国'] }, { name: '阿拉伯语', code: 'ara', alias: ['阿拉伯'] }, { name: '俄语', code: 'ru', alias: ['俄罗斯', '俄国', '俄', '苏联'] }, { name: '葡萄牙语', code: 'pt', alias: ['葡萄牙', 'tt', 't', 'T', 'TT'] }, { name: '德语', code: 'de', alias: ['德国', '德', '西海'] }, { name: '意大利语', code: 'it', alias: ['意大利', '意'] }, { name: '希腊语', code: 'el', alias: ['希腊'] }, { name: '荷兰语', code: 'nl', alias: ['荷兰', '中国豆'] }, { name: '波兰语', code: 'pl', alias: ['波兰', '闪击'] }, { name: '保加利亚语', code: 'bul', alias: ['保加利亚', '妖王'] }, { name: '爱沙尼亚语', code: 'est', alias: ['爱沙尼亚'] }, { name: '丹麦语', code: 'dan', alias: ['丹麦', 'mc'] }, { name: '芬兰语', code: 'fin', alias: ['芬兰'] }, { name: '捷克语', code: 'cs', alias: ['捷克'] }, { name: '罗马尼亚语', code: 'rom', alias: ['罗马尼亚'] }, { name: '斯洛文尼亚语', code: 'slo', alias: ['斯洛文尼亚'] }, { name: '瑞典语', code: 'swe', alias: ['瑞典'] }, { name: '匈牙利语', code: 'hu', alias: ['匈牙利'] }, { name: '越南语', code: 'vie', alias: ['越南'] }, { name: '自动', code: 'auto', alias: ['智能', 'a'] }]
/**
 * ocr api支持语种
 */
const OCRLanguages = [{ name: '自动检测', code: 'auto_detect', alias: ['', 'a', '自动', '智能', 'auto'] }, { name: '中英文混合', code: 'CHN_ENG', alias: ['混合', 'zhen'] }, { name: '英文', code: 'ENG', alias: ['en', '英', 'english', '大不列颠共和国', '英国', '美国', '大不列颠', '日不落帝国', '日不落'] }, { name: '日语', code: 'JAP', alias: ['jp', '日本', '樱花', '日'] }, { name: '韩语', code: 'KOR', alias: ['kor', '韩国', '韩'] }, { name: '法语', code: 'FRE', alias: ['fra', '法国', '法'] }, { name: '西班牙语', code: 'SPA', alias: ['西班牙'] }, { name: '葡萄牙语', code: 'POR', alias: ['pt', '葡萄牙'] }, { name: '德语', code: 'GER', alias: ['德国', '德'] }, { name: '意大利语', code: 'ITA', alias: ['意大利', '意'] }, { name: '俄语', code: 'RUS', alias: ['俄国', '俄'] }, { name: '丹麦语', code: 'DAN', alias: ['丹麦'] }, { name: '荷兰语', code: 'DUT', alias: ['荷兰'] }, { name: '马来语', code: 'MAL', alias: ['马来西亚'] }, { name: '瑞典语', code: 'SWE', alias: ['瑞典'] }, { name: '印尼语', code: 'IND', alias: ['印尼', '印度尼西亚'] }, { name: '波兰语', code: 'POL', alias: ['波兰', '闪击'] }, { name: '罗马尼亚语', code: 'ROM', alias: ['罗马尼亚'] }, { name: '土耳其语', code: 'TUR', alias: ['土耳其'] }, { name: '希腊语', code: 'GRE', alias: ['希腊'] }, { name: '匈牙利语', code: 'HUN', alias: ['匈牙利'] }, { name: '泰语', code: 'THA', alias: ['泰国'] }, { name: '越南语', code: 'VIE', alias: ['越南'] }, { name: '阿拉伯语', code: 'ARA', alias: ['阿拉伯'] }, { name: '印地语', code: 'HIN', alias: ['印地'] }]
/**
 * 错误码
 */
const errorCode = [{ code: '52001', meaning: '请求超时', resolvent: '请重试' }, { code: '52002', meaning: '系统错误', resolvent: '请重试' }, { code: '52003', meaning: '未授权用户', resolvent: '请检查appid是否正确或者服务是否开通' }, { code: '54000', meaning: '必填参数为空', resolvent: '请检查是否少传参数' }, { code: '54001', meaning: '签名错误', resolvent: '请检查您的签名生成方法' }, { code: '54003', meaning: '访问频率受限', resolvent: '请降低您的调用频率，或进行身份认证后切换为高级版/尊享版 ' }, { code: '54004', meaning: '账户余额不足', resolvent: '请前往管理控制台为账户充值' }, { code: '54005', meaning: '长文本请求频繁', resolvent: '请降低长文本的发送频率，3s后再试' }, { code: '58000', meaning: '客户端IP非法', resolvent: '检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改 ' }, { code: '58001', meaning: '译文语言方向不支持', resolvent: '检查译文语言是否在语言列表里' }, { code: '58002', meaning: '服务当前已关闭', resolvent: '请前往管理控制台开启服务' }, { code: '90107', meaning: '认证未通过或未生效', resolvent: '请前往我的认证查看认证进度' }]

// const tokens = [{ key: 'token_ocr', name: '百度ocr', code: 'ocr' }, { key: 'token_speech', name: '百度语音合成', code: 'speech' }]
const tokens = {
  ocr: {
    value: localStorage.getItem('token_ocr'),
    key: 'token_ocr',
    name: '百度ocr',
    ak: AK_ocr,
    sk: SK_ocr
  },
  speech: {
    value: localStorage.getItem('token_speech'),
    key: 'token_speech',
    name: '百度语音合成',
    ak: AK_speech,
    sk: SK_speech
  }
}
