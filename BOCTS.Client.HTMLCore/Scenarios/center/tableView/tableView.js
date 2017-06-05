define(['activities/ShowScreenActivity', 'activities/DataMappingActivity', 'activities/ConnectServerActivity', 'activities/ReadIDCard']
    ,
    function (showScreen, setDataAct, connectServer, readIDCard) {
        return {
            $inputs: '*',
            $outputs:'*',
            activities: {
                'showExample': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/tableView/tableView_2"'
                    },
                    next: null
                })
            }
        };
    });