/**
 * Created by WUCAN on 2014/11/6.
 */

//var mapURL_sudan = "http://lcoalhost:8399/arcgis/rest/services/sudan/MapServer";
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

require([
        "esri/map",
        "esri/request",
        "esri/Color",
        "esri/layers/FeatureLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/LabelLayer",


        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleFillSymbol",
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
        "dojo/domReady!"], function (Map, esriRequest, Color, FeatureLayer, ArcGISDynamicMapServiceLayer, LabelLayer, SimpleRenderer, SimpleFillSymbol, SimpleMarkerSymbol, TextSymbol, Query, QueryTask, dom, on, query, arrayUtils, domClass, dojoJson, dojoString) {
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
            $(document).ready(function () {
                // create jqxTree
                $('#sudan_layerListDiv').jqxTree({ hasThreeStates: true, checkboxes: true});
                $('#sudan_layerListDiv').css('visibility', 'visible');

                //create context menu
                var contextMenu = $("#jqxMenu").jqxMenu({ width: '120px', height: '84px', autoOpenPopup: false, mode: 'popup' });
                var clickedItem = null;

                //右键菜单======================================================================
                var attachContextMenu = function () {
                    // open the context menu when the user presses the mouse right button.
                    $("#sudan_layerListDiv li").on('mousedown', function (event) {
                        var target = $(event.target).parents('li:first')[0];
                        currentOptLayerId = target.id; //记录右键点击的图层id
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
                        case "openAttrTable":
                            if (!$('#attributeWindow').jqxWindow('isOpen')) {
                                $('#attributeWindow').jqxWindow('open');
                            }
                            getLayerAttributeArr();
                            $('#attributeContainerTitle').text(currentLayerName);   //设置当前图层名称
                            break;
                        case "setLabelField":
                            if (!$('#labelSettingWindow').jqxWindow('isOpen')) {
                                $('#labelSettingWindow').jqxWindow('open');
                            } else {
                                setFieldsListDropDown();
                            }
                            $("#labelSettingCurLayerName").text(currentLayerName); //选择的图层
                            break;
                        case "setRenderSymbol":
                            $('#symbolRenderWindow').jqxWindow('open');
                            $("#symbolRenderCurLayerName").text(currentLayerName); //选择的图层
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
            });

            layersServices.setVisibleLayers(layerVisibleArr);

            $('#sudan_layerListDiv').on('checkChange', function (event) {
                var args = event.args;
                var item = $('#sudan_layerListDiv').jqxTree('getItem', args.element);
                //$('#textDiv').jqxPanel('prepend', '<div style="margin-top: 5px;">Selected: ' + item.label + '</div>');
                updateLayerVisibility();
            });
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
                //单一符号渲染选择事件
                $("#singleSymbolRenderRadio").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        $("#SingleSymbolColorDropDown").jqxDropDownButton({disabled: false});
                        $("#setSingleSymbolSizeNumber").jqxNumberInput({disabled: false});
                    }
                    else {
                        $("#SingleSymbolColorDropDown").jqxDropDownButton({disabled: true});
                        $("#setSingleSymbolSizeNumber").jqxNumberInput({disabled: true});
                    }
                });
                //唯一值渲染选择事件
                $("#uniqueValueRenderRadio").on('change', function (event) {
                    var checked = event.args.checked;
                    if (checked) {
                        $("#uniqueRenderFieldDropDownList").jqxDropDownList({disabled: false});
                        $("#uniqueRenderColorDropDownList").jqxDropDownList({disabled: false});
                        $("#uniqueRenderSymbolsGrid").jqxGrid({disabled: false});
                    }
                    else {
                        $("#uniqueRenderFieldDropDownList").jqxDropDownList({disabled: true});
                        $("#uniqueRenderColorDropDownList").jqxDropDownList({disabled: true});
                        $("#uniqueRenderSymbolsGrid").jqxGrid({disabled: true});
                    }
                });
                //颜色选择事件
                $('#setSingleSymbolColorPicker').bind('colorchange', function (event) {
                    var color = event.args.color;
                    $("#SingleSymbolColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(color));
                });
                //确定
                $("#symbolRenderSubmitButton").on('click', function () {
                    setLayerSymbolRender();
                });
                //取消
                $("#symbolRenderCancelButton").on('click', function () {
                    $('#symbolRenderWindow').jqxWindow('close');
                });
            };

            var source_renderFields = [
                "Starts with",
                "Starts with(Case Sensitive)",
                "Ends with",
                "Ends with(Case Sensitive)",
                "Contains",
                "Equal",
                "Contains(Case Sensitive)",
                "Equal(Case Sensitive)"
            ];
            var source_LabelSize = ["初始项"];
            var source_renderFields = ["初始项"];

            function _createElements() {
                $('#symbolRenderWindow').jqxWindow({
                    width: 350, height: 460, resizable: false, autoOpen: false, position: {x: 250, y: 130},
                    initContent: function () {
                        //单一符号
                        $('#singleSymbolRenderRadio').jqxRadioButton({ width: 300, height: 25, checked: true});
                        $("#SingleSymbolRenderPanel").jqxPanel({ width: 310, height: 85, disabled: true});
                        $("#setSingleSymbolColorPicker").jqxColorPicker({ color: "137013", colorMode: 'hue', width: 220, height: 220});
                        $("#SingleSymbolColorDropDown").jqxDropDownButton({ width: '150px', height: '25px'});
                        $("#SingleSymbolColorDropDown").jqxDropDownButton('setContent', getLabelColorByDropDown(new $.jqx.color({ hex: "137013" })));
                        $("#setSingleSymbolSizeNumber").jqxNumberInput({  width: '150px', height: '25px', disabled: false, inputMode: 'simple', spinButtons: true})
                        //唯一值
                        $('#uniqueValueRenderRadio').jqxRadioButton({ width: 300, height: 25, checked: false});
                        $("#uniqueValueRenderPanel").jqxPanel({ width: 310, height: 190, disabled: true});
                        $("#uniqueRenderFieldDropDownList").jqxDropDownList({ source: source_renderFields, selectedIndex: 1, width: '160', height: '25', disabled: false});
                        $("#uniqueRenderColorDropDownList").jqxDropDownList({ source: source_renderFields, selectedIndex: 1, width: '160', height: '25', disabled: false});
                        $('#symbolRenderSubmitButton').jqxButton({ width: '80px', disabled: false });
                        $('#symbolRenderCancelButton').jqxButton({ width: '80px', disabled: false });
                        $("#uniqueRenderSymbolsGrid").jqxGrid(
                            {
                                width: 290//,
                                //source: dataAdapter,
                                //columnsresize: true,
//                            columns: [
//                                { text: '符号', width: 60 },
//                                { text: '值',  width: 150 },
//                                { text: '个数',width: 80 }
//                            ]
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

        //开始符号渲染
        function setLayerSymbolRender() {
            //移除已经渲染的图层
            if (renderLayer) {
                map.removeLayer(renderLayer);
            }
            if (!layerFieldsInfo || layerFieldsInfo == "failure" || layerFieldsInfo.length == 0) {
                return;
            }
            if ($("#singleSymbolRenderRadio").val()) {
                var symbolColor = $("#setSingleSymbolColorPicker").jqxColorPicker('getColor');
                var symbolSize = $("#setSingleSymbolSizeNumber").jqxNumberInput('val');

                var renderLayerURL = mapURL_sudan_FeatureLayer + "/" + currentOptLayerId;
                renderLayer = new FeatureLayer(renderLayerURL, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"],
                    opacity: 0.5
                });
                map.addLayer(renderLayer);
                var layerJsonInfo = renderLayer.toJson();

                var markerSym = new SimpleMarkerSymbol();
                markerSym.setSize(symbolSize);
                markerSym.setColor(symbolColor);
                //markerSym.setOutline(markerSym.outline.setColor(new Color([133,197,133,0.75])));
                var rendererPoint = new SimpleRenderer(markerSym);
                renderLayer.setRenderer(rendererPoint);


                switch (renderLayer.geometryType) {
                    case "esriGeometryPoint":

                        break;
                    case "esriGeometryPolyline":
                        break;
                    case "esriGeometryPolygon":
                        break;
                }
                //if()
            }
            else if ($("#uniqueValueRenderRadio").val()) {

            }
        }

        //图层属性表window-=================================================================================
        var attributeWindow = (function () {
            //各控件事件
            function _addEventListeners() {

            };
            function _createElements() {
                $('#attributeWindow').jqxWindow({
                    width: 650, height: 400, resizable: false, autoOpen: false, position: {x: 250, y: 130},
                    initContent: function () {
                        $("#attributeGrid").jqxGrid(
                            {
                                width: '100%',
                                //height: '100%',
                                autoheight:true,
                                pageable: true,
                                pagesize: 100,
                                columnsresize: true
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
                    attributeArray.push(featureAttributes);
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

        //================================================================================

    }
)
;