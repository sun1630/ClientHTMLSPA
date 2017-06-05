define(['jquery'], function ($) {

    var FakeDevice = function (drivertype) {
        this.drivertype = drivertype;
    };
    FakeDevice.prototype.call = function (p_jsonstr, p_done, p_progress, p_fail) {
        var p_json = JSON.parse(p_jsonstr);
        setTimeout(function () {
            if (p_json.progress) {
                if (p_json.progressArray) {
                    p_json.progressArray.forEach(function (item) {
                        setTimeout(function () {
                            p_progress(JSON.stringify(item));
                        }, item.timespan);
                    });

                } else {
                    p_progress(p_jsonstr);
                }
            }

            setTimeout(function () {
                if (p_json.done) p_done(p_jsonstr);
                else if (p_json.fail) p_fail(p_jsonstr);
            }, p_json.done || p_json.fail || 50);

        }, p_json.progress || 50);
    };
    FakeDevice.prototype.reset = FakeDevice.prototype.call;
    FakeDevice.prototype.readcard = FakeDevice.prototype.call;
    FakeDevice.prototype.ejectcard = FakeDevice.prototype.call;
    FakeDevice.prototype.readIDCard = FakeDevice.prototype.call;
    FakeDevice.prototype.ejectIDCard = FakeDevice.prototype.call;
    FakeDevice.prototype.inputPin = FakeDevice.prototype.call;
    FakeDevice.prototype.inputData = FakeDevice.prototype.call;
    FakeDevice.prototype.cancelInput = FakeDevice.prototype.call;
    FakeDevice.prototype.cancelaccept = FakeDevice.prototype.call;
    FakeDevice.prototype.printform = FakeDevice.prototype.call;
    FakeDevice.prototype.dispensecard = FakeDevice.prototype.call;
    FakeDevice.prototype.dispensekey = FakeDevice.prototype.call;
    FakeDevice.prototype.readbarcode = FakeDevice.prototype.call;
    FakeDevice.prototype.ejectkey = FakeDevice.prototype.call;
    FakeDevice.prototype.cancelRead = FakeDevice.prototype.call;
    FakeDevice.prototype.getDoorSensorStatus = FakeDevice.prototype.call;
    FakeDevice.prototype.controlGuideLightSync = FakeDevice.prototype.call;
    FakeDevice.prototype.controlFasciaLightSync = FakeDevice.prototype.call;
    FakeDevice.prototype.closeAllSync = FakeDevice.prototype.call;
    FakeDevice.prototype.enableEvent = FakeDevice.prototype.call;
    FakeDevice.prototype.disableEvent = FakeDevice.prototype.call;
    FakeDevice.prototype.getmediastatus = FakeDevice.prototype.call;
    FakeDevice.prototype.readBarcode = FakeDevice.prototype.call;
    FakeDevice.prototype.loadTMKKey = FakeDevice.prototype.call;
    FakeDevice.prototype.loadKey = FakeDevice.prototype.call;
    FakeDevice.prototype.getunitinfo = FakeDevice.prototype.call;
    FakeDevice.prototype.hdprinttemplate = FakeDevice.prototype.call;
    FakeDevice.prototype.getprintjobinfo = FakeDevice.prototype.call;
    FakeDevice.prototype.capturecard = FakeDevice.prototype.call;
    FakeDevice.prototype.getdevinfo = FakeDevice.prototype.call;
    FakeDevice.prototype.getpaperboxstatus = FakeDevice.prototype.call;
    FakeDevice.prototype.getdevicestatus = FakeDevice.prototype.call;
    FakeDevice.prototype.getcandidatelist = FakeDevice.prototype.call;
    FakeDevice.prototype.selectapplication = FakeDevice.prototype.call;
    FakeDevice.prototype.initiateapplicationinfo = FakeDevice.prototype.call;
    FakeDevice.prototype.selectaccounttype = FakeDevice.prototype.call;
    FakeDevice.prototype.selecttransaction = FakeDevice.prototype.call;
    FakeDevice.prototype.inputamount = FakeDevice.prototype.call;
    FakeDevice.prototype.getecupperlimit = FakeDevice.prototype.call;
    FakeDevice.prototype.getelebalance = FakeDevice.prototype.call;
    FakeDevice.prototype.getmutitagfieldvalue = FakeDevice.prototype.call;
    FakeDevice.prototype.gettransdetail = FakeDevice.prototype.call;
    FakeDevice.prototype.getqlog = FakeDevice.prototype.call;
    FakeDevice.prototype.excutecoredispose = FakeDevice.prototype.call;
    FakeDevice.prototype.getscriptresults = FakeDevice.prototype.call;
    FakeDevice.prototype.writearpcandscript = FakeDevice.prototype.call;
    FakeDevice.prototype.excutecoredispose = FakeDevice.prototype.call;
    FakeDevice.prototype.setunitinfo = FakeDevice.prototype.call;

    FakeWebAPI = FakeDevice;
    FakeWebAPI.prototype.uploadfile = FakeDevice.prototype.call;
    FakeWebAPI.prototype.uploadfileasync = FakeDevice.prototype.call;
    FakeWebAPI.prototype.retrievefile = FakeDevice.prototype.call;
    FakeWebAPI.prototype.uploadrecentphoto = FakeDevice.prototype.call;
    FakeWebAPI.prototype.retrieverecentphoto = FakeDevice.prototype.call;
    FakeWebAPI.prototype.retrievefilebyversonno = FakeDevice.prototype.call;
    FakeWebAPI.prototype.updatefile = FakeDevice.prototype.call;
    FakeWebAPI.prototype.savefile = FakeDevice.prototype.call;
    FakeWebAPI.prototype.saveimg2local = FakeDevice.prototype.call;

    FakeManage = FakeDevice;
    FakeManage.prototype.writefile = function (para) { console.log(para); }
    FakeManage.prototype.logoff = FakeDevice.prototype.call;
    FakeManage.prototype.readfile = FakeDevice.prototype.call;
    FakeManage.prototype.pdf2img = FakeDevice.prototype.call;

    FakePDFUtility = FakeDevice;
    FakeManage.prototype.pdfdrawtext = FakeDevice.prototype.call;
    FakeManage.prototype.pdfhandwrite = FakeDevice.prototype.call;
    FakeManage.prototype.pdfsignsave = FakeDevice.prototype.call;


    function getdevice(drivertype) {
        if (window.AppHost)
            return AppHost.getdevice(drivertype);
        else
            return new FakeDevice(drivertype);
    }

    function getEngagedWebAPI(apiname) {
        if (window.AppHost) {
            return AppHost.getEngagedApi(apiname);
        }
        else {
            return new FakeWebAPI(apiname);
        }
    }

    function getManage() {
        if (window.AppHost) {
            return AppHost.getManage();
        }
        else {
            return new FakeManage("manage");
        }
    }

    function getPDFUtility() {
        if (window.AppHost) {
            return AppHost.pdfutility();
        }
        else {
            return new FakePDFUtility("pdfutility");
        }
    }

    function getLogHelper() {
        if (window.AppHost) {
            return AppHost.getLogHelper();
        }
        else {
            return null;
        }
    }

    var Device = function () {
        var signtablet = function () {
            this.device = getdevice("signtablet");
        };
        signtablet.prototype.sign = function (json) {
            var deferred = $.Deferred(function (deferred) {
                this.device.call(JSON.stringify(json)
                    , function (info) {//done
                        var msg_json = JSON.parse(info);
                        if (msg_json.result == "ok") {
                            setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                        } else if (msg_json.result == "cancel") {
                            setTimeout(function () { deferred.reject(JSON.parse(info)) }, 50);
                        }
                    }
                    , function (state) {//progress
                        setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50);
                    }
                    , function (err) {//fail
                        setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50);
                    }
                    );
            }.bind(this));

            return deferred.promise();
        };

        var card = function () {
            this.device = getdevice("card");
        };
        card.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.readcard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.readcard(JSON.stringify(json)
                    , function (info) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(1);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                    }
                    , function (state) {
                        setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50);
                    }
                    , function (err) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(2);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50);
                    });
            }.bind(this)).promise();
        };
        card.prototype.ejectcard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.ejectcard(JSON.stringify(json)
                    , function (info) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(0);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                    }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(2);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50);
                    });
            }.bind(this)).promise();
        };
        card.prototype.cancelaccept = function (json) {
            return $.Deferred(function (deferred) {
                this.device.cancelaccept(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.capturecard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.capturecard(JSON.stringify(json)
                    , function (info) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(0);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); 
                    }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) {
                        require(['jsRuntime/dataManager'], function (dm) {
                            try {
                                dm.settingsStatus.menuBarStatus.cardStatus(2);
                            } catch (e) {
                                if ($log)
                                    $log("set cardStatus occur an error:" + e);
                            }
                            deferred.resolve(JSON.parse(info));
                        })
                        //setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); 
                    });
            }.bind(this)).promise();
        };
        card.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getmediastatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getmediastatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getcandidatelist = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getcandidatelist(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.selectapplication = function (json) {
            return $.Deferred(function (deferred) {
                this.device.selectapplication(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.initiateapplicationinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.initiateapplicationinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.selectaccounttype = function (json) {
            return $.Deferred(function (deferred) {
                this.device.selectaccounttype(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.selecttransaction = function (json) {
            return $.Deferred(function (deferred) {
                this.device.selecttransaction(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.inputamount = function (json) {
            return $.Deferred(function (deferred) {
                this.device.inputamount(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getecupperlimit = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getecupperlimit(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getelebalance = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getelebalance(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getmutitagfieldvalue = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getmutitagfieldvalue(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.gettransdetail = function (json) {
            return $.Deferred(function (deferred) {
                this.device.gettransdetail(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getqlog = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getqlog(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.excutecoredispose = function (json) {
            return $.Deferred(function (deferred) {
                this.device.excutecoredispose(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.getscriptresults = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getscriptresults(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        card.prototype.writearpcandscript = function (json) {
            return $.Deferred(function (deferred) {
                this.device.writearpcandscript(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var dispensecard = function () {
            this.device = getdevice("dispensecard");
        };
        dispensecard.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.dispensecard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.dispensecard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.ejectcard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.ejectcard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.capturecard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.capturecard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.getmediastatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getmediastatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        dispensecard.prototype.getunitinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getunitinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        dispensecard.prototype.setunitinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.setunitinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var idcard = function () {
            this.device = getdevice("idcard");
        };
        idcard.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        idcard.prototype.readIDCard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.readIDCard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        idcard.prototype.ejectIDCard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.ejectIDCard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        idcard.prototype.cancelaccept = function (json) {
            return $.Deferred(function (deferred) {
                this.device.cancelaccept(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        idcard.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var audio = function () {
            this.device = getdevice("audio");
        };
        audio.prototype.play = function (a) {
            if (window.AppHost) {
                this.device.play(a);
            }
        };

        var pinpad = function () {
            this.device = getdevice("pinpad");
        };
        pinpad.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.loadKey = function (json) {
            return $.Deferred(function (deferred) {
                this.device.loadKey(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.loadTMKKey = function (json) {
            return $.Deferred(function (deferred) {
                this.device.loadTMKKey(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.inputPin = function (json) {
            return $.Deferred(function (deferred) {
                this.device.inputPin(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.cancelInput = function (json) {
            return $.Deferred(function (deferred) {
                this.device.cancelInput(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.inputData = function (json) {
            return $.Deferred(function (deferred) {
                this.device.inputData(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        pinpad.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var print = function () {
            this.device = getdevice("print");
        };
        print.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        print.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        print.prototype.printform = function (json) {
            return $.Deferred(function (deferred) {
                this.device.printform(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        print.prototype.getmediastatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getmediastatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var keydispense = function () {
            this.device = getdevice("keydispense");
        };
        keydispense.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.dispensekey = function (json) {
            return $.Deferred(function (deferred) {
                this.device.dispensekey(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.readbarcode = function (json) {
            return $.Deferred(function (deferred) {
                this.device.readbarcode(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.ejectkey = function (json) {
            return $.Deferred(function (deferred) {
                this.device.ejectkey(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.capturecard = function (json) {
            return $.Deferred(function (deferred) {
                this.device.capturecard(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.getmediastatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getmediastatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        keydispense.prototype.getunitinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getunitinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        keydispense.prototype.setunitinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.setunitinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var barcode = function () {
            this.device = getdevice("barcode");
        };
        barcode.prototype.readBarcode = function (json) {
            return $.Deferred(function (deferred) {
                this.device.readBarcode(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        barcode.prototype.cancelRead = function (json) {
            return $.Deferred(function (deferred) {
                this.device.cancelRead(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        barcode.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        barcode.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var siu = function () {
            this.device = getdevice("siu");
        };
        siu.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        siu.prototype.getDoorSensorStatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getDoorSensorStatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        siu.prototype.controlGuideLightSync = function (json) {
            return $.Deferred(function (deferred) {
                this.device.controlGuideLightSync(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        siu.prototype.controlFasciaLightSync = function (json) {
            return $.Deferred(function (deferred) {
                this.device.controlFasciaLightSync(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        siu.prototype.closeAllSync = function (json) {
            return $.Deferred(function (deferred) {
                this.device.closeAllSync(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        siu.prototype.enableEvent = function (json) {
            return $.Deferred(function (deferred) {
                this.device.enableEvent(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        //人体感应离开功能开启
        siu.prototype.enableEventA = function (json) {
            this.device.enableEvent(JSON.stringify({})
                , json.composeComplate
                , json.state
                , json.error)
        };

        siu.prototype.disableEvent = function (json) {
            return $.Deferred(function (deferred) {
                this.device.disableEvent(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var hdprint = function () {
            this.device = getdevice("hdprint");
        };
        hdprint.prototype.hdprinttemplate = function (json) {
            return $.Deferred(function (deferred) {
                this.device.hdprinttemplate(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        hdprint.prototype.getprintjobinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getprintjobinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        hdprint.prototype.reset = function (json) {
            return $.Deferred(function (deferred) {
                this.device.reset(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        hdprint.prototype.getdevinfo = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevinfo(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        hdprint.prototype.getpaperboxstatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getpaperboxstatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        var devicestatus = function () {
            this.device = getdevice("devicestatus");
        };
        devicestatus.prototype.getdevicestatus = function (json) {
            return $.Deferred(function (deferred) {
                this.device.getdevicestatus(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        return {
            signtablet: signtablet,
            card: card,
            dispensecard: dispensecard,
            idcard: idcard,
            audio: audio,
            pinpad: pinpad,
            print: print,
            keydispense: keydispense,
            barcode: barcode,
            siu: siu,
            hdprint: hdprint,
            devicestatus: devicestatus
        };
    };

    var EngagedWebAPI = function () {
        var icms = function () {
            this.api = getEngagedWebAPI("icms");
        };
        icms.prototype.uploadfile = function (json) {
            return $.Deferred(function (deferred) {
                this.api.uploadfile(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.uploadfileasync = function (json) {
            return $.Deferred(function (deferred) {
                this.api.uploadfileasync(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.retrievefile = function (json) {
            return $.Deferred(function (deferred) {
                this.api.retrievefile(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.uploadrecentphoto = function (json) {
            return $.Deferred(function (deferred) {
                this.api.uploadrecentphoto(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.retrieverecentphoto = function (json) {
            return $.Deferred(function (deferred) {
                this.api.retrieverecentphoto(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.retrievefilebyversonno = function (json) {
            return $.Deferred(function (deferred) {
                this.api.retrievefilebyversonno(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.updatefile = function (json) {
            return $.Deferred(function (deferred) {
                this.api.updatefile(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        icms.prototype.savefile = function (json) {
            return $.Deferred(function (deferred) {
                this.api.savefile(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };
        /*
        input/
        file_name
        file_content
        output/
        file_path
          code
          msg
        */
        icms.prototype.saveimg2local = function (json) {
            return $.Deferred(function (deferred) {
                this.api.saveimg2local(JSON.stringify(json)
                    , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                    , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                    , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
            }.bind(this)).promise();
        };

        return {
            icms: icms,
        };
    };

    var Manage = function () {
        this.manage = getManage();
    };
    //manage.writefile({ "filepath": "config/machine.txt", "filecontent": machineFileContent })
    Manage.prototype.logoff = function (json) {
        return $.Deferred(function (deferred) {
            this.manage.logoff(JSON.stringify()
                , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    Manage.prototype.writefile = function (json) {
        return $.Deferred(function (deferred) {
            this.manage.writefile(JSON.stringify(json)
                , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    Manage.prototype.readfile = function (json) {
        return $.Deferred(function (deferred) {
            this.manage.readfile(JSON.stringify(json)
                , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    Manage.prototype.pdf2img = function (json) {
        return $.Deferred(function (deferred) {
            this.manage.pdf2img(JSON.stringify(json)
                , function (info) { setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50); }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    Manage.prototype.sendmessage = function (remoteaddress, json) {
        if (window.AppHost) {
            return this.manage.sendmessage(remoteaddress, JSON.stringify(json));
        }
        return false;
    };
    Manage.prototype.getMachineInfo = function () {
        if (window.AppHost) {
            return JSON.parse(this.manage.getMachineInfo());
        }
        return {
            "networkinterface": [{
                "type": "Ethernet",
                "ipv4": "192.168.80.1",
                "mac": "00155D71191A"
            }, {
                "type": "Ethernet",
                "ipv4": "22.9.7.18",
                "mac": "B4B6762A362A"
            }],
            "hostname": "xxx"
        };
    };
    Manage.prototype.lockScreenNotifyTile = function (tile) {
        if (window.AppHost) {
            return this.manage.lockScreenNotifyTile(tile);
        }
        return false;
    };
    Manage.prototype.lockScreenNotifyBadge = function (num) {
        if (window.AppHost) {
            return this.manage.lockScreenNotifyBadge(num);
        }
        return false;
    };
    Manage.prototype.exitApp = function () {
        if (window.AppHost) {
            this.manage.exitApp();
        }

    };
    Manage.prototype.setAppData = function (key, value) {
        if (window.AppHost) {
            this.manage.setAppData(key, value);
        }

    };
    Manage.prototype.getAppData = function (key) {
        if (window.AppHost) {
            return this.manage.getAppData(key);
        }
        return "";
    };

    var PDFUtility = function () {
        this.pdfUtility = getPDFUtility();
    };
    PDFUtility.prototype.pdfdrawtext = function (json) {
        return $.Deferred(function (deferred) {
            this.pdfUtility.pdfdrawtext(JSON.stringify(json)
                , function (info) {
                    var info_json = JSON.parse(info);
                    if (info_json.result && false == info_json.result) {
                        setTimeout(function () { deferred.reject(JSON.parse(info)) }, 50);
                    } else {
                        setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                    }
                }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    PDFUtility.prototype.pdfhandwrite = function (json) {
        return $.Deferred(function (deferred) {
            this.pdfUtility.pdfhandwrite(JSON.stringify(json)
                , function (info) {
                    var info_json = JSON.parse(info);
                    if (info_json.result && false == info_json.result) {
                        setTimeout(function () { deferred.reject(JSON.parse(info)) }, 50);
                    } else {
                        setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                    }
                }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };
    PDFUtility.prototype.pdfsignsave = function (json) {
        return $.Deferred(function (deferred) {
            this.pdfUtility.pdfsignsave(JSON.stringify(json)
                , function (info) {
                    var info_json = JSON.parse(info);
                    if (info_json.result && false == info_json.result) {
                        setTimeout(function () { deferred.reject(JSON.parse(info)) }, 50);
                    } else {
                        setTimeout(function () { deferred.resolve(JSON.parse(info)) }, 50);
                    }
                }
                , function (state) { setTimeout(function () { deferred.notify(JSON.parse(state)) }, 50); }
                , function (err) { setTimeout(function () { deferred.reject(JSON.parse(err)) }, 50); });
        }.bind(this)).promise();
    };

    var LogHelper = function () {
        this.helper = getLogHelper();
    };
    LogHelper.prototype.log = function (logstring) {
        if (window.AppHost) {
            this.helper.log(logstring);
        }
    };
    LogHelper.prototype.warn = function (logstring) {
        if (window.AppHost) {
            this.helper.warn(logstring);
        }
    };
    LogHelper.prototype.error = function (logstring) {
        if (window.AppHost) {
            this.helper.error(logstring);
        }
    };

    //add new Items here


    var JSBridge = {
        Device: Device(),
        EngagedWebAPI: EngagedWebAPI(),
        Manage: Manage,
        PDFUtility: PDFUtility,
        LogHelper: LogHelper,
        //是否充许升级
        isAllowUpdate: function () {
            var dfd = $.Deferred();

            require(['jsRuntime/configManager', 'jsRuntime/viewManager', 'jsRuntime/dataManager'], function (cm, vm, dm) {
                var isAllow = false;
                //主交易区域是否为default页
                var isDefaultPage = false;
                //当前用户是否退出
                var isUserExit = false;

                var defaultAreaModel = vm.getOrRegisterViewArea(cm.client.defaultArea)().model;
                if (defaultAreaModel.__modelId__ == null || defaultAreaModel.__modelId__ == cm.client.defaultArea)
                    isDefaultPage = true;

                if (dm["customer"] == null || dm["customer"].CustNum() == null || $.trim(dm["customer"].CustNum()) == "")
                    isUserExit = true;

                if (isDefaultPage && isUserExit)
                    isAllow = true;
                dfd.resolve(isAllow.toString());
                //return isAllow.toString();
            });

            return dfd.promise();
        }
    };
    //访问方式:$satmIsUpdate().done(function(x){alert(x)})
    (function (bridge) {
        window.$satmIsUpdate = bridge.isAllowUpdate;
    })(JSBridge);
    return JSBridge;
});