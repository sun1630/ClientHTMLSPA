define(['activities/ShowScreenActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/CallSubFlowActivity']
    ,
    function (showScreen, setDataAct, connectServer,  CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'showAccount': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A01"',
                    },
                    next: 'showName'
                }),
                'showName': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A02"',
                        ShowType: '"normal"',//normal model
                    },
                    next: 'showResult'
                }),
                'showResult': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1012/CS1012_3"',
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
                        Page: '"Scenarios/center/CS1012/CS1012_4"',
                        ShowData: 'this.showData'
                    },
                    next: 'null'
                })
            }
        };
    });