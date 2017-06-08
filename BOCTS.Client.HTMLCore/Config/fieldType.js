﻿define([], function () {
    var c = {
        textMask: "rmb:",
        account: "",        //mask
        Alphanumeric: "",        //mask
        BancsNumber: "",        //mask
        BranchNo: "",        //mask
        CapitalCode: "",        //mask
        dynamicDate: {
            'china': {
                inputMask: {
                    type: 'date',
                    maskValue: 'yyyy年mm月dd日'
                },
            },
            'usa': {
                inputMast: 'mm-dd-ylyy',
                format: function (target) {

                }
            }

        },        //mask 99999999







        Digit: "",        //mask 正整数
        DigitChar: "",        //mask
        DigitPara: "",        //?
        DigitString: "",        //?
        EconomicCode: "",        //
        HalfChar: "",        //
        IntCurrency: "",        //
        NoTrim: "",        //
        Password: "",        //
        ProvinceCode: "",        //
        SDigit: "",        //
        SignedNumber: "",        //
        SwiftChar: "",        //
        SwiftFullChar: "",        //
        SwiftFullChar5: "",        //
        SystemDate: "",        //
        TIBNumber: "",        //
        Time: "",        //
        UnsignedNumber: "",        //
        XChar: "",        //
        YesNo: "",        //
        InstitutionNo: "",        //
        SwiftChar2: "",        //
        TimeUC: "",        //
        Regex_GUPP: "",        //
        CustName: "",        //
        Regex_Swift: "",        //
        Regex_Email: "",        //正则



    };
    return c;
});