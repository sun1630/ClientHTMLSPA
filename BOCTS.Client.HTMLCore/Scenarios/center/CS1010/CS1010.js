define(['activities/ShowScreenActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/CallSubFlowActivity']
    ,
    function (showScreen, setDataAct, connectServer, CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'showAccount': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1010/CS1010_1"'
                        //PageTimeOut: 60,     //int型 设置页面超时时间
                        //DialogTimeOut: 10,   //int型 设置页面超时后对话框超时时间
                        //DialogMessage: '"$rm.global.message.timeOutTips()"',  //string型 设置页面超时后对话框显示信息
                        //ForPadMessage: '"$rm.global.message.mainViewTimeOut()"',  //string型 设置对话框超时后发Pad信息
                    },
                    next: 'showtree'
                }),
                'showtree': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1010/CS1010_2"'
                    }
                })
         
            }
        };
    });