define(['durandal/system', 'jsRuntime/resourceManager'], function (system, rm) {
    var _orderMode = { single: 'single', multi: 'multi' };
    var _dataMode = { client: 'client', server: 'server' };
    //全局默认配置
    var _settings = {
        columns: [],
        orderMode: _orderMode.single,
        orders: [],
        dataMode: _dataMode.client,
        rowsPerPage: 10,
        maxNavigatepageCount: 5,
    };
    var _columnSetting = {
        Name: null,
        DisplayName: null,
        DataType: null,
        FilterValue: null,
        FilterValue2: null,
        FilterOp: { Name: '等于', Value: 'eq' },
        JoinFilter: false,
        order: null,
        bOrderable: true,
        FilterSetting: {
            'UI': null,
            'TrueText': '是',
            'FalseText': '否',
            'Options': null,
            'OptionsValue': null,
            'OptionsText': null
        },
        UISetting: {
            Head: { Style: 'width:auto' }
        }
    };

    function PackageSetting(settings) {
        //合并设置，局部设置会覆盖全局设置
        var s = $.extend({}, _settings, settings);
        ko.utils.arrayForEach(s.columns, function (item) {
            $.extend(item, $.extend(true, {}, _columnSetting, item));
            if (item.FilterSetting.UI == null) {
                if (item.DataType == 'bool')
                    item.FilterSetting.UI = 'radio';
                else if (item.DataType == 'num')
                    item.FilterSetting.UI = 'num';
                else if (item.DataType == 'date')
                    item.FilterSetting.UI = 'date';
                else if (item.DataType == 'ddl')
                    item.FilterSetting.UI = 'ddl';
                else
                    item.FilterSetting.UI = 'input';
            }
        });
        return s;
    };
    var f = function (settings) {
        var self = this;
        this.rm = rm.global.table;
        this.status = ko.observable();
        this.settings = ko.mapper.fromJS(PackageSetting(settings));
        this.cacheData = [];
        this.data = [];
        this.orderColumns = [];
        this.currentOrderColumn = null;
        this.filters = [];
        this.rowCount = ko.observable(settings.rowsPerPage);
        this.timespan = ko.observable();
        this.skip = 0;
        this.totalCount = ko.observable();
        this.pageCount = ko.computed(function () {
            return Math.ceil(ko.utils.unwrapObservable(self.totalCount) / ko.utils.unwrapObservable(self.rowCount));
        });
        this.navigatePages = ko.observableArray([]);
        this.maxNavigatepageCount = ko.observable(settings.maxNavigatepageCount);
        this.currentPage = ko.observable(1);
        this.result = ko.observableArray([]);


        this.ColumnJoinFilter = function (item) {
            item.JoinFilter(true);
            self.Filter();
        };
        this.ColumnClearFilter = function (item) {
            item.JoinFilter(false);
            self.Filter();
        };

        this.CheckFilterValue = function (item) {
            if (!item.JoinFilter())
                item.FilterValue(null);
        };
        this.ClearColumnFilter = function (item) {
            item.JoinFilter(false);
            self.Filter();
        };
        this.ClearOrderColumns = function () {
            self.currentOrderColumn = null;
            $.each(self.orderColumns, function (index, item) {
                item.order(null);
            });
            self.orderColumns.length = 0;
        };

        this.SetOrderby = function (item, order) {
            if (!item.bOrderable()) return;
            if (self.settings.orderMode() == 'single'
                && self.currentOrderColumn != null
                && self.currentOrderColumn != item) {
                if (self.currentOrderColumn) {
                    self.currentOrderColumn.order(null);
                    var columnIndex = ko.utils.arrayIndexOf(self.orderColumns, self.currentOrderColumn);
                    if (columnIndex > -1) {
                        self.orderColumns.splice(columnIndex, 1);
                    }
                }
            }
            if (order === undefined || typeof order !== "string") {
                if (item.order() == null) {
                    order = 'asc';
                } else if (item.order() == 'asc') {
                    order = 'desc';
                } else {
                    order = 'asc';
                }
            }
            item.order(order);
            self.currentOrderColumn = item;
            if (ko.utils.arrayIndexOf(self.orderColumns, self.currentOrderColumn) < 0) {
                self.orderColumns.push(self.currentOrderColumn);
            }
            self.Search();
        };
        this.SelectFilterOp = function (item, op) {
            ko.mapper.fromJS(op, {}, item.FilterOp);
        };

        this.Search = function (data) {
            if (data)
                self.data = data;
            if (self.data.length == 0) {
                self.clearAllData();
                return;
            }
            if (self.settings.dataMode() == 'server') {
                self.SearchServer();
            }
            else if (self.settings.dataMode() == 'client') {
                self.SearchClient();
            }
        };

        this.clearAllData = function () {
            self.result.removeAll();
            self.totalCount(0);
            self.currentPage(0);
            self.navigatePages.removeAll();
        };

        this.SearchServer = function () {
            var start = new Date().getTime();
            self.totalCount(self.data);
            self.cacheData = self.data.slice(0).filter(self.DoFilter());
            self.cacheData.sort(self.DoSort());
            self.result(self.cacheData);
            var end = new Date().getTime();
            self.timespan(end - start);
        }

        this.SearchClient = function () {
            var start = new Date().getTime();
            self.currentPage(1);
            self.cacheData = self.data.slice(0).filter(self.DoFilter());
            self.cacheData.sort(self.DoSort());
            self.totalCount(self.cacheData.length);
            var end = new Date().getTime();
            self.timespan(end - start);
            self.result(self.cacheData.slice(self.skip, self.skip + self.rowCount()));
            self.BuildnavigatePages(true);
        };

        this.GetSortColumn = function () {
            if (self.settings.orders() && self.settings.orders().length > 0) {
                if (self.settings.orderMode() == 'single') {
                    var orderItem = self.settings.orders()[0];
                    self.currentOrderColumn = ko.utils.arrayFirst(self.settings.columns(), function (item, index) {
                        return index == orderItem()[0];
                    });
                    self.currentOrderColumn.order(orderItem()[1]);
                    self.orderColumns.push(self.currentOrderColumn);
                }
                else if (self.settings.orderMode() == 'multi') {
                    self.settings.orders().forEach(function (orderItem) {
                        var sortColumn = ko.utils.arrayFirst(self.settings.columns(), function (item, index) {
                            return index == orderItem()[0];
                        });
                        sortColumn.order(orderItem()[1]);
                        self.orderColumns.push(sortColumn);
                    });
                };
            }
            //else {
            //    self.settings.columns()[0].order('asc');
            //    self.currentOrderColumn = self.settings.columns()[0];
            //    self.orderColumns.push(self.settings.columns()[0]);
            //}
        };

        this.DoSort = function () {
            if (self.orderColumns.length == 0)
                self.GetSortColumn();
            if (self.orderColumns.length == 0) return;
            return function (a, b) {
                return self.loop(a, b, 0);
            };
        };

        this.DoFilter = function () {
            return function (el) {
                var rtn = true;
                for (var i = 0; i < self.filters.length; i++) {
                    var item = self.filters[i];
                    var columnIndex = item[0];
                    var columnName = self.settings.columns()[columnIndex].Name();
                    var columnValue = item[1];
                    if (el[columnName] != columnValue) {
                        rtn = false;
                        break;
                    }
                };
                return rtn;
            };
        };

        //Distinct列值
        this.distinctByColumn = function (columnIndex) {
            var copy = self.data.slice(0);
            var columnValues = [];
            var columnName = self.settings.columns()[columnIndex].Name();
            for (var i = 0; i < copy.length; i++) {
                columnValues.push(copy[i][columnName]);
                for (var j = i + 1; j < copy.length;) {
                    if (copy[j][columnName] === copy[i][columnName]) {
                        copy.splice(j, 1);
                    }
                    else {
                        j++;
                    }
                }
            }
            return columnValues;
        };

        this.getFilters = function () {
            return self.filters;
        };

        this.setFilters = function (filters) {
            self.filters.length = 0;
            filters.forEach(function (item) {
                self.filters.push(item);
            });
            self.Search();
        };

        this.orders = function () {
            var retOrders = [];
            self.orderColumns.forEach(function (item, index) {
                var columnIndex = ko.utils.arrayIndexOf(self.settings.columns(), item);
                if (columnIndex > -1) {
                    var item = [columnIndex, item.order()];
                    retOrders.push(item);
                }
            });
            return retOrders;
        };

        this.setOrders = function (orders) {
            self.orderColumns.forEach(function (column) {
                column.order(null);
            });
            self.orderColumns.length = 0;
            self.settings.orders.removeAll();
            orders.forEach(function (item) {
                self.settings.orders.push(ko.observable(item));
            });
            self.Search();
        };

        this.loop = function (v1, v2, orderColumnIndex) {
            var result;
            var orderColumn = self.orderColumns[orderColumnIndex];
            var dataType = orderColumn.DataType();
            //处理value
            var a = v1, b = v2;
            var sortKey = orderColumn.Name();
            if (sortKey !== undefined) {
                var tag = a.tagName;
                if (tag !== undefined && tag === "TR") {
                    a = v1.cells[sortKey].innerText;
                    b = v2.cells[sortKey].innerText
                }
                else {
                    a = v1[sortKey];
                    b = v2[sortKey];
                }
            }

            if (dataType == "num") {
                a = +a;
                b = +b;
            }
            if (typeof (a) === "string" && dataType == 'date') {
                a = new Date(a);
            }
            if (typeof (b) === "string" && dataType == 'date') {
                b = new Date(b);
            }

            //区分 valueType
            var typeA = typeof (a);
            var typeB = typeof (b);
            if (typeA === typeB) {
                result = (orderColumn.order() == null || orderColumn.order() !== "desc") ? 1 : -1; //这个是给number的
                if (typeA !== "number" && orderColumn.OtherSort !== undefined) {
                    result = (orderColumn.OtherSort() !== "desc") ? 1 : -1;
                }

                var gtEx = a > b;
                var ltEx = a < b;

                if (typeA === "string") {
                    gtEx = a.localeCompare(b) > 0;
                    ltEx = a.localeCompare(b) < 0;
                }

                if (gtEx) {
                    return result; //return 1 代表转
                }
                else if (ltEx) {
                    return -result;
                }
                else {
                    //打平手的话梯归比下一个，当有多个orderBy
                    orderColumnIndex++;
                    if (self.orderColumns[orderColumnIndex] !== undefined) {
                        return self.loop(v1, v2, orderColumnIndex); //梯归
                    }
                    else {
                        return 0;
                    }
                }
            }
            else {
                //类型不同不能比，就看number要不要去前面就好
                result = (orderColumn.is_numberFirst === undefined || orderColumn.is_numberFirst() === true) ? -1 : 1;
                if (typeA === "number") return result; //a 是number , 如果你要number在前就不要转 -1
                return -result;
            }
        };
        this.GoPage = function (p) {
            self.currentPage(p);
            self.result(self.cacheData.slice(self.skip, self.skip + self.rowCount()));
            self.BuildnavigatePages();
            return true;
        };
        this.GoNext = function () {
            var p = self.currentPage() + 1;
            if (p <= self.pageCount())
                self.GoPage(p);
            return true;
        };
        this.GoPre = function () {
            var p = self.currentPage() - 1;
            if (p > 0)
                self.GoPage(p);
            return true;
        };
        this.GoFirst = function () {
            self.GoPage(1);
            return true;
        };
        this.GoLast = function () {
            self.GoPage(self.pageCount());
            return true;
        };
        this.HasNext = ko.computed(function () { return self.currentPage() < self.pageCount() });
        this.HasPre = ko.computed(function () { return self.currentPage() > 1; });
        this.BuildnavigatePages = function (isReset) {
            if (isReset) {
                self.navigatePages.removeAll();
            }
            var mt = self.pageCount();
            if (mt == 0) return;
            var v = self.navigatePages();
            var m = self.maxNavigatepageCount();
            var c = self.currentPage();
            if (v.length == 0) {
                last = mt > m ? m : mt;
                for (var i = 1; i <= last; i++) {
                    self.navigatePages.push(i);
                }
            }
            else {
                if (c == v[0]) {
                    f1 = parseInt(c - m / 2);
                    if (f1 < 1)
                        f1 = 1;
                    last = f1 + m - 1;
                    if (last > mt)
                        last = mt;
                    self.navigatePages.removeAll();
                    for (var i = f1; i <= last; i++) {
                        self.navigatePages.push(i);
                    }
                }
                else if (c == v[v.length - 1]) {
                    last = parseInt(c + m / 2);
                    if (last > mt)
                        last = mt;
                    f1 = last - (m - 1);
                    if (f1 < 1)
                        f1 = 1;
                    self.navigatePages.removeAll();
                    for (var i = f1; i <= last; i++) {
                        self.navigatePages.push(i);
                    }
                }
                else if (c < v[0]) {
                    last = mt > m ? m : mt;
                    self.navigatePages.removeAll();
                    for (var i = c; i <= last; i++) {
                        self.navigatePages.push(i);
                    }
                }
                else if (c > v[v.length - 1]) {
                    f1 = c - (m - 1);
                    self.navigatePages.removeAll();
                    for (var i = f1; i <= c; i++) {
                        self.navigatePages.push(i);
                    }
                }
            }
        }
        this.currentPage.subscribe(function (newValue) {
            self.skip = self.rowCount() * (newValue - 1);
        });

        this.StringFilterOp = ko.observableArray([
             { Name: '等于', Value: 'eq' },
            { Name: '不等于', Value: 'ne' },
            { Name: '开头是', Value: 'startswith' },
            { Name: '结尾是', Value: 'endswith' },
            { Name: '包含', Value: 'contains' },
            { Name: '不包含', Value: 'not contains' }
        ]);
        this.NumFilterOp = ko.observableArray([
             { Name: '等于', Value: 'eq' },
            { Name: '不等于', Value: 'ne' },
            { Name: '大于', Value: 'gt' },
            { Name: '大于或等于', Value: 'ge' },
            { Name: '小于', Value: 'lt' },
            { Name: '小于或等于', Value: 'le' },
            { Name: '介于', Value: '介于' }
        ]);
        this.DateFilterOp = ko.observableArray([
            { Name: '等于', Value: 'eq' },
           { Name: '不等于', Value: 'ne' },
           { Name: '大于', Value: 'gt' },
           { Name: '大于或等于', Value: 'ge' },
           { Name: '小于', Value: 'lt' },
           { Name: '小于或等于', Value: 'le' },
           { Name: '介于', Value: '介于' }
        ]);

    };

    return f;
});