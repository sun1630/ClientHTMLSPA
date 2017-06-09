define(['activities/ShowScreenActivity', 'activities/MajpActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/CallSubFlowActivity']
    ,
    function (showScreen, majp, setDataAct, connectServer,  CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'Setp1': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A01"',
                    },
                    next: 'Setp2'
                }),
                'Setp2': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A02"',
                        ShowType: '"normal"',//normal model
                    },
                    next: 'Setp3'
                }),
                'Setp3': wfjs.Activity({
                    activity: new majp(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A02"'
                    },
                    next: 'Setp4'
                }),
                'Setp4': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/Majp/A03"'
                    },
                    next: 'null'
                })
            }
        };
    });