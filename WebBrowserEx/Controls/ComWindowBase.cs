using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows;
using System.ComponentModel.Composition;
using BOCTS.Client.FrameWork;

namespace BOC.UOP.Controls.WebBrowserEx.Com
{
    [ComVisible(true)]
    public class ComWindowBase
    {
        
        protected static Dictionary<string, ComWindowBase> _ComWindows = new Dictionary<string, ComWindowBase>();
        public static ComWindowBase GetWindow(WebBrowserControl wc)
        {
            ComWindowBase cw = null;
            if (string.IsNullOrEmpty(wc.Name))
                wc.Name = "_MainWorkSpaceBrowser";
            if (!_ComWindows.TryGetValue(wc.Name, out cw))
            {
                cw = new ComWindowBase(wc);
                _ComWindows.Add(cw.name, cw);
            }
            return cw;
        }
        internal WebBrowserControl _WebBrowserControl;
       

        public ComWindowBase(WebBrowserControl wc, ComWindowBase parent)
        {
            this._WebBrowserControl = wc;
            this.opener = parent;
            this.location = new Location(this);
            wc.Closed += wc_Closed;
        }

        void wc_Closed(object sender, EventArgs e)
        {
            this._WebBrowserControl.Closed -= wc_Closed;
            _ComWindows.Remove(name);
        }
        public ComWindowBase(WebBrowserControl wc)
            : this(wc, null)
        {
        }
       
        public string name
        {
            get
            {
                return _WebBrowserControl.Name;
            }
            set
            {
                _WebBrowserControl.Name = value;
            }
        }
        public Location location { get; set; }
        public ComWindowBase opener
        {
            get;
            internal set;
        }
        public object returnValue { get; set; }


        public virtual void show()
        {

        }
        public virtual void close()
        {

        }
        public virtual void reFresh()
        {

        }
        public virtual void focus()
        {

        }
        public virtual void moveTo(double top, double left)
        {

        }
        public virtual void resizeTo(double width, double height)
        {

        }
    }
    [ComVisible(true)]
    public class Location
    {
        private ComWindowBase _Win;
        public Location(ComWindowBase win)
        {
            _Win = win;
        }
        public string href
        {
            get
            {
                return _Win._WebBrowserControl.Source.AbsolutePath;
            }
            set
            {
                if (Uri.IsWellFormedUriString(value, UriKind.Absolute))
                {
                    _Win._WebBrowserControl.Navigate(value);
                }
                else if (Uri.IsWellFormedUriString(value, UriKind.Relative))
                {
                    if (_Win.opener == null)
                        return;
                    Uri uri = null;
                    if (Uri.TryCreate(_Win.opener._WebBrowserControl.Source, value, out uri))
                        _Win._WebBrowserControl.Source = uri;
                }
            }
        }
    }
}
