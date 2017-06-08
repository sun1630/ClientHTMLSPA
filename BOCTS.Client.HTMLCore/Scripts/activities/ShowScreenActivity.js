define(['jsRuntime/viewManager', 'jsRuntime/utility', 'jsRuntime/resourceManager'], function (vm, utility, rm) {
    var act = function () {
        this.$inputs = "*";
        this.$outputs = "*";
        this.activityName = 'ShowScreenActivity';
        this.displayArea = null;
    }
    function getRes(resPath) {
        var $rm = rm;
        if (resPath.indexOf("$") == -1) {
            return resPath;
        } else {
            return eval(resPath);
        }
    }
    act.prototype.Execute = function (context, done) {
        var opt = {
            Page: null,
            Area: 'mainView',
            ShowType: 'normal',//normal,modal
            ShowData: null,
            ViewState: 'new',
            IsSync: false,
            PageTimeOut: 0,//int型 设置页面超时时间
            DialogTimeOut: 0,//int型 设置页面超时后对话框超时时间
            DialogMessage: "",//string型 设置页面超时后对话框显示信息
            ForPadMessage: "",//string型 设置对话框超时后发Pad信息 
        };
        var inputs = wfjs.GetInputsFromContextWithOption(context, opt);
        this.displayArea = inputs.Area;
        if (!inputs.Page)
            throw new Error("the parameter page can't be null");
        var pageContext = {
            activityInstanceId: this.__instanceId__,
            instanceId: context.InstanceId,
            flowId: context.FlowchartSettings.flowId,
            viewState: (context.Isback ? "back" : null) || inputs.ViewState,
            page: inputs.Page,
            area: inputs.Area,
            showData: inputs.ShowData,
            pageTimeOut: inputs.PageTimeOut,
            dialogTimeOut: inputs.DialogTimeOut,
            dialogMessage: inputs.DialogMessage,
            forPadMessage: inputs.ForPadMessage,
            tabId: context.FlowchartSettings.tabId,
            isTab: context.FlowchartSettings.isTab,
        };
        if (pageContext.dialogMessage != "") {
            pageContext.dialogMessage= getRes(pageContext.dialogMessage);
        }
        if (pageContext.forPadMessage != "") {
            pageContext.forPadMessage = getRes(pageContext.forPadMessage);
        }
        if (inputs.ShowType.toLowerCase() == 'normal')
            if (!inputs.IsSync)
                vm.show2(pageContext)
                    .done(function (ret) {
                        if (ret) {
                            context.Outputs['Result'] = ret;
                        }
                        done();
                    });
            else {
                vm.showAsync(pageContext);
                done();
            }
        else {
            vm.showDialog(pageContext)
                .done(function (ret) {
                    if (ret) {
                        context.Outputs['Result'] = ret;
                    }
                    done();
                });
        }
    };
    act.prototype.canBeTerminate = function () {
        var result = true;
        var viewModel,
            viewArea = this.displayArea;
        if (vm.CurrentViewInstance[viewArea] != null && vm.CurrentViewInstance[viewArea].vmInstanceId != null)
            viewModel = vm.getViewModelFormHistoryByVmInstanceId(vm.CurrentViewInstance[viewArea].vmInstanceId);
        else
            utility.log.activity("showScreenActivity failed to  get current viewModel");
        if (!viewModel) return result;
        if ('canBeTerminate' in viewModel) {
            if (viewModel.canBeTerminate instanceof Function)
                result = viewModel.canBeTerminate();
            else
                result = viewModel.canBeTerminate;
        }
        return result;
    }
    act.prototype.Terminate = function () {
        var result = true;
        var viewModel,
           viewArea = this.displayArea;
        if (vm.CurrentViewInstance[viewArea] != null && vm.CurrentViewInstance[viewArea].vmInstanceId != null)
            viewModel = vm.getViewModelFormHistoryByVmInstanceId(vm.CurrentViewInstance[viewArea].vmInstanceId);
        else
            utility.log.activity("showScreenActivity failed to  get current viewModel");
        if (!viewModel) return result;
        if ('terminate' in viewModel) {
            if (viewModel['terminate'] instanceof Function)
                result = viewModel.terminate();
            else
                result = viewModel.terminate;
        }
        return result;
    }
    return act;
})