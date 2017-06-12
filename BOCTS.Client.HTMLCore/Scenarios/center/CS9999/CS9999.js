define(['activities/ShowScreenActivity',
   'activities/CallSubFlowActivity']
    ,
    function (showScreen, CallSubFlowActivity) {
        return {
            $inputs: '*',
            $outputs: '*',
            $global: { sendData: null, showData: null },
            activities: {
                'showNav': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS9999/CS9999_0"',
                    },
                    next: 'showNav2'
                }),
                'showNav2': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: '"Scenarios/center/CS9999/CS9999_1"',
                    },
                    next: 'Switch_00'
                }),
                //============================================
                'Switch_00': wfjs.Switch({
                    switchExp: '',
                    cases: {
                        'CS9999_01': "ShowScreenActivity_01",
                        'CS9999_02': "ShowScreenActivity_02"
                    },
                    defaultCase: "Switch_00"
                }),
                //===============================================






                //'CallSubFlowActivity1': wfjs.Activity({
                //    activity: new CallSubFlowActivity(),
                //    $inputs: { SubChartName: '"CS1015/CS1015_2"', },
                //    $outputs: { '*': '*' },
                //    next: 'showName'
                //}),
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



                //===================================

                 , 'ShowScreenActivity_01': wfjs.Activity({
                     activity: new showScreen(),
                     $inputs: {
                         Page: null,
                         Area: null,
                         ViewState: null,
                         ShowType: null,
                         ShowData: null,
                         Title: null,
                         IsSync: null,
                     },
                     $outputs: { Result: null, },
                     next: 'ShowScreenActivity_00'
                 })
                , 'ShowScreenActivity_02': wfjs.Activity({
                    activity: new showScreen(),
                    $inputs: {
                        Page: null,
                        Area: null,
                        ViewState: null,
                        ShowType: null,
                        ShowData: null,
                        Title: null,
                        IsSync: null,
                    },
                    $outputs: { Result: null, },
                    next: 'ShowScreenActivity_00'
                })
                //=========================================================

            }
        };
    });