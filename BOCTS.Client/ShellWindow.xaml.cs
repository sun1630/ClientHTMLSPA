

using BOCTS.Client.FrameWork;
using Fluent;
using Microsoft.Practices.Prism.Regions;
using Microsoft.Practices.ServiceLocation;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel.Composition;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
namespace BOCTS.Client
{
    /// <summary>
    /// ShellWindow.xaml 的交互逻辑
    /// </summary>
    [Export("ShellWindow", typeof(Window))]
    public partial class ShellWindow : RibbonWindow
    {
        static ShellWindow()
        {
            var uri = new Uri("/Fluent;Component/Themes/Generic.xaml", UriKind.Relative);
            var res = Application.LoadComponent(uri) as ResourceDictionary;
            Application.Current.Resources.MergedDictionaries.Add(res);
        }
        public ShellWindow()
        {
            InitializeComponent();
        }

        [Import("RibbonService",typeof(IRibbonService))]
        Lazy<IRibbonService> RibbonService { get; set; }

        [Import("WindowService", typeof(IWindowService))]
        Lazy<IWindowService> WindowService { get; set; }

        [Import("WebBrowserService", typeof(IWebBrowserService))]
        Lazy<IWebBrowserService> WebBrowserService { get; set; }
        [Import]
        ShellViewModel ShellViewModel
        {
            get { return this.DataContext as ShellViewModel; }
            set { this.DataContext = value; }
        }

        private void btnThemeSwith_Click(object sender, RoutedEventArgs e)
        {
            ThemeSwitcher.SwitchTheme(ThemeEnum.ROYALE, this);
        }

        private void RibbonWindow_Loaded(object sender, RoutedEventArgs e)
        {

            RibbonService.Value.Initial();
           WindowService.Value.Initial();

            //Utilities.TryGetInstance<IWebBrowserService>("WebBrowserService").CreateWebBroser();
            WebBrowserService.Value.CreateWebBroser();
        }
    }
}
