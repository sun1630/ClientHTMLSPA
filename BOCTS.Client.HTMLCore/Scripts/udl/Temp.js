//[].forEach.call($$("*"), function (a) { a.style.outline = "1px solid #" + (~~(Math.random() * (1 << 24))).toString(16); });
//[].forEach.call($$('*'), function (element) { /* 在这里修改颜色 */ element.style.backgroundColor = "#" + (~~(Math.random() * (1 << 24))).toString(16); });

define(['activities/ShowScreenActivity'], function (ShowScreenActivity) {
    function getModel() {
        var defineclientworkflow1 = {
            $inputs: '*',
            $outputs: '*',
            steps: [],
            $global: { GoToPage: null },
            activities: {
                'ShowScreenActivity_00': wfjs.Activity({
                    activity: new ShowScreenActivity(),
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
                    next: 'Switch_00'
                })
                ,
                'Switch_00': wfjs.Switch({
                    switchExp: '',
                    cases: {
                        'CS9999_01': "ShowScreenActivity_01",
                        'CS9999_02': "ShowScreenActivity_02"
                    },
                    defaultCase: "Switch_00"
                })
                , 'ShowScreenActivity_01': wfjs.Activity({
                    activity: new ShowScreenActivity(),
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
                    activity: new ShowScreenActivity(),
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

            }
        };
        return defineclientworkflow1;
    }
    return getModel;
})