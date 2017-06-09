using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Collections;
using System.Drawing;

namespace BOC.UOP.Controls.WebBrowserEx
{
    //[Export("WebBrowserService",typeof(IWebBrowserService))]
    public partial class WebBrowserService //: IDictionary<string, WebBrowserControl>
    {
        public Dictionary<string, WebBrowserControl> _webBrowsersManager = new Dictionary<string, WebBrowserControl>();

        public WebBrowserControl this[string key]
        {
            get => _webBrowsersManager[key];
            set => _webBrowsersManager[key] = value;
        }


        public void ShowExternalTestPanel()
        {

            new Form1()
                    .Show();
        }
    }
}
