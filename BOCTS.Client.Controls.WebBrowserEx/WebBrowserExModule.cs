using BOC.UOP.Platform.Services;
using Microsoft.Practices.Prism.MefExtensions.Modularity;
using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.Prism.Regions;
using Microsoft.Practices.ServiceLocation;
using System;
using System.ComponentModel.Composition;
using System.Xml.Linq;

namespace BOCTS.Client.Controls.WebBrowserEx
{
    [ModuleExport(typeof(WebBrowserExModule))]
    public class WebBrowserExModule : IModule
    {
        [Import("WindowService", typeof(IWindowService))]
        Lazy<IWindowService> WindowService { get; set; }
        [Import]
        public IRegionManager TheRegionManager { private get; set; }
        [ImportingConstructor]
        public WebBrowserExModule()
        {

        }
        public void Initialize()
        {
           var wc = new WebBrowserControl();
           wc.ScriptErrorsSuppressed = Utility.ScriptErrorsSuppressed;
           (wc as ILayoutContent).CanClose = false;
           (wc as ILayoutContent).IsDocument = true;
           wc.Source = new Uri("about:blank");
           if (System.IO.File.Exists(Utility.FavoritePath))
           {
               var doc = XDocument.Load(Utility.FavoritePath);
              var favorite= doc.Element("favorite");
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
           TheRegionManager.RegisterViewWithRegion("MainRegion", typeof(BrowserView));
       
        }
    }
}
