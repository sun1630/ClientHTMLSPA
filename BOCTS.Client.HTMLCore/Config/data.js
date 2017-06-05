define([], function () {
    return {
        //客户信息
        customer: {
            CustAge: ko.observable(''),//客户年龄
            CustNum: ko.observable(''),//客户号           
            CustName: ko.observable(''),//客户名            
            IDNum: ko.observable(''), //身份证号
            IDName: ko.observable(''), //身份证姓名
            IDStat: ko.observable('0'), //身份证审核状态,"1":已审核，"0"未审核
            IDExpiryDate: ko.observable(''), //证件有效期（结束）DD/MM/YYYY
            Birthday: ko.observable(''),//出生日期 DD/MM/YYYY 
            IDIssuingOrg: ko.observable(''),//签发机关
            CertAddress: ko.observable(''),//证件地址
            Ethnicity: ko.observable(''),//民族  
            EthnicityCode: ko.observable(''),//民族代码
            IDIssueDate: ko.observable(''),//证件有效期（开始） DD/MM/YYYY
            Gender: ko.observable(''),//性别  
            GenderCode: ko.observable(''),//性别代码
            CurtPicBiz: ko.observable(''),//现场照ID 
            RectPicBiz: ko.observable(''),//近照ID 
            IDPicBiz: ko.observable(''),// 身份证照片 
            IDCheckRlt: ko.observable(''),//审核结果 
            IDCheckRefuseReason: ko.observable(''),//审核拒绝的原因 
            BizConfirmRlt: ko.observable(''),
            BizConfirmRefuseReason: ko.observable(''),
            CurrentTaskId: ko.observable(''),
            Card: {
                CardType: ko.observable(''),          //卡类型
                CardNum: ko.observable(''),           //卡号
                CustName: ko.observable(''),          //客户姓名
                CustNum: ko.observable(''),           //客户号
                IDType: ko.observable(''),            //开户证件类型
                IDNum: ko.observable(''),             //开户证件号码
                ATMPOSAccnt: ko.observable(''),       //ATM POS主账号
                IssuingBranch: ko.observable(''),     //发卡行
                ProvinceBranchNum: ko.observable(''), //省行机构号
                SubAccntType: ko.observable(''),      //子账户类型
                CardProductCode: ko.observable(''),   //卡产品码
                ProductType: ko.observable(''),       //借记卡产品类型
                LinkAccntType: ko.observable(''),     //关联帐户类型
                CardBin: ko.observable(''),           //卡BIN
                CardBinIndex: ko.observable(''),      //卡BIN索引号
                CardBinType: ko.observable(''),       //卡BIN类型 "0"本行信用卡 "1"本行借记卡 "2"他行卡
                Track2: ko.observable(''),            //卡二磁信息
                PBOCData: ko.observable(''),          //芯片信息
                CellphoneNum: ko.observable(''),      //客户手机号
                CardState: ko.observable('0'),         //卡状态，"1"已验证/"0"未验证
                PwdState: ko.observable('0'),          //密码状态，"1"已校验/"0"未校验
            }
        },

        //柜员信息
        teller: {
            TellerNo: ko.observable('9881900'),//柜员号
            Name: ko.observable('智能柜台'),    //柜员姓名
            Level: ko.observable(''),   //柜员级别
        }
    };
});