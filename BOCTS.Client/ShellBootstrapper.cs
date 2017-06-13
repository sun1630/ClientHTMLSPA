using Microsoft.Practices.Prism.MefExtensions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition.Hosting;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace BOCTS.Client
{
    public class ShellBootstrapper : MefBootstrapper
    {
        protected override void ConfigureAggregateCatalog()
        {
            base.ConfigureAggregateCatalog();
            this.AggregateCatalog.Catalogs.Add(new AssemblyCatalog(typeof(ShellBootstrapper).Assembly));
            string ribbonServicePath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, @"BOCTS.Client.Controls.RibbonService.dll");
            AddCatalogs(ribbonServicePath);
            string dockerManagerPath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, @"BOCTS.Client.Controls.DockManager.dll");
            AddCatalogs(dockerManagerPath);
            string webBrowserEx = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, @"BOC.UOP.Controls.WebBrowserEx.dll");
            AddCatalogs(webBrowserEx);
            AddCatalogs(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, @"BOCTS.Client.Authorization.DLL")); 
            AddCatalogs(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, @"BOCTS.Client.Controls.Authorization.DLL"));
        }



        protected override System.Windows.DependencyObject CreateShell()
        {
            return this.Container.GetExportedValue<Window>("ShellWindow");
        }
        protected override void InitializeShell()
        {
            base.InitializeShell();

            Application.Current.MainWindow = (Window)this.Shell;
            Application.Current.MainWindow.Show();
            Application.Current.MainWindow.Activate();
            //Program.model.Dispose();
        }
        #region private
        private void AddCatalogs(string filePath)
        {
            Assembly assembly = GetAssembly(filePath);
            if (assembly != null)
                this.AggregateCatalog.Catalogs.Add(
                    new AssemblyCatalog(assembly));
        }

        private Assembly GetAssembly(string filePath)
        {
            if (!File.Exists(filePath)) return null;
            byte[] buffer = System.IO.File.ReadAllBytes(filePath);
            return Assembly.Load(buffer);
        }
        #endregion private
    }
}
