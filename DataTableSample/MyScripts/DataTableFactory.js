(function ($) {
        'use strict';

        if (typeof $ === 'undefined') { return; }

        $.fn.PTCInitDataTable = function (option) {

            var table = this.DataTable(
                {
                    initComplete: option.initComplete,
                    rowGroup: option.rowGroup,
                    ajax: option.ajax,
                    select: option.select,
                    ordering: option.ordering,
                    lengthMenu: option.lengthMenu,                          // 設定項目選項
                    pageLength: option.pageLength,                          // 預設顯示的頁數
                    responsive: option.responsive,		                    // 開啟自動隨版面寬度調整欄位顯示
                    autoWidth: false,		                                // 關閉自動欄寬自動設定
                    paging: option.paging,			                        // 開啟分頁列
                    info: option.info,                                      // 顯示當前比數與總筆數
                    searching: false,		                                // 關閉搜尋功能
                    columns: option.columns,
                    columnDefs: option.colmDefs,                            // 套用欄位設定
                    processing: false,		                                // 開啟"處理中"指示
                    language: dataTable_lang_TW,                         // 設定翻譯擋
                    deferLoading: 0,                                        // 預設顯示的資料筆數
                    footerCallback: option.footerCallback,
                    serverSide: option.serverSide,
                    scrollX: option.scrollX,
                    drawCallback: option.drawCallback,
                    // 自訂footer樣式
                    "sDom": "<'row'<'col-sm-6'l><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row no-margin'<'col-sm-5'i><'col-sm-7'p>>"
                });

            // 去掉dataTables套件自動加上的col-sm-12以使表格兩側對齊外框 
            //this.parent().removeClass();
            // 自動調整寬度
            //$('.dataTables_wrapper').addClass("table-responsive");
            // 套用 float bar
            //this.floatTableFooter();

            // 當DataTable遠端要完資料
            table.on('xhr.dt', function (e, settings, json, xhr) {

                //window.PTC.Loading(false);      //cancel lodaing...

            });

            return table;

        };

        $.DataTableFactory = function () {

            function DataTableFactory() {
                this.columnDefs = [];
                this.lengthMenu = [[10, 20, 50, 100], [10, 20, 50, 100]];
                this.pageLength = 20;
                this.columns = null;
                this.elem = $("#resultTable");
                this.css = "#resultTable_wrapper";
                this.ordering = false;
                this.table = function () { };
                this.select = { style: 'os', selector: 'td:first-child' };
                this.ajax = null;
                this.rowGroup = null;
                this.paging = false;
                this.info = false;
                this.footerCallback = function () { };
                this.serverSide = false;
                this.responsive = true;
                this.scrollX = false;
                this.selectElement = null;
                this.drawCallback = function () { };
                this.initComplete = function () { };

                this.UpdateTempData = null;
                this.UpdateIndex = null;
                this.UpdateColumnDefs = [];
            };

            /*
                初始化 return DataTable
            */
            DataTableFactory.prototype.Init = function () {

                this.table = this.elem.PTCInitDataTable({
                    colmDefs: this.columnDefs,
                    columns: this.columns,
                    lengthMenu: this.lengthMenu,
                    pageLength: this.pageLength,
                    ordering: this.ordering,
                    paging: this.paging,
                    info: this.info,
                    select: this.select,
                    ajax: this.ajax,
                    rowGroup: this.rowGroup,
                    footerCallback: this.footerCallback,
                    serverSide: this.serverSide,
                    responsive: this.responsive,
                    scrollX: this.scrollX,
                    initComplete: this.initComplete,
                    drawCallback: this.drawCallback,
                });

                //$(this.css).removeClass();
                //$(this.css).children().not($(this.css).children()[1]).remove();

                return this.table;
            };

            /*
                編輯Table
            */

            //取消上一Row編輯狀態
            DataTableFactory.prototype.backopenState = function (rowIndex) {
                var data = this.UpdateTempData;
                if (data == null)
                {
                    return;
                }

                var tableData = this.getAllData()[rowIndex];

                if (typeof (tableData) == "undefined") {
                    return;
                }

                var count = data.length;

                for (var i = 0; i <= count; i++) {
                    tableData[i] = data[i];
                }
                tableData.pop();
                this.resettableData();
            }
            //開啟編輯狀態
            DataTableFactory.prototype.openEdit = function (btn) {
                var rowIndex = this.rowIndexByBtn(btn);
                //將其他編輯模式取消
                this.backopenState(this.UpdateIndex);
                //開啟編輯模式 記住Index
                this.UpdateIndex = rowIndex;
                //取得現在選取的Table資料
                var tableData = this.getAllData()[this.UpdateIndex];
                //將資料存入暫存
                var newArr = [].concat(tableData);
                this.UpdateTempData = newArr;
                //取出資料欄位數
                var count = tableData.length;
                //把td改為設定的input or 預設的 text
                for (var i = 0; i <= count; i++) {
                    if (typeof (this.UpdateColumnDefs[i].render) == "function") {
                        tableData[i] = this.UpdateColumnDefs[i].render();
                    } else {
                        tableData[i] = '<input type="text">';
                    }
                }

                this.resettableData();
            };
            //取消編輯狀態
            DataTableFactory.prototype.cancelEdit = function () {

                //取得現在選取的Table資料
                var tableData = this.getAllData()[this.UpdateIndex];
                //取出資料欄位數
                var count = this.UpdateTempData.length;
                //將原本的Table資料填回Table
                for (var i = 0; i <= count; i++) {
                    tableData[i] = this.UpdateTempData[i];
                }
                tableData.pop();
                //將暫存的Table指回NULL
                this.UpdateTempData = null;
                //重整Table
                this.resettableData();
            };
            //編輯儲存資料
            DataTableFactory.prototype.saveUpdateData = function () {

                var rows = this.elem.find("tr")[this.UpdateIndex + 1];

                var data = $(rows).find("td input:text,td select");

                var tableData = this.getAllData()[this.UpdateIndex];

                var count = data.length;

                for (var i = 0; i <= count; i++) {
                    if (data[i]) {
                        tableData[i] = $(data[i]).val();
                    } else
                    {
                        tableData[i] = this.UpdateTempData[i];
                    }
                  
                }
                this.UpdateIndex = null;
                this.resettableData();
          
            };
            //更新全部
            DataTableFactory.prototype.UpdateTableDataRange = function (data) {

                var rowIndex = this.rowIndexByBtn(this.selectElement);

                if (data.length != this.table.rows().data()[rowIndex].length) {
                    throw {
                        name: "Error",
                        message: "data row count != table row count"
                    };
                }

                this.table.rows().invalidate();

                var tableData = [];

                this.table.rows().every(function () {
                    tableData.push(this.data());
                });

                for (var i = 0; i < data.length; i++) {

                    tableData[rowIndex][i] = data[i];
                }

            };

            /*
                新增Table
            */

            //增加一列
            DataTableFactory.prototype.add = function (arr) {
                this.table.row.add(arr).draw();
            };
            //增加多列
            DataTableFactory.prototype.addRange = function (arr) {
                arr.forEach(function (e) {
                    this.table.row.add(e).draw();
                });
            };

            /*
                移除Table
            */

            //移除一列
            DataTableFactory.prototype.remove = function (btn) {
                this.elem.dataTable().fnDeleteRow($(btn).closest('tr')[0]);
            };
            //清除Table
            DataTableFactory.prototype.clear = function () {
                this.table.clear().draw();
            };

            /*
                取得tableData
            */

            //取得Table所有input資料
            DataTableFactory.prototype.getInputData = function () {
                return this.table.$('input, select');
            };
            //取得table所有checkbox選取的資料
            DataTableFactory.prototype.getCheckedInputData = function () {
                var arr = [];
                this.table.$('input[type="checkbox"]').each(function (e) {

                    if (this.checked) {
                        arr.push(this.value);
                    }
                });
                return arr;
            };
            //取得Input資料
            DataTableFactory.prototype.getCheckedInputAllData = function () {

                var arr = this.getCheckedInputData();

                this.table.rows().invalidate();

                var result = [];

                this.table.rows().every(function (element, index, array) {
                    if (arr.findForIE(function (x) { return x == element; })) {
                        result.push(this.data());
                    }
                });
                return result;
            };
            //取得所有資料 => for修改
            DataTableFactory.prototype.getAllData = function () {
                this.table.rows().invalidate();
                var arr = [];
                this.table.rows().every(function () {
                    arr.push(this.data());
                });
                return arr;
            };
            //取得所有資料 => for查詢
            DataTableFactory.prototype.getAllDataNotInvalidate = function () {

                var arr = [];
                this.table.rows().every(function () {
                    arr.push(this.data());
                });
                return arr;
            };
            //取得該欄資料
            DataTableFactory.prototype.getIndexData = function (index) {
                var arr = [];
                this.table.rows().every(function () {
                    var tablerow = this.data();
                    arr.push(tablerow[index]);
                });
                return arr;
            };

            /*
                取得Row相關
            */

            //取得Row數
            DataTableFactory.prototype.count = function () {
                return this.table.rows().count();
            };
            //用Button取得Row索引
            DataTableFactory.prototype.rowIndexByBtn = function (btn) {
                return this.table.row($(btn).closest("tr")).index();
            };

            /*
                table Detail
            */

            //DetailClick
            DataTableFactory.prototype.detailClick = function (btn, callBack, detailRows) {

                var tr = btn.closest('tr');
                var row = this.table.row(tr);
                var idx = $.inArray(tr.attr('id'), detailRows);

                if (row.child.isShown()) {
                    tr.removeClass('details');
                    row.child.hide();

                    // Remove from the 'open' array
                    detailRows.splice(idx, 1);
                }
                else {
                    tr.addClass('details');
                    row.child(callBack(row.data())).show();

                    // Add to the 'open' array
                    if (idx === -1) {
                        detailRows.push(tr.attr('id'));
                    }
                }
                return detailRows;
            };
            //關閉明細
            DataTableFactory.prototype.closerowdetail = function () {

                this.table.rows('.parent').nodes().to$().find('td:first-child').trigger('click');
            };

            //表格顏色
            DataTableFactory.prototype.addcolor = function (color) {
                this.elem.children('tbody').children('tr').children('td,th').css('background-color', 'initial');
                $(this.selectElement).closest('tr').children('td,th').css('background-color', color);
            };
            //查詢 => ajax
            DataTableFactory.prototype.search = function () {
                this.table.ajax.reload();
            };
            //重新整理table => for 新增刪除Row or sort
            DataTableFactory.prototype.rebuild = function () {
                this.table.draw();
            };
            //重新讀取table數據
            DataTableFactory.prototype.resettableData = function () {
                this.table.rows().invalidate();
            };
            //排序
            DataTableFactory.prototype.orderBy = function () {
                this.table.order([[0, 'asc']]).draw();
            };
            //checkbox選取所有資料
            DataTableFactory.prototype.CheckBoxSelectAll = function (element, arr) {

                //當前頁面全資料
                var rows = this.table.rows({ page: 'current' }).nodes();

                //所有頁面全資料
                //var rows = this.table.rows({ 'search': 'applied' }).nodes();

                if (typeof arr != "undefined") {
                    arr.forEach(function (index) {

                        $('input[type="checkbox"]', rows[index]).prop('checked', element.checked);
                    });
                } else {
                    $('input[type="checkbox"]', rows).prop('checked', element.checked);
                }

            };

            //建立工廠
            DataTableFactory.factory = function (type) {
                var constr = type, newDataTable;

                if (typeof DataTableFactory[constr] !== "function") {
                    throw {
                        name: "Error",
                        message: constr + "dosen't exist"
                    };
                }

                if (typeof DataTableFactory[constr].prototype !== "function") {
                    DataTableFactory[constr].prototype = new DataTableFactory();
                }
                newDataTable = new DataTableFactory[constr]();
                return newDataTable;
            };

            return DataTableFactory;
        };

    })(jQuery);
