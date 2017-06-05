
using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;

namespace BOCTS.Client.Controls.WebBrowserEx
{
    public class WebBrowserControl :System.Windows.Controls.WebBrowser, IDisposable
    {
        #region memeber

        IRibbonService _RibbonService;
        IRibbonService RibbonService
        {
            get
            {
                if (_RibbonService == null)
                    _RibbonService = Utility.TryGetInstance<IRibbonService>("RibbonService");
                return _RibbonService;
            }
        }
        #endregion

        #region 构造函数
        public WebBrowserControl()
        {
            this.ObjectForScripting = new ScriptConnector(this);
            this.ScriptErrorsSuppressed = false;
            this.ShowScriptError = false;
        }
        #endregion

        void DisConnectRibbon()
        {
            if (RibbonService == null)
                return;
            RibbonMenu.RibbonMenuHelper.DisConnect(this);
        }
        internal void ConnectRibbon()
        {
            if (RibbonService == null)
                return;
            RibbonMenu.RibbonMenuHelper.Initialize(RibbonService, this);
        }
   
        internal override void OnTitleChange(string text)
        {
            base.OnTitleChange(text);
            var s = text;
            if (s.Length > 10)
            {
                s = s.Substring(0, 10) + "...";
            }
            ILayoutContent lc = this as ILayoutContent;
            lc.Title = s;
            lc.ToolTip = text;
        }
        internal override void OnNewWindow3(ref object ppDisp, ref bool Cancel, uint dwFlags, string bstrUrlContext, string bstrUrl)
        {
            base.OnNewWindow3(ref ppDisp, ref Cancel, dwFlags, bstrUrlContext, bstrUrl);
            if (!Cancel)
            {
                var parent = ComWindowBase.GetWindow(this);
                ComWindowBase cw = null;
                cw = ComDockWindow.CreateWindow(parent, bstrUrl, string.Empty, string.Empty, false);
                cw.show();

                var dd = cw._WebBrowserControl.ActiveXInstance as BOC.UOP.Win32.UnsafeNativeMethods.IWebBrowser2;
                dd.RegisterAsBrowser = true;
                ppDisp = dd.Application;

            }
        }

        protected override void OnClosed()
        {
            (this as ILayoutContent).Close();
            base.OnClosed();
        }
        internal override void OnNavigating(NavigatingCancelEventArgs e)
        {
            base.OnNavigating(e);
            ILayoutContent lc = this as ILayoutContent;
            lc.Title = "页面加载中...";
            lc.IconSource = null;
        }
        internal override void OnLoadCompleted(NavigationEventArgs e)
        {
            base.OnLoadCompleted(e);
            if (string.IsNullOrEmpty(e.Uri.Host))
                return;
            string iconPath = "http://" + e.Uri.Host + "/favicon.ico";
            dynamic doc = this.Document;
            var collect = doc.GetElementsByTagName("link");
            if (collect is System.MarshalByRefObject)
            {
                foreach (var element in collect)
                {
                    if ("SHORTCUT ICON".Equals(element.GetAttribute("rel"), StringComparison.InvariantCultureIgnoreCase))
                    {
                        iconPath = element.GetAttribute("href");

                    }
                }
            }
            Uri uri = null;

            if (Uri.IsWellFormedUriString(iconPath, UriKind.Relative))
            {
                uri = new Uri(new Uri("http://" + e.Uri.Host), iconPath);
            }
            else
            {
                uri = new Uri(iconPath);
            }
            (this as ILayoutContent).IconSource = new BitmapImage(uri);
        }


        #region ILayoutContent
        bool _CanAutoHide = true;
        bool ILayoutContent.CanAutoHide
        {
            get { return _CanAutoHide; }
            set
            {
                if (value == _CanAutoHide)
                    return;
                _CanAutoHide = value;
                notifyPropertyChanged("CanAutoHide");
            }
        }
        bool _CanClose = true;
        bool ILayoutContent.CanClose
        {
            get { return _CanClose; }
            set
            {
                if (value == _CanClose)
                    return;
                _CanClose = value;
                notifyPropertyChanged("CanClose");
            }
        }
        bool _CanFloat = true;
        bool ILayoutContent.CanFloat
        {
            get { return _CanFloat; }
            set
            {
                if (value == _CanFloat)
                    return;
                _CanFloat = value;
                notifyPropertyChanged("CanFloat");
            }
        }
        bool _CanHide = false;
        bool ILayoutContent.CanHide
        {
            get { return _CanHide; }
            set
            {
                if (value == _CanHide)
                    return;
                _CanHide = value;
                notifyPropertyChanged("CanHide");
            }
        }

        bool ILayoutContent.Close()
        {
            CancelEventArgs arg = new CancelEventArgs();
            if (this.Closing != null)
            {
                this.Closing(this, arg);
            }
            if (arg.Cancel)
                return true;
            if (this.Closed != null)
                this.Closed(this, new EventArgs());
            this.Dispose(true);
            return false;
        }

        public event EventHandler Closed;

        public event EventHandler<CancelEventArgs> Closing;


        object ILayoutContent.Content
        {
            get { return this; }
        }

        string _ContentId = Guid.NewGuid().ToString();
        string ILayoutContent.ContentId
        {
            get { return _ContentId; }
        }
        string _Description;
        string ILayoutContent.Description
        {
            get { return _Description; }
            set
            {
                if (value == _Description)
                    return;
                _Description = value;
                notifyPropertyChanged("Description");
            }
        }
        double _FloatingHeight;
        double ILayoutContent.FloatingHeight
        {
            get { return _FloatingHeight; }
            set
            {
                if (value == _FloatingHeight)
                    return;
                _FloatingHeight = value;
                notifyPropertyChanged("FloatingHeight");
            }
        }
        double _FloatingLeft;
        double ILayoutContent.FloatingLeft
        {
            get { return _FloatingLeft; }
            set
            {
                if (value == _FloatingLeft)
                    return;
                _FloatingLeft = value;
                notifyPropertyChanged("FloatingLeft");
            }
        }
        double _FloatingTop;
        double ILayoutContent.FloatingTop
        {
            get { return _FloatingTop; }
            set
            {
                if (value == _FloatingTop)
                    return;
                _FloatingTop = value;
                notifyPropertyChanged("FloatingTop");
            }
        }
        double _FloatingWidth;
        double ILayoutContent.FloatingWidth
        {
            get
            {
                return _FloatingWidth;
            }
            set
            {
                if (value == _FloatingWidth)
                    return;
                _FloatingWidth = value;
                notifyPropertyChanged("FloatingWidth");
            }
        }

        ImageSource _IconSource;
        ImageSource ILayoutContent.IconSource
        {
            get { return _IconSource; }
            set
            {
                if (value == _IconSource)
                    return;
                _IconSource = value;
                notifyPropertyChanged("IconSource");
            }
        }

        bool _IsActive;
        bool ILayoutContent.IsActive
        {
            get { return _IsActive; }
            set
            {
                if (value == _IsActive)
                    return;
                _IsActive = value;
                if (_IsActive)
                    ConnectRibbon();
                else
                    DisConnectRibbon();
                if (this.IsActiveChanged != null)
                    this.IsActiveChanged(this, new EventArgs());
                notifyPropertyChanged("IsActive");
            }
        }

        public event EventHandler IsActiveChanged;

        bool _IsDocument = false;
        bool ILayoutContent.IsDocument
        {
            get { return _IsDocument; }
            set
            {
                if (value == _IsDocument)
                    return;
                _IsDocument = value;
                notifyPropertyChanged("IsDocument");
            }
        }

        bool _IsFloating;
        bool ILayoutContent.IsFloating
        {
            get { return _IsFloating; }
            set
            {
                if (value == _IsFloating)
                    return;
                _IsFloating = value;
                notifyPropertyChanged("IsFloating");
            }
        }
        bool _IsMaximized;
        bool ILayoutContent.IsMaximized
        {
            get { return _IsMaximized; }
            set
            {
                if (value == _IsMaximized)
                    return;
                _IsMaximized = value;
                notifyPropertyChanged("IsMaximized");
            }
        }
        bool _IsSelected;
        bool ILayoutContent.IsSelected
        {
            get { return _IsSelected; }
            set
            {
                if (value == _IsSelected)
                    return;
                _IsSelected = value;
                notifyPropertyChanged("IsSelected");
            }
        }

        public event EventHandler IsSelectedChanged;

        string _Title = "新页面";
        string ILayoutContent.Title
        {
            get
            {
                return _Title;
            }
            set
            {
                if (value == _Title)
                    return;
                _Title = value;
                notifyPropertyChanged("Title");
            }
        }
        object _ToolTip;
        object ILayoutContent.ToolTip
        {
            get
            {
                return _ToolTip;
            }
            set
            {
                if (value == _ToolTip)
                    return;
                _ToolTip = value;
                notifyPropertyChanged("ToolTip");
            }

        }
        void notifyPropertyChanged(string name)
        {
            if (PropertyChanged != null)
                this.PropertyChanged(this, new PropertyChangedEventArgs(name));
        }
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion
    }
}
