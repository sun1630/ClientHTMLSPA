using BOCTS.Client.FrameWork;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows;

namespace BOC.UOP.Controls.WebBrowserEx.Com
{
    [ComVisible(true)]
    public class ScriptConnector
    {
        private WebBrowserControl _WebBrowserEx;
        public ActivextConnector ActivextConnector { get; private set; }

        public ScriptConnector(WebBrowserControl webBrowserEx)
        {
            _WebBrowserEx = webBrowserEx;
            ActivextConnector = new ActivextConnector((webBrowserEx as ILayoutContent).ContentId);
        }
        public ComWindowBase WindowOpen(string url, string name, string specs, bool replace)
        {
            var parent = ComWindowBase.GetWindow(_WebBrowserEx);
            ComWindowBase cw = null;
            cw=ComDockWindow.CreateWindow(parent, url, name, specs, replace);
            
            cw.show();
            return cw;
        }
    }
}
