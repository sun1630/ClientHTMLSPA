define([], function () {
    var pars = {
        /* 
        省份/直辖市码表 
        type：类型，0为直辖市，1为省份
        code：地区编码
        text：地区名称
        */
        province: [
            { type: '0', code: '11', text: '北京' },
            { type: '0', code: '31', text: '上海' },
            { type: '0', code: '12', text: '天津' },
            { type: '0', code: '50', text: '重庆' },
            { type: '1', code: '34', text: '安徽省' },
            { type: '1', code: '35', text: '福建省' },
            { type: '1', code: '62', text: '甘肃省' },
            { type: '1', code: '44', text: '广东省' },
            { type: '1', code: '45', text: '广西壮族自治区' },
            { type: '1', code: '52', text: '贵州省' },
            { type: '1', code: '46', text: '海南省' },
            { type: '1', code: '13', text: '河北省' },
            { type: '1', code: '41', text: '河南省' },
            { type: '1', code: '23', text: '黑龙江省' },
            { type: '1', code: '42', text: '湖北省' },
            { type: '1', code: '43', text: '湖南省' },
            { type: '1', code: '22', text: '吉林省' },
            { type: '1', code: '32', text: '江苏省' },
            { type: '1', code: '36', text: '江西省' },
            { type: '1', code: '21', text: '辽宁省' },
            { type: '1', code: '15', text: '内蒙古自治区' },
            { type: '1', code: '64', text: '宁夏回族自治区' },
            { type: '1', code: '63', text: '青海省' },
            { type: '1', code: '37', text: '山东省' },
            { type: '1', code: '14', text: '山西省' },
            { type: '1', code: '61', text: '陕西省' },
            { type: '1', code: '51', text: '四川省' },
            { type: '1', code: '54', text: '西藏自治区' },
            { type: '1', code: '65', text: '新疆维吾尔自治区' },
            { type: '1', code: '53', text: '云南省' },
            { type: '1', code: '33', text: '浙江省' }
        ]
    }
    return pars;
});