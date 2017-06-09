define(['activities/ShowScreenActivity',
   'activities/CallSubFlowActivity']
    ,
    function (showScreen,  CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'showAccount': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1015/CS1015_1"', },
                    next: 'showName'
                }),
                'CallSubFlowActivity1': wfjs.Activity({
                    activity: new CallSubFlowActivity(),
                    $inputs: { SubChartName: '"CS1015/CS1015_2"', },
                    $outputs: { '*': '*' },
                    next: 'showName'
                }),
                'showName': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS1015/CS1015_4"',
                        ShowType: '"normal"',//normal model
                         },
                    next: 'null'
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