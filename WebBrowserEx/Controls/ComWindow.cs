using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Controls;

namespace BOC.UOP.Controls.WebBrowserEx.Com
{
    [ComVisible(true)]
    public class ComWindow : ComWindowBase
    {
        public static ComWindowBase GetWindow(WebBrowserControl wc)
        {
            ComWindowBase cw = null;
            var win = Window.GetWindow(wc);
            if (string.IsNullOrEmpty(win.Name))
                win.Name = "_MainWorkSpaceBrowser";
            if (!_ComWindows.TryGetValue(win.Name, out cw))
            {
                cw = new ComWindow(wc);
                _ComWindows.Add(cw.name, cw);
            }
            return cw;
        }
        public static ComWindowBase CreateWindow(ComWindowBase parent, string url, string name, string specs, bool replace)
        {
            ComWindowBase cw = null;
            switch (name.Trim().ToLower())
            {
                case "":
                case "_blank":
                   
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
                      
                    }
                    break;
            }
            cw.opener = parent;
            return cw;
        }

        internal Window _OwnerWindow;

        #region 构造函数
        private ComWindow(WebBrowserControl wc)
            : base(wc)
        {
            var win = Window.GetWindow(wc);
            if (string.IsNullOrEmpty(win.Name))
                win.Name = "_MainWorkSpaceBrowser";
            _OwnerWindow = win;
            _OwnerWindow.Closed += openWindow_Closed;
        }
       
        #endregion

        void openWindow_Closed(object sender, EventArgs e)
        {
            Window w = sender as Window;
            _ComWindows.Remove(w.Name);
            location = null;
        }

        public override void show()
        {
            _OwnerWindow.Show();
        }
        public override void close()
        {
            _OwnerWindow.Close();
        }
        public override void reFresh()
        {
            _WebBrowserControl.Refresh();
        }
        public override void focus()
        {
            _OwnerWindow.Focus();
        }
        public override void moveTo(double top, double left)
        {
            _OwnerWindow.Top = top;
            _OwnerWindow.Left = left;
        }
        public override void resizeTo(double width, double height)
        {
            _OwnerWindow.Width = width;
            _OwnerWindow.Height = height;
        }

    }

}
