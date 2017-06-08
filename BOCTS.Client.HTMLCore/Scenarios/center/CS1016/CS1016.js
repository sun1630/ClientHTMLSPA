define(['activities/ShowScreenActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/CallSubFlowActivity']
    ,
    function (showScreen, setDataAct, connectServer,  CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'show16_1': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1016/16_1"',
                        //PageTimeOut: 60,     //int型 设置页面超时时间
                        //DialogTimeOut: 10,   //int型 设置页面超时后对话框超时时间
                        //DialogMessage: '"$rm.global.message.timeOutTips()"',  //string型 设置页面超时后对话框显示信息
                        //ForPadMessage: '"$rm.global.message.mainViewTimeOut()"',  //string型 设置对话框超时后发Pad信息
                    },
                    next: ''
                }),
                'CallSubFlowActivity1': wfjs.Activity({
                    activity: new CallSubFlowActivity(),
                    $inputs: { SubChartName: '"CS1015/CS1015-2"', },
                    $outputs: { '*': '*' },
                    next: 'showName'
                }),
                'showName': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1015/CS1015_3"',
                        ShowType: '"normal"',//normal model
                        //PageTimeOut: 10,     //int型 设置页面超时时间
                        //DialogTimeOut: 10,   //int型 设置页面超时后对话框超时时间
                        //DialogMessage: '"$rm.global.message.timeOutTips()"',  //string型 设置页面超时后对话框显示信息
                        //ForPadMessage: '"$rm.global.message.mainViewTimeOut()"',  //string型 设置对话框超时后发Pad信息
                    },
                    next: 'null'
                }),
                
            }
        };
    });