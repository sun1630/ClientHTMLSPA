using BOCTS.Client.SPA.Host;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace BOCTS.Client
{
    /// <summary>
    /// App.xaml 的交互逻辑
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            //create host for spa
            new StartupHelper().CreateHost();
            ShellBootstrapper boot = new ShellBootstrapper();
            boot.Run();
            //sw.Close();
            //mw.Close();
        }
    }
}
