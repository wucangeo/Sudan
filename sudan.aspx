<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="sudan.aspx.cs" Inherits="Sudan.sudan" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no"/>
    <title>苏丹地图</title>
    
    <link rel="stylesheet" href="http://localhost:83/arcjs/3.11/esri/css/esri.css"/>
    <link rel="stylesheet" href="http://localhost:83/arcjs/3.11/dijit/themes/claro/claro.css"/>
    <style type="text/css">
        html, body, #sudan_mapDiv,#form1,#startDiv {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #FFF;
            overflow: hidden;
            font-family: "Trebuchet MS";
            z-index: -1;
        }

        #sudan_layerListDiv {
            position: absolute;
            /*visibility: hidden;*/
            float: left;
            margin-left: 20px;

            top: 130px;
            left: 20px;
            z-index: 2;
            font-size: 0.9em; /* 12 pixels */
            line-height: 1.75em;
            font-family: arial, sans-serif;
            color: #4C4C4C;
            width: 180px;
            background-color: #FFFFFF;
            padding: 10px;
            border: 1px solid #57585A;
            border-radius: 5px;
        }

        #textDiv {
            position: absolute;
            /*visibility: hidden;*/
            float: left;
            margin-left: 20px;

            top: 130px;
            right: 20px;
            z-index: 2;
            font-size: 0.9em; /* 12 pixels */
            line-height: 1.75em;
            font-family: arial, sans-serif;
            color: #4C4C4C;
            width: 180px;
            background-color: #FFFFFF;
            padding: 10px;
            border: 1px solid #57585A;
            border-radius: 5px;
        }

        #labelSettingWindowDiv {
            width: 200px;
            height: 150px;
            padding: 0.5em;
            border-radius: 5px;
            background-color: #FFFFFF;
            border: 1px solid #57585A;
            font-family: arial, sans-serif;
            line-height: 1.75em;
        }
    </style>

    <script type="text/javascript" src="http://localhost:83/arcjs/3.11/init.js"></script>
    <script src="js/jsapi_vsdoc10_v38.js" type="text/javascript"></script>

    <script src="http://localhost:83/jquery-1.11.1.min.js" type="text/javascript"></script>
    <link rel="stylesheet" href="http://localhost:83/jqwidgets/styles/jqx.base.css" type="text/css"/>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqx_demos.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxcore.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxbuttons.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxscrollbar.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxpanel.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxtree.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxcheckbox.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxmenu.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxwindow.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxdropdownlist.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxlistbox.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxradiobutton.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.selection.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.pager.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.columnsresize.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.sort.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxdata.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxcolorpicker.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxdropdownbutton.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxnumberinput.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxtabs.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxtreegrid.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxinput.js"></script>
    <script type="text/javascript" src="http://localhost:83/jqwidgets/jqxgrid.edit.js"></script>

    <script src="js/map_sudan.js" type="text/javascript"></script>
</head>
<body>
    <form id="form1" runat="server">
    <div id="startDiv">
    
<div id="sudan_mapDiv"></div>
<div id="sudan_layerListDiv"></div>
<!--<div id ="textDiv"></div>-->
<div id="jqxMenu">
    <ul>
        <li id="openAttrTable">打开属性表</li>
        <li id="setLabelField">设置标注字段</li>
        <li id="setRenderSymbol">设置渲染符号</li>
    </ul>
</div>

<!--属性表-->
<div id="attributeContainer">
    <div id="attributeWindow">
        <div id="attributeHeader">
            <span id="attributeContainerTitle">图层属性</span>
        </div>
        <div>
            <div style="margin:5px;">
                <div style="float:left;"><input type="button" value="保存" id = "attributeSaveButton"/></div>
            </div>
            <br />
            <div id='jqxWidgetGrid' style="margin-top:10px; font-size: 12px; font-family: Verdana;">
                <div id="attributeGrid">
                </div>
            </div>
        </div>
    </div>
</div>


<!--标注窗体-->
<div id="labelSettingContainer">
    <div id="labelSettingWindow">
        <div id="customWindowHeader">
            <span id="labelSettingContainerTitle">设置标注字段</span>
        </div>
        <div>
            <div style="margin-top: 10px;">
                <span style="float: left;margin-left: 10px;">当前图层：</span>
                <span id="labelSettingCurLayerName" style="float: left;margin-left: 10px;"></span>
            </div>
            <br/>

            <div id="showLabelCheckBox" style="margin-top: 10px;">显示标注</div>
            <div id="labelFieldDropDownList" style="margin-top: 10px;"></div>
            <div id="LabelColor" style="margin: 10px;">
                <div style="float: left;margin-left: 0px;margin-top: 5px;">颜色：</div>
                <div style="margin-right: 0px; float: right;" id="labelColorDropDown">
                    <div style="padding: 3px;">
                        <div id="setLabelColorPicker"></div>
                    </div>
                </div>
            </div>
            <br/>

            <div id="LabelSize" style="margin: 10px;margin-top: 20px;">
                <div style="float: left;margin-left: 0px;margin-top: 5px;">大小：</div>
                <div id="setLabelSizeDropDown" style="margin-right: 0px; float: right;"></div>
            </div>
            <br/>

            <div style="margin-top: 25px;">
                <span style="float: left;margin-left: 20px;"><input type="button" value="确定"
                                                                    id="showLabelSubmitButton"/></span>
                <span style="float: right;margin-right: 20px;"><input type="button" value="取消"
                                                                      id="showLabelCancelButton"/></span>
            </div>
        </div>

    </div>
</div>

<!--符号渲染-->
<div id="symbolRenderContainer">
    <div id="symbolRenderWindow">
        <div id="symbolRenderWindowHeader">
            <span id="symbolRenderContainerTitle">图层符号渲染</span>
        </div>
        <div>
            <div style="margin-top: 10px;">
                <span style="float: left;margin-left: 5px">当前图层：</span>
                <span id="symbolRenderCurLayerName" style="float: left;margin-left: 5px;"></span>
            </div>
            <br/>
            <div style="margin-top: 5px;">
                 <div style="margin-left: 5px;float: left;line-height: 25px;">渲染配置：</div>
                 <div style="margin-left: 5px;float: left;" id="symbolRenderConfigDropDown"></div>
                 <div style="margin-right: 5px;float: right;"><input type="button" value="删除"id="symbolRenderConfigDelete"/></div>
            </div>
            <br/>
            <div id="jqxTabsContainer" style="float: left;margin-top: 10px;">
                <div id="jqxTabsSymbolRender">
                    <ul style="margin: 10px;">
                        <li>单一值渲染</li>
                        <li>唯一值渲染</li>
                    </ul>
                    <!--单一值符号渲染-->
                    <div id="SingleSymbolRenderPanel" style="margin: 10px;">
                        <div id="SingleSymbolColor" style="margin: 10px;">
                            <div style="float: left;margin-left: 0px;margin-top: 5px;">填充颜色：</div>
                            <div style="margin-right: 0px; float: right;" id="SingleSymbolColorDropDown">
                                <div style="padding: 3px;">
                                    <div id="setSingleSymbolColorPicker"></div>
                                </div>
                            </div>
                        </div>
                        <br/>

                        <div id="SingleSymbolColorOutline" style="margin: 10px;margin-top: 20px">
                            <div style="float: left;margin-left: 0px;margin-top: 5px;">边线颜色：</div>
                            <div style="margin-right: 0px; float: right;" id="SingleSymbolColorOutlineDropDown">
                                <div style="padding: 3px;">
                                    <div id="setSingleSymbolColorOutlinePicker"></div>
                                </div>
                            </div>
                        </div>
                        <br/>

                        <div id="SingleSymbolSize" style="margin: 10px;margin-top: 20px;">
                            <div style="float: left;margin-left: 0px;margin-top: 5px;">大小：</div>
                            <div id="setSingleSymbolSizeNumber" style="margin-right: 0px; float: right;"></div>
                        </div>
                    </div>
                    <!--唯一值符号渲染-->
                    <div id="uniqueValueRenderPanel" style="margin: 10px;">
                        <div style="margin: 5px;">
                            <div style="margin: 5px;float: left;line-height: 25px;">渲染字段：</div>
                            <div style="margin: 5px;float: right;" id="uniqueRenderFieldDropDownList"></div>
                        </div>
                        <div style="margin: 5px;">
                            <div style="margin: 5px;float: left;line-height: 25px;">渲染色系：</div>
                            <div style="margin: 5px;float: right;" id="uniqueRenderColorRampDropDownList"></div>
                        </div>
                        <div id="uniqueRenderSymbolsGrid" style="margin: 10px;margin-top: 20px"></div>
                    </div>
                </div>
                <div>
                    <div style="margin-top: 10px;">
                    <span style="float: left;margin-left: 20px;"><input type="button" value="预览"
                                                                        id="symbolRenderPreviewButton"/></span>
                    <span style="float: left;margin-left: 30px;"><input type="button" value="保存设置"
                                                                        id="symbolRenderConfigSaveButton"/></span>
                    <span style="float: right;margin-right: 20px;"><input type="button" value="取消"
                                                                          id="symbolRenderCancelButton"/></span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>

<!--唯一值渲染颜色选择-->
<div id="colorPickerWindowContainer">
    <div id="ColorPickerWidgetWindow">
        <div>
            <div id="uniqueRenderColorPicker" style="margin: 0px;">
            </div>
        </div>
    </div>
</div>
<!--保存渲染设置命名window-->
  <div id="renderConfigNameWindowContainer">
    <div id="renderConfigNameWindow">
      <div id="renderConfigNameWindowHeader">
        <span id="renderConfigNameContainerTitle">设置名称</span>
      </div>

      <div>
        <div style="margin: 5px;">
        <div style="margin-left: 5px;float: left;line-height: 25px;">名称：</div>
        <div style="margin-right: 5px;float: right;"><input type="text" id="renderConfigNameInput"/></div>
        </div>
        <br />
        <div style="margin-top: 20px;">
          <span style="float: left;margin-left: 20px;"><input type="button" value="确定" id="renderConfigNameSubmit" /></span>
          <span style="float: right;margin-right: 20px;"><input type="button" value="取消" id="renderConfigNameCancel" /></span>
        </div>
      </div>
    </div>
  </div>
<!--属性编辑框-->
  <div id="attrEditWindowContainer">
    <div id="attrFeatureEditWindow">
      <div id="attrEditWindowHeader">
        <span id="attrEditContainerTitle">要素属性编辑</span>
      </div>

      <div>
        <div>
          <div id="attrPropertyTreeGrid" style="margin: 0px;"></div>
        </div>

        <div style="margin-top: 20px;">
          <span style="float: left;margin-left: 20px;"><input type="button" value="保存" id="attrSaveEdit" /></span>
          <span style="float: right;margin-right: 20px;"><input type="button" value="删除" id="attrDeleteFeature" /></span>
        </div>
      </div>
    </div>
  </div>
    </div>
    </form>
</body>
</html>
