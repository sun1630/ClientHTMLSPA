using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Windows.Controls;
using System.Windows.Media;
using System.Xml.Linq;

namespace BOC.UOP.Controls.WebBrowserEx
{
    [Export(typeof(BrowserView))]
    public class BrowserView : IConfirmNavigationRequest
    {

        [Import("WindowService", typeof(IWindowService))]
        Lazy<IWindowService> WindowService { get; set; }
        public void ConfirmNavigationRequest(NavigationContext navigationContext, Action<bool> continuationCallback)
        {
            String item = null;

            if (navigationContext.Parameters != null)
            {
                item = navigationContext.Parameters["url"];
            }
            throw new NotImplementedException();
        }

        public bool IsNavigationTarget(NavigationContext navigationContext)
        {
            return true;
        }

        public void OnNavigatedFrom(NavigationContext navigationContext)
        {
            throw new NotImplementedException();
        }

        public void OnNavigatedTo(NavigationContext navigationContext)
        {
            var wc = new WebBrowserControl();
            wc.ScriptErrorsSuppressed = Utility.ScriptErrorsSuppressed;
            wc.Navigate(navigationContext.Uri.OriginalString.Replace("BrowserView?", ""));

            WindowService.Value.Dock(wc, AnchorableShowStrategy.Most);
            var lc = wc as ILayoutContent;
            lc.IsActive = true;
            wc.ConnectRibbon();

        }


    }
}
