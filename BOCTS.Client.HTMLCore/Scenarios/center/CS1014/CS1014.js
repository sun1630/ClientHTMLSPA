define(['activities/ShowScreenActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/CallSubFlowActivity']
    ,
    function (showScreen, setDataAct, connectServer,  CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                //'readIDCard': wfjs.Activity({
                //    activity: new readIDCard(),
                //    $inputs: {
                //    },
                //    next: 'showAccount'
                //}),
                'showAccount': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1014/CS1012_1"',
                        //PageTimeOut: 60,     //int型 设置页面超时时间
                        //DialogTimeOut: 10,   //int型 设置页面超时后对话框超时时间
                        //DialogMessage: '"$rm.global.message.timeOutTips()"',  //string型 设置页面超时后对话框显示信息
                        //ForPadMessage: '"$rm.global.message.mainViewTimeOut()"',  //string型 设置对话框超时后发Pad信息
                    },
                    next: 'showName'
                }),
                'CallSubFlowActivity1': wfjs.Activity({
                    activity: new CallSubFlowActivity(),
                    $inputs: { SubChartName: '"CS1012/CS1012-11"', },
                    $outputs: { '*': '*' },
                    next: 'showName'
                }),
                'showName': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1014/CS1012_2"',
                        ShowType: '"normal"',//normal model
                        //PageTimeOut: 10,     //int型 设置页面超时时间
                        //DialogTimeOut: 10,   //int型 设置页面超时后对话框超时时间
                        //DialogMessage: '"$rm.global.message.timeOutTips()"',  //string型 设置页面超时后对话框显示信息
                        //ForPadMessage: '"$rm.global.message.mainViewTimeOut()"',  //string型 设置对话框超时后发Pad信息
                    },
                    next: 'showResult'
                }),
                //'setdata': wfjs.Activity({
                //    activity: new setDataAct(),
                //    $inputs: {
                //        Mapping: [
                //            { source: "account", target: "acc" },
                //            { source: "password", target: "pwd" },
                //            { source: "name", target: "name" },
                //            { source: "birthday", target: "birthday" }
                //        ]
                //    },
                //    $outputs: { 'Result': 'sendData' },
                //    next: 'setdata2'
                //}),
                //'setdata2': wfjs.Activity({
                //    activity: new setDataAct(),
                //    $inputs: {
                //        Source: '"$dm"',
                //        Target: 'this.sendData',
                //        Mapping: [
                //            { source: "account", target: "acc2" },
                //            { source: "password", target: "pwd2" },
                //            { source: "name", target: "name2" },
                //            { source: "birthday", target: "birthday2" }
                //        ]
                //    },
                //    $outputs: { 'Result': 'sendData' },
                //    next: 'connectServer'
                //}),
                //'connectServer': wfjs.Activity({
                //    activity: new connectServer(),
                //    $inputs: {
                //        Server: '"wf"',
                //        Url: '"wf/request"',
                //        Pars: { 'wf': 'CT1010' },
                //        SendData: 'this.sendData'
                //    },
                //    $outputs: { 'Result': 'showData' },
                //    next: 'showResult'
                //}),
                'showResult': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1014/CS1012_3"',
                        ShowData: 'this.showData'
                    },
                    $outputs: {
                        Result: 'showData'
                    },
                    next: 'Showfourth'
                }),
                'Showfourth': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1014/CS1012_4"',
                        ShowData: 'this.showData'
                    },
                    next: 'null'
                }),
                //'ErrorEndFlow': wfjs.Activity({
                //    activity: new TradeSucceedActivity(),
                //    next: null
                //})
                //'ErrorEndFlow': wfjs.Activity({
                //    activity: new EndActivity(),
                //    $inputs: { IsGoHome: true, HomePage: '"Shells/Counter/mainView"', },
                //    $outputs: {},
                //    next: null
                //})
            }
        };
    });