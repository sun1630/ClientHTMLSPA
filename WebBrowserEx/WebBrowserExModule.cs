﻿using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.MefExtensions.Modularity;
using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.Prism.Regions;
using Microsoft.Practices.ServiceLocation;
using System;
using System.ComponentModel.Composition;
using System.Xml.Linq;

namespace BOC.UOP.Controls.WebBrowserEx
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
           //var wc = new WebBrowserControl();
           //wc.ScriptErrorsSuppressed = Utility.ScriptErrorsSuppressed;
           //(wc as ILayoutContent).CanClose = false;
           //(wc as ILayoutContent).IsDocument = true;
           // //wc.Source = new Uri(@"http://www.baidu.com");
           // wc.Source = new Uri(EnvironmentData.ClientSettings.SPASiteURL);
           // if (System.IO.File.Exists(Utility.FavoritePath))
           //{
           //    var doc = XDocument.Load(Utility.FavoritePath);
           //   var favorite= doc.Element("favorite");
           //   if (favorite != null)
           //   {
           //       var defaultpage = favorite.Element(XName.Get("defaultpage"));
           //       if (defaultpage != null)
           //       {
           //           var source = defaultpage.Attribute(XName.Get("source"));
           //           if (source != null)
           //           {
           //               wc.Navigate(source.Value);
           //           }
           //       }
           //   }
           //}
     
           //WindowService.Value.Dock(wc, AnchorableShowStrategy.Most);
           //TheRegionManager.RegisterViewWithRegion("MainRegion", typeof(BrowserView));
       
        }
    }
}
