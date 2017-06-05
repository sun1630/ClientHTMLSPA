using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using Microsoft.Practices.ServiceLocation;

namespace BOCTS.Client.FrameWork
{
    /// <summary>
    /// 工具类
    /// </summary>
    public abstract class Utilities
    {
        public static T TryGetInstance<T>(string name)
        {
            T rtv = default(T);
            try
            {
                rtv = ServiceLocator.Current.GetInstance<T>(name);
            }
            catch
            {
            }
            return rtv;
        }
        /// <summary>
        /// 写入本地更新日志文件
        /// </summary>
        /// <param name="info"></param>
        public static void WriteUpdateLog(string info)
        {
            string logFile = string.Format(@"{0}\Logs\Update_{1}.log", EnvironmentData.ClientSettings.ClientPath, DateTime.Now.ToString("yyyyMMdd"));
            try
            {
                if (!Directory.Exists(Path.GetDirectoryName(logFile)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(logFile));
                }
                using (FileStream fs = new FileStream(logFile, FileMode.Append, FileAccess.Write))
                {
                    StreamWriter sw = new StreamWriter(fs, System.Text.Encoding.UTF8);
                    sw.WriteLine(string.Format("Time:{0}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")));
                    sw.WriteLine(string.Format("Message:\r\n{0}", info));
                    sw.WriteLine("");
                    sw.Close();
                }
            }
            catch
            { }
        }

        /// <summary>
        /// 记录本地异常到系统时间日志
        /// </summary>
        /// <param name="module"></param>
        /// <param name="ex"></param>
        public static void LogException(string module, Exception ex)
        {
            try
            {
                string txt = string.Format("Module:{3}\r\nMessage:{0}\r\nSource:\r\n{1}\r\nStackTrace:\r\n{2}",
                    ex.Message, ex.Source, ex.StackTrace, module);
                System.Diagnostics.EventLog.WriteEntry("UOPClient", txt, System.Diagnostics.EventLogEntryType.Error);
            }
            catch
            { }
        }

        /// <summary>
        /// 用于创建具备users权限的文件夹
        /// </summary>
        /// <param name="dir"></param>
        public static void CreateDirectory(string dir)
        {
            Directory.CreateDirectory(dir);
            SetDirAccessRule(dir);
        }

        /// <summary>
        /// 复制文件
        /// </summary>
        /// <param name="srcFile"></param>
        /// <param name="dstFile"></param>
        public static void CopyFile(string srcFile, string dstFile)
        {
            if (!File.Exists(srcFile))
            {
                return;
            }
            string path = Path.GetDirectoryName(dstFile);
            if (!Directory.Exists(path))
            {
                CreateDirectory(path);
            }
            File.Copy(srcFile, dstFile, true);
        }

        /// <summary>
        /// 设置路径的访问权限
        /// </summary>
        /// <param name="path"></param>
        public static void SetDirAccessRule(string path)
        {
            if (!Directory.Exists(path))
            {
                return;
            }
            System.Security.AccessControl.DirectorySecurity ds = new System.Security.AccessControl.DirectorySecurity();

            System.Security.AccessControl.FileSystemAccessRule rule = new System.Security.AccessControl.FileSystemAccessRule("Everyone",
                System.Security.AccessControl.FileSystemRights.FullControl,
                System.Security.AccessControl.AccessControlType.Allow);
            ds.AddAccessRule(rule);

            rule = new System.Security.AccessControl.FileSystemAccessRule(
                "Everyone",
                System.Security.AccessControl.FileSystemRights.FullControl,
                System.Security.AccessControl.InheritanceFlags.ObjectInherit |
                System.Security.AccessControl.InheritanceFlags.ContainerInherit,
                System.Security.AccessControl.PropagationFlags.InheritOnly,
                System.Security.AccessControl.AccessControlType.Allow);
            ds.AddAccessRule(rule);
            Directory.SetAccessControl(path, ds);
        }

        /// <summary>
        /// write exception information to system event
        /// </summary>
        /// <param name="ex">exception object</param>
        public static void LogException(Exception ex)
        {
            try
            {
                string msg = string.Format("Message:{0}\r\nSource:\r\n{1}\r\nStackTrace:\r\n{2}",
                    ex.Message, ex.Source, ex.StackTrace);
                System.Diagnostics.EventLog.WriteEntry("UOPClient", msg, System.Diagnostics.EventLogEntryType.Error);
            }
            catch
            { }
        }

        /// <summary>
        /// 复制流
        /// </summary>
        /// <param name="source">复制源</param>
        /// <param name="target">目标流</param>
        public static void CopyStream(Stream source, Stream target)
        {
            const int bufSize = 4096;
            byte[] buf = new byte[bufSize];
            int bytesRead = 0;
            while ((bytesRead = source.Read(buf, 0, bufSize)) > 0)
            {
                target.Write(buf, 0, bytesRead);
            }
        }

        /// <summary>
        /// 获取文件夹下文件列表
        /// </summary>
        /// <param name="dirRootPath">文件夹根路径</param>
        /// <param name="recursive">是否递归</param>
        /// <param name="allFiles">文件列表</param>
        public static void GetAllFilesInDir(string dirRootPath, bool recursive, ref List<string> allFiles)
        {
            DirectoryInfo dir = new DirectoryInfo(dirRootPath);

            foreach (FileInfo fi in dir.GetFiles())
            {
                allFiles.Add(fi.FullName);
            }

            if (recursive)
            {
                foreach (DirectoryInfo di in dir.GetDirectories())
                {
                    GetAllFilesInDir(di.FullName, true, ref allFiles);
                }
            }
        }

        /// <summary>
        /// 去除文件只读属性
        /// </summary>
        /// <param name="allFiles">文件列表</param>
        public static void ClearReadonly(List<string> allFiles)
        {
            foreach (string fileName in allFiles)
            {
                FileInfo fileInfo = new FileInfo(fileName);
                if (fileInfo.IsReadOnly == true)
                {
                    fileInfo.IsReadOnly = false;
                }
            }
        }

    }
}
