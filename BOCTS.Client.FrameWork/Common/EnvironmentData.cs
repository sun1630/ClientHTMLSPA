using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;

namespace BOCTS.Client.FrameWork
{
    /// <summary>
    /// 全局数据
    /// </summary>
    public class EnvironmentData : System.Collections.Hashtable
    {
        /// <summary>
        /// 客户端配置
        /// </summary>
        public static class ClientSettings
        {
            /// <summary>
            /// 客户端根目录
            /// </summary>
            public static string ClientPath 
            { 
                get { return ConfigurationManager.AppSettings["ClientPath"]; }          
            }          

            /// <summary>
            /// 系统当前版本目录
            /// </summary>
            public static string ReleasePath
            {
                get
                {
                    return Path.Combine(ClientPath, "Release");
                }
            }

          

            /// <summary>
            /// 当前版本应用程序集目录
            /// </summary>
            public static string AssemblyPath
            {
                get
                {
                    return Path.Combine(ReleasePath, "Assembly");
                }
            }

            /// <summary>
            /// 当前版本资源目录
            /// </summary>
            public static string ResourcePath
            {
                get { return Path.Combine(ReleasePath, "Resource"); }
            }

            /// <summary>
            /// 当前版本配置目录
            /// </summary>
            public static string ConfigurationPath
            {
                get { return Path.Combine(ReleasePath, "Configuration"); }
            }

            /// <summary>
            /// SPA站点地址
            /// </summary>
            public static string SPASiteURL
            {
                get { return ConfigurationManager.AppSettings["SPASiteURL"]; }
            }
            /// <summary>
            /// SPA站点地址
            /// </summary>
            public static string SPASitePath
            {
                get { return ConfigurationManager.AppSettings["SPASitePath"]; }
            }
        }

        /// <summary>
        /// 服务端配置
        /// </summary>
        public static class ServerSettings
        {
            
        }
    }
}
