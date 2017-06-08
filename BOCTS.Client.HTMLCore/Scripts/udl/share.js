define(['udl/vmProvider'], function (vmp) {

    //var model = new vmp({
    //    data: {
    //        system: {
    //            value: {},
    //            metadata: {
    //                needObserve: true,
    //            }
    //        },
    //        teller: { 
    //            value: {},
    //            metadata: {
    //                needObserve: true,
    //            }
    //        },
    //        trans: {

    //        }
    //    }
    //});

    //return model;

    return {
        trans: {}
    }


    //return {
    //    System: {
    //        BranchNo: ko.observable('B0001').extend({ required: 'this is required', readonly: true }),
    //        BranchName: ko.observable('北京分行').extend({ required: 'this is required' }),
    //    },
    //    Teller: {
    //        TellerNo: ko.observable('T0001').extend({ required: 'this is required', readonly: true }),
    //        TellerName: ko.observable('Tel-张三').extend({ required: 'this is required' }),
    //    },
    //    Transaction: {
    //        customerName: ko.observable().extend({ required: 'this is required', readonly: true }),
    //        amount: ko.observable().extend({ required: 'this is required' })
    //    }
    //}
});