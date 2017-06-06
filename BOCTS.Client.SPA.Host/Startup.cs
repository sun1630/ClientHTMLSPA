using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Owin;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.SPA.Host
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var root = FrameWork.EnvironmentData.ClientSettings.SPASitePath;
            if(root.StartsWith(".\\")||root.StartsWith("..\\")||root.StartsWith("\\"))
            {
                Debug.Write(AppDomain.CurrentDomain.BaseDirectory);
                root= Path.Combine(AppDomain.CurrentDomain.BaseDirectory, root);
                Debug.Write(root);
            }
            var fileSystem = new PhysicalFileSystem(root);
            var option = new FileServerOptions
            {
                EnableDefaultFiles = true,
                EnableDirectoryBrowsing = true,
                FileSystem = fileSystem,
            };

            app.UseFileServer(option);
        }
    }

    public class StartupHelper
    {
        public void CreateHost()
        {
            WebApp.Start<Startup>(new StartOptions(FrameWork.EnvironmentData.ClientSettings.SPASiteURL));
        }
    }
}
