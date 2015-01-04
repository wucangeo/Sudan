using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

using System.Web.Configuration;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.Script.Serialization;
using System.Data;
using System.Text;
using System.Drawing;
using System.Web.Script.Services;
using System.Web.UI;


namespace Sudan
{
    /// <summary>
    /// CustomRenderMap 的摘要说明
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // 若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消对下行的注释。
    [System.Web.Script.Services.ScriptService]
    public class CustomRenderMap : System.Web.Services.WebService
    {

        [WebMethod]
        //[ScriptMethod(UseHttpGet = true)]
        public string GetCustomRenderConfig()
        {
            string json = "";

            //读取配置文件中的链接字符串
            String connectionString = ConfigurationManager.ConnectionStrings["Conn"].ConnectionString;
            //创建SQLConnection对象
            SqlConnection sqlCon = new SqlConnection(connectionString);
            //SQL语句
            string sqlStr = "select * from [CustomSymbolRender] order by id desc";
            try
            {
                SqlDataAdapter da = new SqlDataAdapter(sqlStr, sqlCon);
                DataSet ds = new DataSet();
                da.Fill(ds, "CustomSymbolRender");

                //JavaScriptSerializer jss = new JavaScriptSerializer();
                json = CustomDataConvert.DataTabletoString(ds.Tables[0]);
                sqlCon.Close();
            }
            catch (SqlException sqlex)
            {
                json = sqlex.Message;
            }
            finally
            {
                //关闭连接
                if (sqlCon != null)
                {
                    sqlCon.Close();
                }
            }
            return "{\"rows\":" + json + "}";
            //return json;
        }

        [WebMethod]
        //[ScriptMethod(UseHttpGet = true)]
        public string DeleteRenderConfigById(string id)
        {
            string result = "success";
            int rid = -1;
            if (!int.TryParse(id, out rid))
            {
                result = "failure";
                return result;
            }
            //读取配置文件中的链接字符串
            String connectionString = ConfigurationManager.ConnectionStrings["Conn"].ConnectionString;
            //创建SQLConnection对象
            SqlConnection conn = new SqlConnection(connectionString);
            //SQL语句
            string sql = "delete from CustomSymbolRender where id ='"+id+"'";
            try
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.CommandText = sql;
                int rowsCount = cmd.ExecuteNonQuery();
                result = rowsCount.ToString();
            }
            catch (SqlException sqlex)
            {
                result = "falure：" + sqlex;
            }
            finally
            {
                //关闭连接
                if (conn != null)
                {
                    conn.Close();
                }
            }            
            return result;
        }

        [WebMethod]
        //[ScriptMethod(UseHttpGet = true)]
        public string SetCustomRenderConfig(string name, string ifShowLabel, string labelLayerId, string labelFieldId, string labelColor, string labelFontSize,
            string renderLayerId, string renderType,string featureType, string singleFillColor, string singleLineColor, string singleLineWidth, 
            string uniqueFieldId, string uniqueColorRampId,string xmax,string xmin, string ymax, string ymin)
        {
            string result = "success";
            //读取配置文件中的链接字符串
            String connectionString = ConfigurationManager.ConnectionStrings["Conn"].ConnectionString;
            //创建SQLConnection对象
            SqlConnection conn = new SqlConnection(connectionString);
            string sql = "insert into CustomSymbolRender(name, ifShowLabel,labelLayerId,labelFieldId,labelColor,labelFontSize,"
            + "renderLayerId,renderType,featureType,singleFillColor,singleLineColor,singleLineWidth,"
            + "uniqueFieldId,uniqueColorRampId,xmax,xmin,ymax,ymin) values ("
            + "@name,@ifShowLabel,@labelLayerId,@labelFieldId,@labelColor,@labelFontSize,"
            + "@renderLayerId,@renderType,@featureType,@singleFillColor,@singleLineColor,@singleLineWidth,"
            + "@uniqueFieldId,@uniqueColorRampId,@xmax,@xmin,@ymax,@ymin)";

            try
            {                
                //处理为空情况
                if (ifShowLabel == "")
                {
                    ifShowLabel = "false";
                }
                int labelLayerId2 = 0;
                if (int.TryParse(labelLayerId, out labelLayerId2) == false) 
                {
                    labelLayerId2 = -1;
                }
                int labelFieldId2 = 0;
                if (int.TryParse(labelFieldId, out labelFieldId2) == false) 
                {
                    labelFieldId2 = -1;
                }
                int labelFontSize2 = 0;
                if (int.TryParse(labelFontSize, out labelFontSize2) == false) 
                {
                    labelFontSize2 = -1;
                }
                int renderLayerId2 = 0;
                if (int.TryParse(renderLayerId, out renderLayerId2) == false) 
                {
                    renderLayerId2 = -1;
                }
                int renderType2 = 0;
                if (int.TryParse(renderType, out renderType2) == false) 
                {
                    renderType2 = -1;
                }
                int singleLineWidth2 = 0;
                if (int.TryParse(singleLineWidth, out singleLineWidth2) == false) 
                {
                    singleLineWidth2 = -1;
                }
                int uniqueFieldId2 = 0;
                if (int.TryParse(uniqueFieldId, out uniqueFieldId2) == false)
                {
                    uniqueFieldId2 = -1;
                }
                int uniqueColorRampId2 = 0;
                if (int.TryParse(uniqueColorRampId, out uniqueColorRampId2) == false)
                {
                    uniqueColorRampId2 = -1;
                }
                double xmax2 = 0;
                if (double.TryParse(xmax, out xmax2) == false)
                {
                    xmax2 = -1;
                }
                double xmin2 = 0;
                if (double.TryParse(xmin, out xmin2) == false)
                {
                    xmin2 = -1;
                }
                double ymax2 = 0;
                if (double.TryParse(ymax, out ymax2) == false)
                {
                    ymax2 = -1;
                }
                double ymin2 = 0;
                if (double.TryParse(ymin, out ymin2) == false)
                {
                    ymin2 = -1;
                }
                conn.Open();
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.CommandText = sql;
                cmd.Parameters.AddWithValue("@name", name);
                cmd.Parameters.AddWithValue("@ifShowLabel", ifShowLabel);
                cmd.Parameters.AddWithValue("@labelLayerId", Convert.ToInt32(labelLayerId2));
                cmd.Parameters.AddWithValue("@labelFieldId", Convert.ToInt32(labelFieldId2));
                cmd.Parameters.AddWithValue("@labelColor", labelColor);
                cmd.Parameters.AddWithValue("@labelFontSize", Convert.ToInt32(labelFontSize2));
                cmd.Parameters.AddWithValue("@renderLayerId", Convert.ToInt32(renderLayerId2));
                cmd.Parameters.AddWithValue("@renderType", Convert.ToInt32(renderType2));
                cmd.Parameters.AddWithValue("@featureType",featureType);
                cmd.Parameters.AddWithValue("@singleFillColor", singleFillColor);
                cmd.Parameters.AddWithValue("@singleLineColor", singleLineColor);
                cmd.Parameters.AddWithValue("@singleLineWidth", Convert.ToInt32(singleLineWidth2));
                cmd.Parameters.AddWithValue("@uniqueFieldId", Convert.ToInt32(uniqueFieldId2));
                cmd.Parameters.AddWithValue("@uniqueColorRampId", Convert.ToInt32(uniqueColorRampId2));
                cmd.Parameters.AddWithValue("@xmax", Convert.ToDouble(xmax2));
                cmd.Parameters.AddWithValue("@xmin", Convert.ToDouble(xmin2));
                cmd.Parameters.AddWithValue("@ymax", Convert.ToDouble(ymax2));
                cmd.Parameters.AddWithValue("@ymin", Convert.ToDouble(ymin2));
                                
                int involeCount = cmd.ExecuteNonQuery();
                result = involeCount.ToString();
            }
            catch (SqlException sqlex)
            {
                result = "falure：" + sqlex;
            }
            finally
            {
                //关闭连接
                if (conn != null)
                {
                    conn.Close();
                }                
            }
            return result;
        }
    }
}
