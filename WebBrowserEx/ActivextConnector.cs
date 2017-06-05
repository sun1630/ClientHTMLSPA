using BOCTS.Client.FrameWork;
using Microsoft.Practices.ServiceLocation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BOC.UOP.Controls.WebBrowserEx
{
    public class ActivextConnector
    {
        public IRibbonService RibbonService{get;private set;}
        public IWindowService WindowService { get; private set; }
        public string WindowID { get; private set; }
        public ActivextConnector(string windowsID)
        {
            this.WindowID = windowsID;
            WindowService = Utility.TryGetInstance<IWindowService>("WindowService");
            RibbonService = Utility.TryGetInstance<IRibbonService>("RibbonService");
        }
    }
}
