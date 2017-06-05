using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace BOC.UOP.Controls.WebBrowserEx
{
    [Export("WebBrowserService",typeof(IWebBrowserService))]
   public class WebBrowserService:IWebBrowserService
    {
        [Import("WindowService", typeof(IWindowService))]
        Lazy<IWindowService> WindowService { get; set; }
        [Import]
        public IRegionManager TheRegionManager { private get; set; }
        [ImportingConstructor]
        public WebBrowserService()
        { }
        public void Initial()
        { }
      public void CreateWebBroser()
        {
            var wc = new WebBrowserControl();
            wc.ScriptErrorsSuppressed = Utility.ScriptErrorsSuppressed;
            (wc as ILayoutContent).CanClose = true;
            (wc as ILayoutContent).IsDocument = true;
            (wc as ILayoutContent).CanFloat = false;
            //wc.Source = new Uri(@"http://www.baidu.com");
            wc.Source = new Uri(EnvironmentData.ClientSettings.SPASiteURL);
            if (System.IO.File.Exists(Utility.FavoritePath))
            {
                var doc = XDocument.Load(Utility.FavoritePath);
                var favorite = doc.Element("favorite");
                if (favorite != null)
                {
                    var defaultpage = favorite.Element(XName.Get("defaultpage"));
                    if (defaultpage != null)
                    {
                        var source = defaultpage.Attribute(XName.Get("source"));
                        if (source != null)
                        {
                            wc.Navigate(source.Value);
                        }
                    }
                }
            }

            WindowService.Value.Dock(wc, AnchorableShowStrategy.Most);
        }
    }
}
