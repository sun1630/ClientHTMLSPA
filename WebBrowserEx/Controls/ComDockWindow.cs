using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows;
using BOCTS.Client.FrameWork;
using Microsoft.Practices.ServiceLocation;
using System.ComponentModel.Composition;

namespace BOC.UOP.Controls.WebBrowserEx.Com
{
    [ComVisible(true)]
    public class ComDockWindow : ComWindowBase
    {
        IWindowService _WindowService;
        internal IWindowService WindowService
        {
            get
            {
                if (_WindowService == null)
                {
                    try
                    {
                        _WindowService = ServiceLocator.Current.GetInstance<IWindowService>("WindowService");
                    }
                    catch { }
                }
                return _WindowService;
            }
        }
        public static ComWindowBase CreateWindow(ComWindowBase parent, string url, string name, string specs, bool replace)
        {
            ComWindowBase cw = null;
            switch (name.Trim().ToLower())
            {
                case "":
                case "_blank":
                    cw = new ComDockWindow(parent, url, name, specs);
                    break;
                case "_parent":
                    break;
                case "_self":
                    break;
                case "_top":
                    break;
                default:
                    if (!_ComWindows.TryGetValue(name, out cw))
                    {
                        cw = new ComDockWindow(parent, url, name, specs);
                        _ComWindows.Add(name, cw);
                    }
                    break;
            }
            return cw;
        }
        #region 构造函数
        public ComDockWindow(WebBrowserControl wc)
            : base(wc)
        {
        }
        public ComDockWindow(ComWindowBase parent, string url, string name, string specs)
            : base(new WebBrowserControl(), parent)
        {
            this.name = name;
            //为了解决 javascript 中var handler= window.open('','_blank'),之后 handler.document.write('sdfasd');出异常
            //添加!string.Equals("about:blank",url,StringComparison.InvariantCultureIgnoreCase)
            //此为临时解决办法
            //问题的根源在于 webbrowser doucment not loaded 时，脚本代码就执行到了handler.document.write('sdfasd')
            //需要进一步调查怎样确保 document ready 后，代码才执行 handler.document.write('sdfasd')
            if (!string.IsNullOrEmpty(url) && !string.Equals("about:blank",url,StringComparison.InvariantCultureIgnoreCase))
            {
                Uri uri = null;
                if (opener == null)
                    _WebBrowserControl.Navigate(url);
                else if (Uri.TryCreate(opener._WebBrowserControl.Source, url, out uri))
                    _WebBrowserControl.Navigate(uri);
            }
            else
            {
                // _WebBrowserControl.Navigate("about:blank");
            }
            ILayoutContent lc = _WebBrowserControl as ILayoutContent;
            lc.CanClose = true;
            lc.CanFloat = true;
            lc.CanAutoHide = true;
        }
        #endregion
        public override void show()
        {
            WindowService.Dock(_WebBrowserControl, AnchorableShowStrategy.Most);
            var lc = _WebBrowserControl as ILayoutContent;
            lc.IsActive = true;
            _WebBrowserControl.ConnectRibbon();
        }
        public override void close()
        {
            _WindowService.Close((_WebBrowserControl as ILayoutContent).ContentId);
        }
        public override void moveTo(double top, double left)
        {
            ILayoutContent lc = _WebBrowserControl as ILayoutContent;
            lc.FloatingTop = top;
            lc.FloatingLeft = left;
        }
        public override void resizeTo(double width, double height)
        {
            ILayoutContent lc = _WebBrowserControl as ILayoutContent;
            lc.FloatingHeight = height;
            lc.FloatingWidth = width;

        }
        public override void reFresh()
        {
            _WebBrowserControl.Refresh();
        }
        public override void focus()
        {
            ILayoutContent lc = _WebBrowserControl as ILayoutContent;
            lc.IsActive = true;
        }
    }
}
