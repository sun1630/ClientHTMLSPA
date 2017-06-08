using BOCTS.Client.FrameWork;
using Fluent;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BOCTS.Client.Controls.RibbonService
{
    /// <summary>
    /// Interaction logic for RibbonView.xaml
    /// </summary>
    public partial class RibbonView : Ribbon
    {
        public RibbonView()
        {
            InitializeComponent();
        }
        
        private IRegion mainRegion;
        private IRegionManager regionManager;

        public RibbonView(IRegionManager regionManager)
            : this()
        {
            this.regionManager = regionManager;
            this.mainRegion = regionManager.Regions["MainRegion"];

        }

        

        private void btnClose_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private Dictionary<string, IWebBrowserService> _webBrowsersManager = new Dictionary<string, IWebBrowserService>();


        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Utilities.TryGetInstance<IWebBrowserService>("WebBrowserService").CreateWebBrowser();
        }
    }
}
