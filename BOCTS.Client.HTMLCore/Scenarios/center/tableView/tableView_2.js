define(['jsRuntime/resourceManager', 'jsRuntime/actionManager', 'jsRuntime/parManager', 'widgets/tableView/tableView'],
    function (rm, am, pm, tableView) {
        var d = function (cx) {
            var self = this;
            this.cx = cx;
            this.rm = rm.global;
            this.am = am.global;
            this.sortOrders = ko.observable();
            this.filters = ko.observable();
            this.filterColumnIndex = ko.observable();
            this.filterValues = ko.observable([]);
            this.filterValue = ko.observable();
            this.filterColumnIndex.subscribe(function (newValue) {
                if (newValue !== undefined && typeof (newValue) === 'number') {
                    self.filterValues(self.TableView.distinctByColumn(newValue))
                }
                else {
                    self.filterValues([]);
                }
            });
            this.filterValue.subscribe(function (newValue) {
                self.addFilter();
            });
            this.rowCount = ko.observable(200);
            this.generateData = function () {
                var dataSource = [];
                //#region for test               
                var names = ['张大力', '李有力', '于巨力', '刘力', '王毛力', '于巨力', '王毛力', '鲁宝春', '刘景一', '谷广志', '健寿', '哈哈', '呵呵'];
                var englishNames = ['zhangjl', 'zhangml', 'zhangnl', 'zhangyl', 'zhangwl', 'zhangxl', 'zhangdl', 'james', 'carol', 'lucy', 'mari', 'lily', 'glory'];
                var enabled = [true, false];
                var years = [2011, 2012, 2013, 2014, 2016, 2015];
                for (var i = 0; i < self.rowCount() ; i++) {
                    var data = {};
                    data['Name'] = names[Math.floor(Math.random() * names.length)];
                    data['EnglishName'] = englishNames[Math.floor(Math.random() * englishNames.length)];
                    data['Age'] = Math.floor(Math.random() * 100 + 1);
                    data['Enabled'] = enabled[Math.floor(Math.random() * enabled.length)];
                    data['UpdateDate'] = years[Math.floor(Math.random() * years.length)] + "/" + Math.floor(Math.random() * 12 + 1) + "/" + Math.floor(Math.random() * 30 + 1);
                    data['UpdateBy'] = englishNames[Math.floor(Math.random() * englishNames.length)];
                    dataSource.push(data);
                }
                //end region                               
                self.TableView.Search(dataSource);
            };
            this.reset = function () {
                self.TableView.ClearOrderColumns();
            },
            this.TableView = new tableView({
                columns: [
                    { Name: 'Name', DisplayName: '名称', DataType: 'string' },
                    { Name: 'EnglishName', DisplayName: '英文名称', DataType: 'string' },
                    { Name: 'Age', DisplayName: '年龄', DataType: 'num' },
                    { Name: 'Enabled', DisplayName: '状态', DataType: 'bool', 'bOrderable': false },
                    { Name: 'UpdateDate', DisplayName: '更新时间', DataType: 'date' },
                    { Name: 'UpdateBy', DisplayName: '更新人', DataType: 'string' },
                    { Name: 'Age', DisplayName: '年龄2', DataType: 'num' },
                ],
                dataMode: 'client',
                orders: [[2, 'asc'], [1, 'desc']],
                orderMode: 'single',  //single，multi
                rowsPerPage: 10,
                maxNavigatepageCount: 5
            });

            this.activate = function () {
            };

            this.getOrders = function () {
                self.sortOrders(JSON.stringify(self.TableView.orders()));
            };

            this.getFilters = function () {
                self.filters(JSON.stringify(self.TableView.getFilters()));
            };

            this.clearFilters = function () {
                self.TableView.setFilters([]);
            };

            this.setOrders = function () {
                var orders = [[0, 'asc'], [2, 'desc']];
                self.TableView.setOrders(orders);
            };

            this.addFilter = function () {
                var filters = [];
                if (self.filterColumnIndex() !== undefined
                    && typeof (self.filterColumnIndex()) === 'number'
                    && self.filterValue() !== undefined
                    && self.filterValue() !== '') {
                    filters.push([self.filterColumnIndex(), self.filterValue()]);
                }
                self.TableView.setFilters(filters);
            };

            this.compositionComplete = function () {
                self.generateData();

            };
        };
        return d;
    });