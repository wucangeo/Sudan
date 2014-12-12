/**
 * Created by WUCAN on 2014/11/6.
 */

var mapURL_sudan = "http://localhost:6080/arcgis/rest/services/sudan/MapServer";
var mapURL_sudan_FeatureLayer = "http://localhost:6080/arcgis/rest/services/sudan/FeatureServer";

var map;
var layersServices;
var layerVisibleArr = [];
var mapLayerInfosArr = [];     //图层信息

var currentLayerName = "图层名称";  //当前正操作的图层名称
//图层标注
var currentOptLayerId = -1;    //记录右键点击的图层id
var layerFieldsInfo;            //图层字段列表
var layerFieldsSource = [];     //图层字段dropdown显示
var labelsToLayer;                 //标注图层
var layerToLabels;               //待显示的标注层
var renderLayer;                //需要渲染的图层

//图层属性表
var attributeArray = [];    //图层属性
var singleRenderLayerAttributeArray = [];      //存储查询到的feature，用于定位

//图层渲染
var preOptLayerId = -1;         //前一个操作的图层id
var colorRampArray = [          //唯一值渲染颜色带 取色网站：http://www.pixelfor.me/crc
    {colorKey: "ff000000ff00", colorRamp: ["#ff0000", "#00ff00"]},
    {colorKey: "ff00000000ff", colorRamp: ["#ff0000", "#0000ff"]},
    {colorKey: "0603050", colorRamp: ["#000F07", "#013A01", "#316300", "#8C8C00", "#B75B00", "#E00000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00", "#07FF83", "#35FFFF", "#60AFFF", "#8787FF", "#D8B2FF", "#FFDDFF"]},
    {colorKey: "1203050", colorRamp: ["#070F00", "#3A3A01", "#633100", "#8C0000", "#B75B00", "#E0E000", "#7FFF00", "#00FF00", "#00FF7F", "#00FFFF", "#0783FF", "#3535FF", "#AF60FF", "#FF87FF", "#FFB2D8", "#FFDDDD"]},
    {colorKey: "1803050", colorRamp: ["#0F0700", "#3A0101", "#633100", "#8C8C00", "#5BB700", "#00E000", "#00FF7F", "#00FFFF", "#007FFF", "#0000FF", "#8307FF", "#FF35FF", "#FF60AF", "#FF8787", "#FFD8B2", "#FFFFDD"]},
    {colorKey: "2403050", colorRamp: ["#0F0700", "#3A3A01", "#316300", "#008C00", "#00B75B", "#00E0E0", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF0783", "#FF3535", "#FFAF60", "#FFFF87", "#D8FFB2", "#DDFFDD"]},
    {colorKey: "3003050", colorRamp: ["#070F00", "#013A01", "#006331", "#008C8C", "#005BB7", "#0000E0", "#7F00FF", "#FF00FF", "#FF007F", "#FF0000", "#FF8307", "#FFFF35", "#AFFF60", "#87FF87", "#B2FFD8", "#DDFFFF"]},
    {colorKey: "3603050", colorRamp: ["#000F07", "#013A3A", "#003163", "#00008C", "#5B00B7", "#E000E0", "#FF007F", "#FF0000", "#FF7F00", "#FFFF00", "#83FF07", "#35FF35", "#60FFAF", "#87FFFF", "#B2D8FF", "#DDDDFF"]}
];
var symbolRenderFeatureType = " ";
var canvasId = "canvasColorRamp";   //canvas的名称
var colorRampHtmlArray = [];          //存储Canvas的html代码
var uniqueRenderLayerAttributeArray = [];       //图层的属性表
var uniqueAttrStatisticByFieldNameArray = [];        //按照字段名称统计内容个数
var uniqueRenderGridData = new Array();         //用于显示在grid中的数据
var uniqueRenderFeatureLayer;       //唯一值渲染要素图层
var uniqueRenderGridClickPosition = {}; //在表格中点击的位置，相对于整个body
var uniqueCurrOptRowIndex = -1;       //当前正在操作的行index
var uniqueColorArrayToRender = new Array();     //待渲染的颜色数组

require([
        "esri/map",
        "esri/request",
        "esri/Color",
        "esri/InfoTemplate",
        "esri/layers/FeatureLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/LabelLayer",
        "esri/geometry/Extent",


        "esri/renderers/SimpleRenderer",
        "esri/renderers/UniqueValueRenderer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",

        "esri/tasks/query",
        "esri/tasks/QueryTask",

        "dojo/dom",
        "dojo/on",
        "dojo/query",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/_base/json",
        "dojo/string",
        "dojo/domReady!"], function (Map, esriRequest, Color, InfoTemplate, FeatureLayer, ArcGISDynamicMapServiceLayer, LabelLayer, Extent, SimpleRenderer, UniqueValueRenderer, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol, Query, QueryTask, dom, on, query, arrayUtils, domClass, dojoJson, dojoString) {
        map = new Map("sudan_mapDiv", {
            logo: false
        });

        dojo.addOnLoad(initMap);

        on(map, "load", function () {
            console.log("Map load event");
            // Hook up jQuery
            //$(document).ready(jQueryReady);
        });

        on(map, "layer-add", function () {
            console.log("Map layer-add event");
        });

        on(map, "extent-change", function () {
            console.log("extent-change event");
        });

        function initMap() {
            //添加背景图层-----------
            layersServices = new esri.layers.ArcGISDynamicMapServiceLayer(mapURL_sudan);
            //var layer = new FeatureLayer(mapURL_sudan_FeatureLayer+"/1");
            //map.addLayer(layer);
            layersServices.on("load", buildLayerList);
            map.addLayer(layersServices);
        }

        function buildLayerList() {
            var childrenLayerIndex = 0;  //
            var childrenLayerCount = 1000;
            var layerHtml = "<ul>";
            arrayUtils.map(layersServices.layerInfos, function (info, index) {
                mapLayerInfosArr.push(info);    //地图图层信息arr
                if (childrenLayerIndex > childrenLayerCount) { //包含图层组
                    layerHtml += "</ul></li>";    //如果是图层组，则添加ul标签
                }
                layerHtml += "<li ";
                if (info.defaultVisibility) {
                    layerVisibleArr.push(info.id);
                }
                layerHtml += "item-checked='" + info.defaultVisibility + "'";       //图层可见性
                layerHtml += " item-expanded='true' id = '" + info.id + "'>" + info.name;   //图层id及name

                if (info.subLayerIds) {   //如果图层包含下一层级
                    layerHtml += "<ul>";
                    childrenLayerIndex = 0;
                    childrenLayerCount = info.subLayerIds.length + info.id;
                }
                childrenLayerIndex++;

//                //作为FeatureLayer添加
//                var layer = new FeatureLayer(mapURL_sudan_FeatureLayer + "/" + index, {
//                    mode: FeatureLayer.MODE_SELECTION,
//                    id: info.name,
//                    outFields: ["*"]
//                });
//                map.addLayer(layer);

                return layerHtml;
            });
            layerHtml += "</ul>"

            var ll = dom.byId("sudan_layerListDiv");
            ll.innerHTML = layerHtml;

            //开始执行jQuery
            $(document).ready(function (e) {
                // create jqxTree
                $('#sudan_layerListDiv').jqxTree({ hasThreeStates: true, checkboxes: true});
                $('#sudan_layerListDiv').css('visibility', 'visible');

                //创建唯一值渲染色带
                setColorRampDropDownList();

                //create context menu
                var contextMenu = $("#jqxMenu").jqxMenu({ width: '120px', height: '84px', autoOpenPopup: false, mode: 'popup' });


                //右键菜单======================================================================
                var attachContextMenu = function () {
                    // open the context menu when the user presses the mouse right button.
                    $("#sudan_layerListDiv li").on('mousedown', function (event) {
                        var target = $(event.target).parents('li:first')[0];
                        //记录右键点击的图层id
                        currentOptLayerId = target.id;
                        layerFieldsInfo = getLayerFiledListContent(currentOptLayerId);     //取得图层字段列表

                        //判断是否为右键菜单
                        var rightClick = isRightClick(event);
                        if (rightClick && target != null) {
                            $("#sudan_layerListDiv").jqxTree('selectItem', target);
                            currentLayerName = target.innerText;    //记录当前操作的图层名称

                            var scrollTop = $(window).scrollTop();
                            var scrollLeft = $(window).scrollLeft();

                            contextMenu.jqxMenu('open', parseInt(event.clientX) + 5 + scrollLeft, parseInt(event.clientY) + 5 + scrollTop);
                            return false;
                        }
                    });
                }
                attachContextMenu();
                $("#jqxMenu").on('itemclick', function (event) {
                    var item = $.trim(event.args.id);
                    switch (item) {
                        //查看图层属性表
                        case "openAttrTable":
                            if (!$('#attributeWindow').jqxWindow('isOpen')) {
                                $('#attributeWindow').jqxWindow('open');
                            }
                            getLayerAttributeArr();
                            $('#attributeContainerTitle').text(currentLayerName);   //设置当前图层名称
                            break;
                        //设置图层标注
                        case "setLabelField":
                            $('#labelSettingWindow').jqxWindow('open');
                            setFieldsListDropDown();
                            $("#labelSettingCurLayerName").text(currentLayerName); //选择的图层
                            break;
                        //设置图层渲染
                        case "setRenderSymbol":
                            getCurrLayerAttribute();        //取得当前图层的属性表
                            $('#symbolRenderWindow').jqxWindow('open');
                            setUniqueRenderFieldsListDropDown();        //设置唯一值渲染字段

                            break;
                    }
                });

                // disable the default browser's context menu.
                $(document).on('contextmenu', function (e) {
                    if ($(e.target).parents('.jqx-tree').length > 0) {
                        return false;
                    }
                    return true;
                });

                function isRightClick(event) {
                    var rightclick;
                    if (!event) var event = window.event;
                    if (event.which) rightclick = (event.which == 3);
                    else if (event.button) rightclick = (event.button == 2);
                    return rightclick;
                }

                //初始化jqx控件
                labelSettingWindow.init();  //标注面板初始化
                symbolRenderWindow.init();  //符号渲染面板初始化
                attributeWindow.init();     //图层属性窗体初始化

                $('#sudan_layerListDiv').on('checkChange', function (event) {
                    var args = event.args;
                    var item = $('#sudan_layerListDiv').jqxTree('getItem', args.element);
                    //$('#textDiv').jqxPanel('prepend', '<div style="margin-top: 5px;">Selected: ' + item.label + '</div>');
                    updateLayerVisibility();
                });

                //唯一值渲染grid点击位置
                $("#uniqueRenderSymbolsGrid").click(function (e) {
                    uniqueRenderGridClickPosition["x"] = e.pageX;
                    uniqueRenderGridClickPosition["y"] = e.pageY;
                });

            });

            layersServices.setVisibleLayers(layerVisibleArr);
        }

        //更新图层可见设置
        function updateLayerVisibility() {
            var checkedItems = $('#sudan_layerListDiv').jqxTree('getItems');
            var visible = [];

            arrayUtils.forEach(checkedItems, function (item) {
                if (item.checked) {
                    visible.push(item.id);
                }
            });
            //if there aren't any layers visible set the array to be -1
            if (visible.length === 0) {
                visible.push(-1);
            }
            layersServices.setVisibleLayers(visible);
        }

        //标注设置window===========================================================================================
        var labelSettingWindow = (function () {
            //各控件事件
            function _addEventListeners() {
                //显示文本标注层事件
                $("#showLabelCheckBox").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        $("#labelFieldDropDownList").jqxDropDownList({disabled: false});
                        $("#labelColorDropDown").jqxDropDownButton({disabled: false});
                        $("#setLabelSizeDropDown").jqxDropDownList({disabled: false});
                    }
                    else {
                        $("#labelFieldDropDownList").jqxDropDownList({disabled: true});
                        $("#labelColorDropDown").jqxDropDownButton({disabled: true});
                        $("#setLabelSizeDropDown").jqxDropDownList({disabled: true});
                    }
                });
                //显示文本标注-确定-事件
                $('#showLabelSubmitButton').on('click', function () {
                    setLabelLayer();    //设置标注图层
                });
                //显示文本标注-取消-事件
                $('#showLabelCancelButton').on('click', function () {
                    $('#labelSettingWindow').jqxWindow('close');
                });
                //打开windows事件
                $('#labelSettingWindow').on('open', function (event) {
                    setFieldsListDropDown();
                });
                //颜色选择事件
                $('#setLabelColorPicker').bind('colorchange', function (event) {
                    var color = event.args.color;
                    $("#labelColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(color));
                });
            };
            var source_Fileds = ["初始化字段"];
            var source_LabelSize = [30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

            function _createElements() {
                $('#labelSettingWindow').jqxWindow({
                    width: 250, height: 260, resizable: false, autoOpen: false, position: {x: 250, y: 130},

                    initContent: function () {
                        $('#showLabelCheckBox').jqxCheckBox({ width: '150px' });
                        $("#labelFieldDropDownList").jqxDropDownList({ source: source_Fileds, selectedIndex: 0, width: '230', height: '25', disabled: true});
                        $('#showLabelSubmitButton').jqxButton({ width: '80px', disabled: false });
                        $('#showLabelCancelButton').jqxButton({ width: '80px', disabled: false });
                        $("#setLabelColorPicker").jqxColorPicker({ color: "0000ff", colorMode: 'hue', width: 220, height: 220});
                        $("#labelColorDropDown").jqxDropDownButton({ width: '150px', height: '25px', disabled: true});
                        $("#labelColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(new $.jqx.color({ hex: "0000ff" })));
                        $("#setLabelSizeDropDown").jqxDropDownList({ source: source_LabelSize, selectedIndex: 9, width: '150px', height: '25px', disabled: true})
                    }
                });
            };
            return {
                init: function () {
                    _createElements();
                    _addEventListeners();
                }
            };

        }());

        //取得标注颜色
        function getLabelColorByDropDown(color) {
            if (color == 'transparent' || color.hex == "") {
                return $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>transparent</div>");
            }
            var element = $("<div style='text-shadow: none; position: relative; padding-bottom: 2px; margin-top: 2px;'>#" + color.hex + "</div>");
            var nThreshold = 105;
            var bgDelta = (color.r * 0.299) + (color.g * 0.587) + (color.b * 0.114);
            var foreColor = (255 - bgDelta < nThreshold) ? 'Black' : 'White';
            element.css('color', foreColor);
            element.css('background', "#" + color.hex);
            element.addClass('jqx-rc-all');
            return element;
        }

        //设置字段下拉列表
        function setFieldsListDropDown() {
            layerFieldsSource = [];
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                layerFieldsSource.push("无法获取图层信息");
            } else {
                for (var index = 0; index < layerFieldsInfo.length; index++) {
                    layerFieldsSource.push(layerFieldsInfo[index][1]);
                }
            }
            $("#labelFieldDropDownList").jqxDropDownList({ source: layerFieldsSource});
            $("#labelFieldDropDownList").jqxDropDownList('selectIndex', 0);
        }

        //设置标注图层
        function setLabelLayer() {
            //移除之前显示的标注图层
            if (labelsToLayer) {
                map.removeLayer(labelsToLayer);
            }
            if (layerToLabels) {
                map.removeLayer(layerToLabels);
            }
            //如果未选中“显示标注”，则返回
            if (!$('#showLabelCheckBox').jqxCheckBox('checked')) {
                return;
            }
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                alert("未获取到图层字段信息。")
                return;
            }
            //取得设置信息
            var selectDropIndex = $("#labelFieldDropDownList").jqxDropDownList('getSelectedIndex');
            var labelField = layerFieldsInfo[selectDropIndex][0];
            //var labelColor = $("#labelColorDropDown").jqxDropDownButton('getContent')[0].innerText;
            var labelColor = $("#setLabelColorPicker").jqxColorPicker('getColor');
            var labelSize = $("#setLabelSizeDropDown").jqxDropDownList('val');

            // 设置符号
            var statesColor = new Color(labelColor);
            var statesLabel = new TextSymbol().setColor(statesColor);
            statesLabel.font.setSize(labelSize);
            statesLabel.font.setFamily("arial");
            var statesLabelRenderer = new SimpleRenderer(statesLabel);
            labelsToLayer = new LabelLayer({ id: "labels" });
            //设置图层
            var layerURL = mapURL_sudan + "/" + currentOptLayerId;
            layerToLabels = new FeatureLayer(layerURL, {
                id: "labelLayer",
                outFields: [labelField],
                opacity: 0
            });
            map.addLayer(layerToLabels, currentOptLayerId - 1);

            // tell the label layer to label the countries feature layer
            // using the field named "admin"
            labelsToLayer.addFeatureLayer(layerToLabels, statesLabelRenderer, "{" + labelField + "}");
            // add the label layer to the map
            map.addLayer(labelsToLayer);
        }

        //符号渲染window-=================================================================================
        var symbolRenderWindow = (function () {
            //各控件事件
            function _addEventListeners() {
                $("#jqxTabsSymbolRender").on('selected', function (event) {
                    var tabIndex = event.args.item;
                    if (tabIndex == "0") {

                    } else if (tabIndex == "1") {

                    }
                });
                //颜色选择事件
                $('#setSingleSymbolColorPicker').bind('colorchange', function (event) {
                    var color = event.args.color;
                    $("#SingleSymbolColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(color));
                });
                $('#setSingleSymbolColorOutlinePicker').bind('colorchange', function (event) {
                    var color = event.args.color;
                    $("#SingleSymbolColorOutlineDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(color));
                });

                //字段选择事件
                $("#uniqueRenderFieldDropDownList").on('select', function (event) {
                    var fieldName = $('#uniqueRenderFieldDropDownList').val();
                    uniqueValueSelectedFieldEvent(fieldName);
                });
                //色带事件
                $('#uniqueRenderColorRampDropDownList').on('open', function (event) {
                    //setColorRampDropDownList();                 //设置唯一值渲染色带

                });
                $('#uniqueRenderColorRampDropDownList').on('select', function (event) {
                    var fieldName = $('#uniqueRenderFieldDropDownList').val();
                    uniqueValueSelectedFieldEvent(fieldName);
                });
                //grid中的颜色设置
                $("#uniqueRenderSymbolsGrid").on('cellclick', function (event) {
                    var rowIndex = event.args.rowindex;
                    uniqueCurrOptRowIndex = rowIndex;
                    var renderWindowPosition = $("#symbolRenderWindow").jqxWindow('position');
                    var renderWindowWidth = $("#symbolRenderWindow").jqxWindow('width');

                    $("#ColorPickerWidgetWindow").jqxWindow({
                        position: {x: renderWindowPosition.x + renderWindowWidth + 2, y: renderWindowPosition.y + 190}
                    });
                    $("#ColorPickerWidgetWindow").jqxWindow('open');
                    var rgbColor = $("#uniqueRenderGridRow" + rowIndex).css("backgroundColor");
                    var hexColor = hexValOfRGB(rgbColor);
                    $("#uniqueRenderColorPicker").jqxColorPicker('setColor', hexColor);
                });
                $("#uniqueRenderColorPicker").bind('colorchange', function (event) {
                    if (uniqueCurrOptRowIndex != -1) {
                        var color = event.args.color;
                        var rowId = "#uniqueRenderGridRow" + uniqueCurrOptRowIndex;
                        $(rowId).css("background-color", "#" + color.hex);
                        if (uniqueCurrOptRowIndex > uniqueColorArrayToRender.length) {
                            return;
                        }
                        uniqueColorArrayToRender[uniqueCurrOptRowIndex] = "#" + color.hex;
                    }
                });
                //确定
                $("#symbolRenderSubmitButton").on('click', function () {
                    if (uniqueRenderFeatureLayer) {
                        map.removeLayer(uniqueRenderFeatureLayer);
                    }
                    setLayerSymbolRender();
                });
                //取消
                $("#symbolRenderCancelButton").on('click', function () {
                    $('#symbolRenderWindow').jqxWindow('close');
                    map.removeLayer(uniqueRenderFeatureLayer);
                    map.graphics.clear();
                });

                //打开关闭windows事件
                $('#symbolRenderWindow').on('open', function (event) {
                    setUniqueRenderFieldsListDropDown();        //设置唯一值渲染字段
                });
            };
            var source_LabelSize = ["初始项"];
            var source_renderFields = ["初始项"];

            var source_ColorRamp = {
                localdata: colorRampArray,
                datatype: "array"
            };
            var colorRampDataAdapt = new $.jqx.dataAdapter(source_ColorRamp);

            function _createElements() {
                $('#symbolRenderWindow').jqxWindow({
                    width: 350, height: 410, resizable: false, autoOpen: false, position: {x: 250, y: 130},
                    initContent: function () {
                        $("#jqxTabsSymbolRender").jqxTabs({height: 290, width: 335});
                        //单一符号
                        $("#SingleSymbolRenderPanel").jqxPanel({ width: 310, height: 125, disabled: true});

                        $("#setSingleSymbolColorPicker").jqxColorPicker({ color: "137013", colorMode: 'hue', width: 220, height: 220});
                        $("#SingleSymbolColorDropDown").jqxDropDownButton({ width: '180px', height: '25px'});
                        $("#SingleSymbolColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(new $.jqx.color({ hex: "137013" })));

                        $("#setSingleSymbolColorOutlinePicker").jqxColorPicker({ color: "ff0000", colorMode: 'hue', width: 220, height: 220});
                        $("#SingleSymbolColorOutlineDropDown").jqxDropDownButton({ width: '180px', height: '25px'});
                        $("#SingleSymbolColorOutlineDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(new $.jqx.color({ hex: "ff0000" })));

                        $("#setSingleSymbolSizeNumber").jqxNumberInput({  width: '180px', height: '25px', disabled: false,
                            inputMode: 'simple', spinButtons: true, decimalDigits: 0});
                        $("#setSingleSymbolSizeNumber").jqxNumberInput('val', 3); //设置默认值
                        //唯一值
                        $("#uniqueValueRenderPanel").jqxPanel({ width: 310, height: 240, disabled: true});
                        $("#uniqueRenderFieldDropDownList").jqxDropDownList({ source: source_renderFields, selectedIndex: 1, width: '180', height: '25', disabled: false});
                        $("#uniqueRenderColorRampDropDownList").jqxDropDownList({ source: colorRampHtmlArray, selectedIndex: 1, width: '180', height: '25', disabled: false,
                            renderer: function (index, label, value) {
                                return colorRampHtmlArray[index];
                            }
                        });
                        $("#ColorPickerWidgetWindow").jqxWindow({
                            width: 220, height: 245, autoOpen: false, title: "符号颜色设置"
                        });
                        $("#uniqueRenderColorPicker").jqxColorPicker({ color: "#FF0000", colorMode: 'saturation', width: 190, height: 190});

                        $('#symbolRenderSubmitButton').jqxButton({ width: '80px', disabled: false });
                        $('#symbolRenderCancelButton').jqxButton({ width: '80px', disabled: false });
                        $("#uniqueRenderSymbolsGrid").jqxGrid({
                            width: 290,
                            height: 160,
                            columnsresize: true,
                            pageable: true,
                            sortable: true,
                            //selectionmode:'singlecell',
                            columns: [
                                { text: '符号', datafield: "symbol", width: 60,
                                    cellsrenderer: function (row, columnfield, value, dafaulthtml, columnproperties) {
                                        var hex = "#FFFFFF";
                                        if (uniqueColorArrayToRender.length >= row) {
                                            var hex = uniqueColorArrayToRender[row]
                                        }
                                        return '<div id = "uniqueRenderGridRow' + row + '"style = "width:100%;height:100%;background-color:' + hex + ';"></div>';
                                    }
                                },
                                { text: '值', datafield: "value", width: 150 },
                                { text: '个数', datafield: "count", width: 60 }
                            ],
                            ready: function () {
                            }
                        });
                    }
                });
            };
            return {
                init: function () {
                    _createElements();
                    _addEventListeners();
                }
            };
        }());

        //设置字段下拉列表
        function setUniqueRenderFieldsListDropDown() {
            layerFieldsSource = [];
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                layerFieldsSource.push("无法获取图层信息");
            } else {
                for (var index = 0; index < layerFieldsInfo.length; index++) {
                    layerFieldsSource.push(layerFieldsInfo[index][1]);
                }
            }
            $("#uniqueRenderFieldDropDownList").jqxDropDownList({ source: layerFieldsSource});
            $("#uniqueRenderFieldDropDownList").jqxDropDownList('selectIndex', 0);
        }

        //开始符号渲染
        function setLayerSymbolRender() {
            map.graphics.clear();
            //移除已经渲染的图层
            if (renderLayer) {
                map.removeLayer(renderLayer);
            }
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                return;
            }

            //单一值渲染
            if ($("#jqxTabsSymbolRender").val() == "0") {
                var symbolColor = $("#setSingleSymbolColorPicker").jqxColorPicker('getColor');
                symbolColor.a = 1;  //恢复默认颜色透明度为1
                var symbolColorOutline = $("#setSingleSymbolColorOutlinePicker").jqxColorPicker('getColor');
                var symbolSize = $("#setSingleSymbolSizeNumber").jqxNumberInput('val');

                singleRenderLayerAttributeArray = new Array();     //存储查询到的所有feature，用于定位

                //查询要素并渲染
                var queryTask = new QueryTask(mapURL_sudan + "/" + currentOptLayerId);  //当前图层url
                var query = new Query();
                query.returnGeometry = true;
                query.outFields = ["*"];
                query.where = "1=1";  //即获取全部数据
                queryTask.execute(query, showResults);

                function showResults(results) {
                    var resultCount = results.features.length;
                    for (var i = 0; i < resultCount; i++) {
                        var feature = results.features[i];
                        var featureType = feature.geometry.type;
                        //渲染要素
                        feature.setSymbol(setFeatureSymbol(featureType, symbolSize, symbolColor, symbolColorOutline));
                        map.graphics.add(feature);
                    }

                    if (preOptLayerId != currentOptLayerId) {
                        var extent = esri.graphicsExtent(map.graphics.graphics);
                        map.setExtent(extent.expand(1.5), true);
                        preOptLayerId = currentOptLayerId;
                    }
                }
            }
            //唯一值渲染
            else if ($("#jqxTabsSymbolRender").val() == "1") {
                var fieldName = $("#uniqueRenderFieldDropDownList").val();
                var defaultSymbol;
                switch (symbolRenderFeatureType) {
                    case "point":
                    case "multipoint":
                        defaultSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 1]), 1),
                            new Color([255, 0, 0, 1])
                        );
                        break;
                    case "polyline":
                        defaultSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 1]), 5);
                        break;
                    case "polygon":
                        defaultSymbol = new SimpleFillSymbol().setColor(new Color([255, 0, 0, 0.5]));
                        break;
                }

                var renderer = new UniqueValueRenderer(defaultSymbol, fieldName);
                if (uniqueRenderGridData.length == 0) {
                    return;
                }

                for (var i in uniqueRenderGridData) {
                    var record = uniqueRenderGridData[i];   //取得字段内容
                    if (uniqueColorArrayToRender.length < i) {
                        break;
                    }

                    var renderColor = hex2rgb(uniqueColorArrayToRender[i]);
                    if (renderColor) {
                        var renderSymbol;
                        //设置渲染符号
                        switch (symbolRenderFeatureType) {
                            case "point":
                            case "multipoint":
                                renderSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 15,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 1]), 1),
                                    new Color(renderColor)
                                );
                                break;
                            case "polyline":
                                renderSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(renderColor), 5);
                                break;
                            case "polygon":
                                renderColor.a = 0.5;    //设置透明度
                                renderSymbol = new SimpleFillSymbol().setColor(new Color(renderColor));
                                break;
                        }
                        renderer.addValue(record.value, renderSymbol);
                    }
                }
                uniqueRenderFeatureLayer = new FeatureLayer(mapURL_sudan_FeatureLayer + "/" + currentOptLayerId, {
                    //infoTemplate: new InfoTemplate(" ", fieldName),
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"]
                });
                uniqueRenderFeatureLayer.setRenderer(renderer);
                map.addLayer(uniqueRenderFeatureLayer);

//                var extent = uniqueRenderFeatureLayer.fullExtent;
//                map.setExtent(extent);
            }
        }

        //唯一值渲染字段选择后，计算数据并显示
        function uniqueValueSelectedFieldEvent(fieldName) {
            uniqueAttrStatisticByFieldNameArray = new Array();
            uniqueColorArrayToRender = new Array();

            if (uniqueRenderLayerAttributeArray.length == 0) {
                return;
            }
            //统计值的个数
            for (var i in uniqueRenderLayerAttributeArray) {
                var featureAttr = uniqueRenderLayerAttributeArray[i];
                var value = featureAttr[fieldName];
                if (!value) {
                    continue;
                }
                if (uniqueAttrStatisticByFieldNameArray[value]) {
                    uniqueAttrStatisticByFieldNameArray[value] += 1;
                } else {
                    uniqueAttrStatisticByFieldNameArray[value] = 1;
                }
            }
            uniqueRenderGridData = new Array();
            //将统计结果push进数组
            for (var key in uniqueAttrStatisticByFieldNameArray) {
                var value = uniqueAttrStatisticByFieldNameArray[key];
                if (value) {
                    var row = {};
                    row["value"] = key;
                    row["count"] = value;
                    uniqueRenderGridData.push(row);
                }
            }
            //从色带中抽取颜色值，放入数组
            var colorRampIndex = $("#uniqueRenderColorRampDropDownList").jqxDropDownList('getSelectedIndex');
            var colorRampRecord = colorRampArray[colorRampIndex];

            //如果是渐变色
            if (colorRampRecord) {
                var colorRampLength = colorRampRecord.colorRamp.length;
                if (colorRampLength == 2) {
                    for (var row in uniqueRenderGridData) {
                        var color = getColorFromToColor(row, colorRampRecord.colorRamp[0], colorRampRecord.colorRamp[1]);
                        var hex = rgbToHex(color.r, color.g, color.b);
                        //填充颜色数组，待渲染
                        uniqueColorArrayToRender.push(hex);
                    }
                } else if (colorRampLength > 2) {
                    for (var row in uniqueRenderGridData) {
                        var hex = colorRampRecord.colorRamp[row%colorRampLength];
                        //var hex = rgbToHex(color.r, color.g, color.b);
                        //填充颜色数组，待渲染
                        uniqueColorArrayToRender.push(hex);
                    }
                }
            }
            //设置grid数据
            var source = {
                localdata: uniqueRenderGridData,
                datatype: "array",
                dataField: [
                    {name: 'symbol', type: 'string'},
                    {name: 'value', type: 'string'},
                    {name: 'count', type: 'number'}
                ]
            };

            var dataAdapter = new $.jqx.dataAdapter(source);
            $("#uniqueRenderSymbolsGrid").jqxGrid({
                source: dataAdapter
            });

        }

        //取得图层的属性表
        function getCurrLayerAttribute() {
            uniqueRenderLayerAttributeArray = new Array();
            //查询要素并渲染
            var queryTask = new QueryTask(mapURL_sudan + "/" + currentOptLayerId);  //当前图层url
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.where = "1=1";  //即获取全部数据
            queryTask.execute(query, showResults);

            function showResults(results) {
                var resultCount = results.features.length;
                var featureType;
                for (var i = 0; i < resultCount; i++) {
                    var feature = results.features[i];
                    featureType = feature.geometry.type;
                    var attr = feature.attributes;
                    attr["Shape"] = featureType;
                    uniqueRenderLayerAttributeArray.push(attr);
                }
                symbolRenderFeatureType = featureType;
                switch (featureType) {
                    case "point":
                    case "multipoint":
                        featureType = "点";
                        break;
                    case "polyline":
                        featureType = "线";
                        break;
                    case "polygon":
                        featureType = "面";
                        break;
                }
                $("#symbolRenderCurLayerName").text(currentLayerName + " - " + featureType); //选择的图层
            }
        }

        //设置颜色带的下拉列表
        function setColorRampDropDownList() {
            colorRampHtmlArray = [];
            for (var i in colorRampArray) {
//                var canvasHtml = "<div><canvas id='" + canvasId + i + "' width='145' height='25' style='border:1px solid #c3c3c3;'>浏览器不支持，请升级。</canvas></div>";
                var colorKey = colorRampArray[i].colorKey;
                var canvasHtml = '<div><img height="25" width="200" src="images/' + colorKey + '.png"/></div>';
                colorRampHtmlArray.push(canvasHtml);
            }
        }

        //从色带中通过index取过渡色
        function getColorFromToColor(index, fromColorVal, toColorVal) {
            var fromColor = new Color(fromColorVal);
            var toColor = new Color(toColorVal);
            var red = fromColor.r + Math.floor((toColor.r - fromColor.r) * index / uniqueRenderGridData.length);
            var green = fromColor.g + Math.floor((toColor.g - fromColor.g) * index / uniqueRenderGridData.length);
            var blue = fromColor.b + Math.floor((toColor.b - fromColor.b) * index / uniqueRenderGridData.length);
            return new Color([red, green, blue, 1]);
        }

        //设置颜色带
        function setColorRamp(canvasId, fromColor, toColor) {
            var can = document.getElementById(canvasId);
            if (!can) {
                return;
            }
            var cxt = can.getContext("2d");
            var canvasWidth = 145;
            var canvasHeight = 25;
            var grd = cxt.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            grd.addColorStop(0, fromColor);
            grd.addColorStop(1, toColor);

            cxt.fillStyle = grd;
            cxt.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        //图层属性表window-=================================================================================
        var attributeWindow = (function () {
            //各控件事件
            function _addEventListeners() {
                $("#attributeGrid").on('rowclick', function (event) {
                    //取得点击表格位置
                    var args = event.args;
                    var rowindex = args.rowindex;
                    //取得要素并缩放到要素
                    if (singleRenderLayerAttributeArray.length == 0) {
                        return;
                    }
                    var feature = singleRenderLayerAttributeArray[rowindex];
                    if (!feature) {
                        return;
                    }
                    var geo = feature.geometry;
                    if (geo.type == 'point') {
                        var point = new esri.geometry.Point(geo.x, geo.y, geo.spatialReference); //这个点处于地图的中间
                        map.centerAt(point);
                    } else {
                        var extent = geo.getExtent();
                        map.setExtent(extent.expand(5.0), false);
                    }
                    //渲染要素
                    feature.setSymbol(setFeatureSymbol(geo.type));
                    map.graphics.clear();
                    map.graphics.add(feature);

                });

            };
            function _createElements() {
                $('#attributeWindow').jqxWindow({
                    width: 650, height: 400, resizable: false, autoOpen: false, position: {x: 250, y: 130},
                    initContent: function () {
                        $("#attributeGrid").jqxGrid(
                            {
                                width: '100%',
                                //height: '100%',
                                autoheight: true,
                                pageable: true,
                                pagesize: 100,
                                columnsresize: true,
                                selectionmode: 'singlerow',
                                sortable: true
                            });
                    }
                });
            };
            return {
                init: function () {
                    _createElements();
                    _addEventListeners();
                }
            };
        }());

        function getLayerAttributeArr() {
            var attributeArray = [];
            singleRenderLayerAttributeArray = new Array();     //存储查询到的所有feature，用于定位

            var queryTask = new QueryTask(mapURL_sudan + "/" + currentOptLayerId);  //当前图层url
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.where = "1=1";  //即获取全部数据
            queryTask.execute(query, showResults);

            function showResults(results) {
                var resultCount = results.features.length;
                for (var i = 0; i < resultCount; i++) {
                    var feature = results.features[i];
                    var featureType = feature.geometry.type;
                    var featureAttributes = feature.attributes;
                    featureAttributes["Shape"] = featureType;

                    attributeArray.push(featureAttributes);     //属性
                    singleRenderLayerAttributeArray.push(feature);             //要素
                }
                initAttrGridData(attributeArray);
            }
        }

        function initAttrGridData(attrData) {
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                return;
            }

            var datafields = [];
            var columns = [];
            for (var index in layerFieldsInfo) {
                var field = {};
                var column = {};
                //设置column
                column["text"] = layerFieldsInfo[index][1];
                column["datafield"] = layerFieldsInfo[index][1];
                column["width"] = 100;
                columns.push(column);
                //设置field
                field["name"] = layerFieldsInfo[index][1];
                switch (layerFieldsInfo[index][2]) {
                    case "esriFieldTypeInteger":
                    case "esriFieldTypeSmallInteger":
                        field["type"] = "int";
                        break;
                    case "esriFieldTypeDouble":
                        field["type"] = "float";
                        break;
                    case "esriFieldTypeDate":
                        field["type"] = "date";
                        break;
                    default :
                        field["type"] = "string";
                }
                datafields.push(field);
            }

            var source =
            {
                datatype: "array",
                datafields: datafields,
                localdata: attrData
            };

            var dataAdapter = new $.jqx.dataAdapter(source, {
                downloadComplete: function (data, status, xhr) {
                },
                loadComplete: function (data) {
                },
                loadError: function (xhr, status, error) {
                }
            });

            $("#attributeGrid").jqxGrid({
                source: dataAdapter,
                columns: columns
            });

        }

//渲染要素-==================================================================================
        function setFeatureSymbol(featureType, size, colorIn, colorOut) {
            var symbol;
            switch (featureType) {
                case "point":
                case "multipoint":
                    if (!size) {
                        size = 20;
                    }
                    if (!colorIn) {
                        colorIn = new Color([255, 0, 0, 1]);
                    }
                    if (!colorOut) {
                        colorOut = new Color([255, 0, 0, 1]);
                    }
                    symbol = new esri.symbol.SimpleMarkerSymbol(
                        esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
                        size,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            colorOut, 1),
                        colorIn);
                    break;
                case "polyline":
                    if (!size) {
                        size = 5;
                    }
                    if (!colorIn) {
                        colorIn = new Color([255, 0, 0, 1]);
                    }
                    if (!colorOut) {
                        colorOut = new Color([255, 0, 0, 1]);
                    }
                    symbol = new esri.symbol.SimpleLineSymbol(
                        esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                        colorOut,
                        size);
                    break;
                case "polygon":
                    if (!size) {
                        size = 3;
                    }
                    if (!colorIn) {
                        colorIn = new Color([255, 0, 0, 0.5]);
                    }
                    if (!colorOut) {
                        colorOut = new Color([0, 0, 255, 1]);
                    }
                    colorIn.a = 0.5;
                    symbol = new esri.symbol.SimpleFillSymbol(
                        esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                        new esri.symbol.SimpleLineSymbol(
                            esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                            colorOut,
                            size),
                        colorIn);
                    break;
                default :
            }
            return symbol;
        }

//取得图层字段列表===========================================================================
        function getLayerFiledListContent(layerID) {
            layerFieldsInfo = [];
            if (layerID == "-1") {
                return;
            }
            if (mapLayerInfosArr[layerID].subLayerIds) {
                return;
            }
            var url = mapURL_sudan + "/" + layerID;

            if (url.length === 0) {
                //alert("Please enter a URL");
                return;
            }

            var requestHandle = esriRequest({
                "url": url,
                "content": {
                    "f": "json"
                },
                "callbackParamName": "callback"
            });
            requestHandle.then(requestSucceeded, requestFailed);
        }

        function requestSucceeded(response, io) {
            var fieldInfo, pad;
            pad = dojoString.pad;

            //toJson converts the given JavaScript object
            //and its properties and values into simple text
            dojoJson.toJsonIndentStr = "  ";
            //console.log("response as text:\n", dojoJson.toJson(response, true));
            //dom.byId("status").innerHTML = "";

            //show field names and aliases
            if (response.hasOwnProperty("fields")) {
                //console.log("got some fields");
                fieldInfo = arrayUtils.map(response.fields, function (f) {
                    var field = [f.name, f.alias, f.type];
                    return field;
                });
                layerFieldsInfo = fieldInfo;//  fieldInfo.join("\n"); //转换成string
            } else {
                layerFieldsInfo = "failure";
                console.log("无法获取图层列表", dojoJson.toJson(error, true));
            }

        }

        function requestFailed(error, io) {
            layerFieldsInfo = "failure";
            dojoJson.toJsonIndentStr = " ";
            console.log("无法获取图层列表", dojoJson.toJson(error, true));
        }

//==================tools==============================================================
        //颜色转换中间过程
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        //RGB转Hex的16进制
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        //Hex转RGB
        function hex2rgb(hex) {
            if (!hex || hex.length < 7) {
                return;
            }
            return new Color(['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0]);
        }

        //从rgb(123,234,12)这种格式转为hex
        function hexValOfRGB(colorval) {
            var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            delete(parts[0]);
            for (var i = 1; i <= 3; ++i) {
                parts[i] = parseInt(parts[i]).toString(16);
                if (parts[i].length == 1) parts[i] = '0' + parts[i];
            }
            return '#' + parts.join('');
        }

    }
)
;