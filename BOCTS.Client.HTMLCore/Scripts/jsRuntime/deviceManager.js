define(['jsRuntime/appBridge', 'jsRuntime/utility'],
    function (appBridge, utility) {
        var devManager = {
            /*名称：查看外设介质状态
              参数：drivertype string类型 外设介质类型  值如下：
              A、dispensecard：发卡器状态
                 返回值： 成功 {status:1 } 1为状态码、失败 { msg: " 错误描述" }
                 状态码：1:卡在卡机里
                         2:卡不在卡机内
                         3:卡片被堵塞
                         4:介质状态不支持
                         5:介质状态未知
                         6:卡在进卡口
                         7:卡片在卡机内，且已上电
             B、print：凭条打印状态
                返回值： 成功 {status:1 } 1为状态码、失败 { msg: " 错误描述" }
                状态码：0:纸满
                        1:纸少
                        2:缺纸
                        3:纸检测不支持
                        4:纸状态不确定
                        5:卡纸
            C、keydispense：U-key状态
               返回值： 成功 {status:1 } 1为状态码、失败 { msg: " 错误描述" }
               状态码：1:介质在通道内
                       2:无介质
                       3:介质堵塞
                       4:不支持介质状态
                       5:未知状态
                       6:在出口处（可以取到）
                       7:在通道内且已经上电
            D、card：读卡器状态
               返回值： 成功 {status:1 } 1为状态码、失败 { msg: " 错误描述" }
               状态码：1:卡在卡机里
                       2:卡不在卡机内
                       3:卡片被堵塞
                       4:介质状态不支持
                       5:介质状态未知
                       6:卡在进卡口
                       7:卡片在卡机内，且已上电
            使用示例：
                  devM.deviceMediumStatus("card").done(function(rtn){
                    alert(rtn.status);
                  }).fail(function(messge){
                    alert(messge.msg);
                  });
            */
            deviceMediumStatus: function (drivertype, json) {
                var device = new appBridge.Device[drivertype];
                return device.getmediastatus(json || {});
            },
            /*方法名称：loadTMKKey
            输入：
               {
                    TMK1:32位
                    TMK2:32位
                    CheckValue:16位
               }

            输出：
              Oncomplete返回数据：
               成功下载：
                {"msg":"密码键盘下载TMK成功"}

              Onerror返回数据：
               若TMK1或者TMK2的长度不对：
                {"msg":"错误的密钥长度，请输入32位密钥"}
                若CheckValue长度不对：
                {"msg":"错误的校验值长度，请输入16位校验值"}
                对比输入和生成的校验值，不相等：
                {"msg":"校验值不正确"}
                错误下载：
                {"msg":"密码键盘下载TMK失败，错误码为：1"} （错误码为实际情况的错误码） 
            */
            loadTMKKey: function (json, drivertype) {
                var device = new appBridge.Device[drivertype || "pinpad"];
                return device.loadTMKKey(json || {});
            },
            /*名称：查看外设介质信息
            参数：drivertype string类型 外设介质类型  值如下：
            A:dispensecard：发卡器信息
              返回值：成功：｛result: true,
                                uint: [{ usNumber: 1, usType: 1, ulCount: 4, ulRetain: 0, usStatus: 0 },
                                       { usNumber: 2, usType: 1, ulCount: 4, ulRetain: 0, usStatus: 0 }
                                      ]
                             }
                            说明：
                            usNumber卡箱序号 1,2....
                            usType卡箱类型：1 发卡箱，2回收卡箱
                            ulCount当前卡的张数:对于发卡箱，每次发卡递减，对于回收箱，每次回收递增
                            ulRetain回收数:对于发卡箱，是发卡过程中回收的张数，对于回收箱，是永远为0
                            usStatus卡箱状态：0 发卡箱状态正常，有足够的卡可以发;1 发卡箱能发卡，可能没有多少卡能发了;2 不能发卡了;3 发卡箱状态不确定
                       失败：{ msg: " 错误描述" }
            B:keydispense：UKey信息
              返回值：成功：｛result: true,
                                uint: [{ usNumber: 1, usType: 1, ulCount: 4, ulRetain: 0, usStatus: 0 },
                                       { usNumber: 2, usType: 1, ulCount: 4, ulRetain: 0, usStatus: 0 }
                                      ]
                             }
                            说明：
                            usNumbe-卡箱序号: 1,2....
                            usType-卡箱类型 :1 发卡箱;2回收卡箱
                            ulCount-当前卡的张数:对于发卡箱，每次发卡递减，对于回收箱，每次回收递增
                            ulRetain-回收数: 对于发卡箱，是发卡过程中回收的张数，对于回收箱，是永远为0
                            usStatus-卡箱物理状态0-正常，1-少卡，2-卡箱空，3-在使用中，4-缺失，5-卡箱近满，6-满，7-未知
                      失败：{ msg: " 错误描述" }
            */
            deviceMediumInfo: function (drivertype, json) {
                var device = new appBridge.Device[drivertype];
                return device.getunitinfo(json || {});
            },

            //获取卡信息
            //返回json  {isExistCard:false,cardNo:''}
            //isExistCard 是否有卡 cardNo卡号
            getCardInfo: function () {
                var dfd = new $.Deferred();
                var device = new appBridge.Device['card'];
                var cardInof = { isExistCard: false, cardNo: '' };

                if (window.AppHost == null)
                    dfd.reject();

                device.getmediastatus({ done: 50, status: 1 }).then(function (info) {
                    utility.trace("info.status:" + info.status);
                    if (info.status == 1)//有卡
                    {
                        cardInof.isExistCard = true;
                        //读卡号
                        var json = { done: 1000, cardNO: 456789 };
                        device.readcard(json).then(function (info) {
                            var Information = {}
                            if (0 == info.iret) {
                                var cardNo = info.track2.split('=');
                                Information = {
                                    track2: info.track2,
                                    cardtype: info.cardtype,
                                    cardNo: cardNo[0],
                                    CardNo: cardNo[0],
                                    Result: 1,
                                };
                                cardInof.cardNo = Information.cardNo;
                            }
                            else {
                                utility.trace("info.iret" + info.iret);
                            }

                            dfd.resolve(cardInof);
                        }, null, null).fail(function (ee) {
                            utility.trace("device.readcard Error:" + ee.status);
                            dfd.reject();
                        });
                    }
                }).fail(function (err) {
                    utility.trace("device.getmediastatus error" + err.status);
                    dfd.reject();
                });
                return dfd.promise();
            },

            /*
            获取所有设备状态
            输出json格式：
            {
              "ret": 0,
              "deviceStatus": [
                {
                  "card": {
                    "status": 0
                  }
                },
                {
                  "print": {
                    "status": 0,
                    "mediaStatus": 0
                  }
                },
                {
                  "keydispense": {
                    "status": 0,
                    "mediaStatus": [
                      {
                        "usNumber": "1",
                        "usType": "1",
                        "ulCount": "99",
                        "ulRetain": "0",
                        "usStatus": "2"
                      },
                      {
                        "usNumber": "2",
                        "usType": "2",
                        "ulCount": "4",
                        "ulRetain": "0",
                        "usStatus": "0"
                      }
                    ]
                  }
                },
                {
                  "hdprint": {
                    "status": 1,
                    "mediaStatus": {
                      "box1": 4,
                      "box2": 4,
                      "box3": 4,
                      "box4": 4
                    }
                  }
                }
              ]
            }
            */
            allDeviceStatus: function (json) {
                var device = new appBridge.Device['devicestatus'];
                return device.getdevicestatus(json || {});
            }
        };
        return devManager;
    });