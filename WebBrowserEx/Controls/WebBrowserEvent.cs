using BOC.UOP.AppModel;
using BOC.UOP.Controls.WebBrowserEx.AppModel;
using BOC.UOP.Internal;
using BOC.UOP.Interop;
using BOC.UOP.Utility;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Windows.Navigation;

namespace BOC.UOP.Controls
{
    [ClassInterface(ClassInterfaceType.None)]
    internal class WebBrowserEvent : InternalDispatchObject<UnsafeNativeMethods.DWebBrowserEvents2>, UnsafeNativeMethods.DWebBrowserEvents2
    {
        private WebBrowser _parent;
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
        public WebBrowserEvent(WebBrowser parent)
        {
            this._parent = parent;
        }
        [SecurityCritical, SecuritySafeCritical]
        public void BeforeNavigate2(object pDisp, ref object url, ref object flags, ref object targetFrameName, ref object postData, ref object headers, ref bool cancel)
        {
            bool flag = false;
            bool flag2 = false;
            UnsafeNativeMethods.IWebBrowser2 webBrowser=null;
            try
            {
                if (targetFrameName == null)
                {
                    targetFrameName = "";
                }
                if (headers == null)
                {
                    headers = "";
                }
                string text = (string)url;
                Uri uri = string.IsNullOrEmpty(text) ? null : new Uri(text);
                webBrowser = (UnsafeNativeMethods.IWebBrowser2)pDisp;
                

                if (this._parent.AxIWebBrowser2 == webBrowser)
                {
                    if (this._parent.NavigatingToAboutBlank && string.Compare(text, "about:blank", StringComparison.OrdinalIgnoreCase) != 0)
                    {
                        this._parent.NavigatingToAboutBlank = false;
                    }

                    if (!this._parent.NavigatingToAboutBlank && !SecurityHelper.CallerHasWebPermission(uri) && !WebBrowserEvent.IsAllowedScriptScheme(uri))
                    {
                        flag2 = true;
                    }
                    else
                    {
                        if (this._parent.NavigatingToAboutBlank)
                        {
                            uri = null;
                        }
                        NavigatingCancelEventArgs navigatingCancelEventArgs = Helper.CreateNavigatingCancelEventArgs(uri, null, null, null, NavigationMode.New, null, null, true);
                        Guid lastNavigation = this._parent.LastNavigation;
                        this._parent.OnNavigating(navigatingCancelEventArgs);
                        if (this._parent.LastNavigation != lastNavigation)
                        {
                            flag = true;
                        }
                        flag2 = navigatingCancelEventArgs.Cancel;
                    }
                }
            }
            catch
            {
                flag2 = true;
            }
            finally
            {
                if (flag2 && !flag)
                {
                    this._parent.CleanInternalState();
                }
                if (flag2 || flag)
                {
                    cancel = true;
                }
                //When you resend a navigation for the WebBrowser object, the Stop method must first be executed for pDisp. This prevents a web page that declares a canceled navigation from appearing while the new navigation is being processed. 
                //http://msdn.microsoft.com/en-us/library/aa768326(v=VS.85).aspx

                Trace.WriteLine(string.Format("{0} {1}", this._parent.ReadyState, url));
                if (webBrowser != null
                    && this._parent.ReadyState != NativeMethods.WebBrowserReadyState.Complete
                    && this._parent.ReadyState != NativeMethods.WebBrowserReadyState.Interactive
                    )
                {
                    webBrowser.Stop();
                }
            }
            
        }
        [SecurityCritical, SecuritySafeCritical]
        public void NavigateComplete2(object pDisp, ref object url)
        {
            UnsafeNativeMethods.IWebBrowser2 webBrowser = (UnsafeNativeMethods.IWebBrowser2)pDisp;
            if (this._parent.AxIWebBrowser2 == webBrowser)
            {
                if (this._parent.DocumentStream != null)
                {
                    try
                    {
                        UnsafeNativeMethods.IHTMLDocument nativeHTMLDocument = this._parent.NativeHTMLDocument;
                        if (nativeHTMLDocument != null)
                        {
                            UnsafeNativeMethods.IPersistStreamInit persistStreamInit = nativeHTMLDocument as UnsafeNativeMethods.IPersistStreamInit;
                            System.Runtime.InteropServices.ComTypes.IStream pstm = new ManagedIStream(this._parent.DocumentStream);
                            persistStreamInit.Load(pstm);
                        }
                        return;
                    }
                    finally
                    {
                        this._parent.DocumentStream = null;
                    }
                }
                string text = (string)url;
                if (this._parent.NavigatingToAboutBlank)
                {
                    text = null;
                }
                Uri uri = string.IsNullOrEmpty(text) ? null : new Uri(text);
                NavigationEventArgs e = Helper.CreateNavigationEventArgs(uri, null, null, null, null, true);
                this._parent.OnNavigated(e);
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public void DocumentComplete(object pDisp, ref object url)
        {
            UnsafeNativeMethods.IWebBrowser2 webBrowser = (UnsafeNativeMethods.IWebBrowser2)pDisp;
            if (this._parent.AxIWebBrowser2 == webBrowser)
            {
                string text = (string)url;
                if (this._parent.NavigatingToAboutBlank)
                {
                    text = null;
                }
                Uri uri = string.IsNullOrEmpty(text) ? null : new Uri(text);
                NavigationEventArgs e = Helper.CreateNavigationEventArgs(uri, null, null, null, null, true);
                this._parent.OnLoadCompleted(e);
            }
        }
        [SecurityCritical]
        public void CommandStateChange(long command, bool enable)
        {
            if (command == 2L)
            {
                this._parent._canGoBack = enable;
                return;
            }
            if (command == 1L)
            {
                this._parent._canGoForward = enable;
            }
        }
        [SecurityCritical]
        public void TitleChange(string text)
        {
            this._parent.OnTitleChange(text);
        }
        [SecurityCritical]
        public void SetSecureLockIcon(int secureLockIcon)
        {
        }
        [SecurityCritical]
        public void NewWindow2(ref object ppDisp, ref bool cancel)
        {
            this._parent.OnNewWindow2(ref ppDisp, ref cancel);
        }
        [SecurityCritical]
        public void ProgressChange(int progress, int progressMax)
        {
        }

        [SecurityCritical]
        public void StatusTextChange(string text)
        {
            this._parent.RaiseEvent(new RequestSetStatusBarEventArgs(text));
        }
        [SecurityCritical]
        public void DownloadBegin()
        {
        }
        [SecurityCritical]
        public void FileDownload(ref bool activeDocument, ref bool cancel)
        {
        }
        [SecurityCritical]
        public void PrivacyImpactedStateChange(bool bImpacted)
        {
        }
        [SecurityCritical]
        public void UpdatePageStatus(object pDisp, ref object nPage, ref object fDone)
        {
        }
        [SecurityCritical]
        public void PrintTemplateTeardown(object pDisp)
        {
        }
        [SecurityCritical]
        public void PrintTemplateInstantiation(object pDisp)
        {
        }
        [SecurityCritical]
        public void NavigateError(object pDisp, ref object url, ref object frame, ref object statusCode, ref bool cancel)
        {
           
        }
        [SecurityCritical]
        public void ClientToHostWindow(ref long cX, ref long cY)
        {
        }
        [SecurityCritical]
        public void WindowClosing(bool isChildWindow, ref bool cancel)
        {

        }
        [SecurityCritical]
        public void WindowSetHeight(int height)
        {

        }
        [SecurityCritical]
        public void WindowSetWidth(int width)
        {

        }
        [SecurityCritical]
        public void WindowSetTop(int top)
        {

        }
        [SecurityCritical]
        public void WindowSetLeft(int left)
        {

        }
        [SecurityCritical]
        public void WindowSetResizable(bool resizable)
        {

        }
        [SecurityCritical]
        public void OnTheaterMode(bool theaterMode)
        {
        }
        [SecurityCritical]
        public void OnFullScreen(bool fullScreen)
        {
        }
        [SecurityCritical]
        public void OnStatusBar(bool statusBar)
        {
        }
        [SecurityCritical]
        public void OnMenuBar(bool menuBar)
        {
        }
        [SecurityCritical]
        public void OnToolBar(bool toolBar)
        {
        }
        [SecurityCritical]
        public void OnVisible(bool visible)
        {
        }
        [SecurityCritical]
        public void OnQuit()
        {

        }
        [SecurityCritical]
        public void PropertyChange(string szProperty)
        {

        }
        [SecurityCritical]
        public void DownloadComplete()
        {
        }
        [SecurityCritical]
        public void SetPhishingFilterStatus(uint phishingFilterStatus)
        {
        }
        [SecurityCritical]
        public void WindowStateChanged(uint dwFlags, uint dwValidFlagsMask)
        {

        }
        [SecurityCritical, SecurityTreatAsSafe]
        private static bool IsAllowedScriptScheme(Uri uri)
        {
            return uri != null && (uri.Scheme == "javascript" || uri.Scheme == "vbscript");
        }


        public void NewWindow3(ref object ppDisp, ref bool Cancel, uint dwFlags, string bstrUrlContext, string bstrUrl)
        {
            this._parent.OnNewWindow3(ref ppDisp, ref  Cancel, dwFlags, bstrUrlContext, bstrUrl);
        }
    }

}
