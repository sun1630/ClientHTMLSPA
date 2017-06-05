using BOC.UOP.AppModel;
using BOC.UOP.Controls.WebBrowserEx.AppModel;
using BOC.UOP.Internal;
using BOC.UOP.Interop;
using BOC.UOP.Utility;
using BOC.UOP.Win32;
using Fasterflect;
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Packaging;
using System.Net;
using System.Runtime;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Threading;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Navigation;

namespace BOC.UOP.Controls
{
    public class WebBrowser : BOC.UOP.Interop.ActiveXHost
    {
       
        internal class WebOCHostingAdaptor
        {
            protected WebBrowser _webBrowser;
            internal virtual object ObjectForScripting
            {
                get
                {
                    return this._webBrowser.ObjectForScripting;
                }
                set
                {
                }
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            internal WebOCHostingAdaptor(WebBrowser webBrowser)
            {
                this._webBrowser = webBrowser;
            }
            [SecurityCritical]
            internal virtual object CreateWebOC()
            {
                new SecurityPermission(SecurityPermissionFlag.UnmanagedCode).Assert();
                object result;
                try
                {
                    result = Activator.CreateInstance(Type.GetTypeFromCLSID(new Guid("8856f961-340a-11d0-a96b-00c04fd705a2")));
                }
                finally
                {
                    CodeAccessPermission.RevertAssert();
                }
                return result;
            }
            [SecurityCritical]
            internal virtual object CreateEventSink()
            {
                return new WebBrowserEvent(this._webBrowser);
            }
        }
        private class WebOCHostedInBrowserAdaptor : WebBrowser.WebOCHostingAdaptor
        {
            private object _threadBoundObjectForScripting;
            internal override object ObjectForScripting
            {
                [SecurityCritical, SecuritySafeCritical]
                get
                {
                    return this._threadBoundObjectForScripting;
                }
                [SecurityCritical, SecuritySafeCritical]
                set
                {
                    this._threadBoundObjectForScripting = ((value == null) ? null : ActiveXHelper.CreateIDispatchSTAForwarder(value));
                }
            }
            internal WebOCHostedInBrowserAdaptor(WebBrowser webBrowser)
                : base(webBrowser)
            {
            }
            [SecurityCritical, SecuritySafeCritical]
            static WebOCHostedInBrowserAdaptor()
            {
                Guid gUID = typeof(UnsafeNativeMethods.IDocHostUIHandler).GUID;
                Guid guid = new Guid("e302cb55-5f9d-41a3-9ef3-61827fb8b46d");
                int num = UnsafeNativeMethods.CoRegisterPSClsid(ref gUID, ref guid);
                if (num != 0)
                {
                    Marshal.ThrowExceptionForHR(num);
                }
            }
            [SecurityCritical]
            internal override object CreateWebOC()
            {
                //TODO:zhaodian
                var d = Application.Current.GetFieldValue("BrowserCallbackServices");
                var s = d.CallMethod("CreateWebBrowserControlInBrowserProcess", null);
                IntPtr pUnk = (IntPtr)s;// Application.Current.BrowserCallbackServices.CreateWebBrowserControlInBrowserProcess();
                object typedObjectForIUnknown = Marshal.GetTypedObjectForIUnknown(pUnk, typeof(UnsafeNativeMethods.IWebBrowser2));
                Marshal.Release(pUnk);
                return typedObjectForIUnknown;
            }
            [SecurityCritical]
            internal override object CreateEventSink()
            {
                return ActiveXHelper.CreateIDispatchSTAForwarder((UnsafeNativeMethods.DWebBrowserEvents2)base.CreateEventSink());
            }
        }
        internal const string AboutBlankUriString = "about:blank";
        internal bool _canGoBack;
        internal bool _canGoForward;
        private static readonly bool IsWebOCPermissionRestricted;
        [SecurityCritical]
        private UnsafeNativeMethods.IWebBrowser2 _axIWebBrowser2;
        private WebBrowser.WebOCHostingAdaptor _hostingAdaptor;
        private ConnectionPointCookie _cookie;
        //TODO:zhaodian
        private static SecurityCriticalDataForSet<dynamic> _rbw;
        private object _objectForScripting;
        private Stream _documentStream;
        private SecurityCriticalDataForSet<bool> _navigatingToAboutBlank;
        private SecurityCriticalDataForSet<Guid> _lastNavigation;
        /// <summary>Occurs just before navigation to a document.</summary>
        public event NavigatingCancelEventHandler Navigating;
        /// <summary>Occurs when the document being navigated to is located and has started downloading.</summary>
        public event NavigatedEventHandler Navigated;
        /// <summary>Occurs when the document being navigated to has finished downloading.</summary>
        public event LoadCompletedEventHandler LoadCompleted;
        public Version Version
        {
            get
            {
                string fileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "mshtml.dll");
                FileVersionInfo versionInfo = FileVersionInfo.GetVersionInfo(fileName);
                return new Version(versionInfo.FileMajorPart, versionInfo.FileMinorPart, versionInfo.FileBuildPart, versionInfo.FilePrivatePart);
            }
        }
        public BOC.UOP.Win32.NativeMethods.WebBrowserReadyState ReadyState
        {
            get
            {
                if (this.Document == null)
                {
                    return BOC.UOP.Win32.NativeMethods.WebBrowserReadyState.UnInitialized;
                }
                return this.AxIWebBrowser2.ReadyState;
            }
        }
        public bool IsOffline
        {
            get
            {
                return this.AxIWebBrowser2.Offline;
            }
        }
        public bool IsBusy
        {
            get
            {
                return !(this.Document == null) && this.AxIWebBrowser2.Busy;
            }
        }
        bool _ScrollBarsEnabled=true;
        public bool ScrollBarsEnabled
        {
            get
            {
                return _ScrollBarsEnabled;
            }
            set
            {
                _ScrollBarsEnabled = value;
            }
        }

        bool _IsWebBrowserContextMenuEnabled = true;
        public bool IsWebBrowserContextMenuEnabled
        {
            get
            {
                return _IsWebBrowserContextMenuEnabled;
            }
            set
            {
                _IsWebBrowserContextMenuEnabled = false;
            }
        }
        public bool ScriptErrorsSuppressed
        {
            get
            {
                return this.AxIWebBrowser2.Silent;
            }
            set
            {
                if (value != this.ScriptErrorsSuppressed)
                {
                    this.AxIWebBrowser2.Silent = value;
                }
            }
        }
        bool _ShowScriptError = true;
        public bool ShowScriptError
        {
            get
            {
                return _ShowScriptError;
            }
            set
            {
                _ShowScriptError = value;
            }
        }
        public Uri Source
        {
            [SecurityCritical]
            get
            {
                base.VerifyAccess();
                string text = this.AxIWebBrowser2.LocationURL;
                if (this.NavigatingToAboutBlank)
                {
                    text = null;
                }
                if (!string.IsNullOrEmpty(text))
                {
                    return new Uri(text);
                }
                return null;
            }
            set
            {
                base.VerifyAccess();
                this.Navigate(value);
            }
        }
        /// <summary>Gets a value that indicates whether there is a document to navigate back to.</summary>
        /// <returns>A <see cref="T:System.Boolean" /> value that indicates whether there is a document to navigate back to.</returns>
        public bool CanGoBack
        {
            get
            {
                base.VerifyAccess();
                return !base.IsDisposed && this._canGoBack;
            }
        }
        /// <summary>Gets a value that indicates whether there is a document to navigate forward to.</summary>
        /// <returns>A <see cref="T:System.Boolean" /> value that indicates whether there is a document to navigate forward to.</returns>
        public bool CanGoForward
        {
            get
            {
                base.VerifyAccess();
                return !base.IsDisposed && this._canGoForward;
            }
        }
        /// <summary>Gets or sets an instance of a public class, implemented by the host application, that can be accessed by script from a hosted document.</summary>
        /// <returns>The <see cref="T:System.Object" /> that is an instance of a public class, implemented by the host application, that can be accessed by script from a hosted document.</returns>
        /// <exception cref="T:System.ArgumentException">
        ///   <see cref="P:System.Windows.Controls.WebBrowser.ObjectForScripting" /> is set with an instance of type that is not COMVisible.</exception>
        public object ObjectForScripting
        {
            get
            {
                base.VerifyAccess();
                return this._objectForScripting;
            }
            [SecurityCritical]
            set
            {
                base.VerifyAccess();
                if (value != null)
                {
                    Type type = value.GetType();
                    if (!Marshal.IsTypeVisibleFromCom(type))
                    {
                        throw new ArgumentException("NeedToBeComVisible");
                    }
                }
                this._objectForScripting = value;
                this._hostingAdaptor.ObjectForScripting = value;
            }
        }
        /// <summary>Gets the Document object that represents the hosted HTML page. </summary>
        /// <returns>A Document object.</returns>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        public object Document
        {
            [SecurityCritical]
            get
            {
                base.VerifyAccess();
                SecurityHelper.DemandUnmanagedCode();
                return this.AxIWebBrowser2.Document;
            }
        }
        internal UnsafeNativeMethods.IHTMLDocument2 NativeHTMLDocument
        {
            [SecurityCritical]
            get
            {
                object document = this.AxIWebBrowser2.Document;
                return document as UnsafeNativeMethods.IHTMLDocument2;
            }
        }
        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        internal UnsafeNativeMethods.IWebBrowser2 AxIWebBrowser2
        {
            [SecurityCritical]
            get
            {
                if (this._axIWebBrowser2 == null)
                {
                    if (base.IsDisposed)
                    {
                        throw new ObjectDisposedException(base.GetType().Name);
                    }
                    base.TransitionUpTo(ActiveXHelper.ActiveXState.Running);
                }
                if (this._axIWebBrowser2 == null)
                {
                    throw new InvalidOperationException("WebBrowserNoCastToIWebBrowser2");
                }
                return this._axIWebBrowser2;
            }
        }
        internal WebBrowser.WebOCHostingAdaptor HostingAdaptor
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._hostingAdaptor;
            }
        }
        internal Stream DocumentStream
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._documentStream;
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            set
            {
                this._documentStream = value;
            }
        }
        internal bool NavigatingToAboutBlank
        {
            get
            {
                return this._navigatingToAboutBlank.Value;
            }
            [SecurityCritical]
            set
            {
                this._navigatingToAboutBlank.Value = value;
            }
        }
        internal Guid LastNavigation
        {
            get
            {
                return this._lastNavigation.Value;
            }
            [SecurityCritical]
            set
            {
                this._lastNavigation.Value = value;
            }
        }
        internal static bool IsWebOCHostedInBrowserProcess
        {
            get
            {
                if (!WebBrowser.IsWebOCPermissionRestricted)
                {
                    return false;
                }
                HostingFlags hostingFlags = (HostingFlags)typeof(BrowserInteropHelper).GetPropertyValue("HostingFlags");
                return (hostingFlags & HostingFlags.hfHostedInIE) != (HostingFlags)0 || (hostingFlags & HostingFlags.hfIsBrowserLowIntegrityProcess) != (HostingFlags)0;
            }
        }
        private static dynamic RootBrowserWindow
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                if (WebBrowser._rbw.Value == null && Application.Current != null)
                {
                    WebBrowser._rbw.Value = Application.Current.MainWindow;
                }
                return WebBrowser._rbw.Value;
            }
        }
        /// <summary>Initializes a new instance of the <see cref="T:System.Windows.Controls.WebBrowser" /> class.</summary>
        [SecurityCritical]
        public WebBrowser()
            : base(new Guid("8856f961-340a-11d0-a96b-00c04fd705a2"), true)
        {
            if (SafeSecurityHelper.IsFeatureDisabled(SafeSecurityHelper.KeyToRead.WebBrowserDisable))
            {
                SecurityHelper.DemandWebBrowserPermission();
            }
            else
            {
                new WebBrowserPermission(WebBrowserPermissionLevel.Safe).Demand();
            }
            if (WebBrowser.IsWebOCPermissionRestricted)
            {
                base.Loaded += new RoutedEventHandler(this.LoadedHandler);
            }
            this._hostingAdaptor = (WebBrowser.IsWebOCHostedInBrowserProcess ? new WebBrowser.WebOCHostedInBrowserAdaptor(this) : new WebBrowser.WebOCHostingAdaptor(this));
            
        }
        /// <summary>Navigate asynchronously to the document at the specified <see cref="T:System.Uri" />.</summary>
        /// <param name="source">The <see cref="T:System.Uri" /> to navigate to.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Security.SecurityException">Navigation from an application that is running in partial trust to a <see cref="T:System.Uri" /> that is not located at the site of origin.</exception>
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void Navigate(Uri source)
        {
            this.Navigate(source, null, null, null);
        }
        /// <summary>Navigates asynchronously to the document at the specified URL.</summary>
        /// <param name="source">The URL to navigate to.</param>
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void Navigate(string source)
        {
            this.Navigate(source, null, null, null);
        }
        /// <summary>Navigate asynchronously to the document at the specified <see cref="T:System.Uri" /> and specify the target frame to load the document's content into. Additional HTTP POST data and HTTP headers can be sent to the server as part of the navigation request.</summary>
        /// <param name="source">The <see cref="T:System.Uri" /> to navigate to.</param>
        /// <param name="targetFrameName">The name of the frame to display the document's content in.</param>
        /// <param name="postData">HTTP POST data to send to the server when the source is requested.</param>
        /// <param name="additionalHeaders">HTTP headers to send to the server when the source is requested.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Security.SecurityException">Navigation from an application that is running in partial trust:To a <see cref="T:System.Uri" /> that is not located at the site of origin, or <paramref name="targetFrameName" /> name is not null or empty.</exception>
        public void Navigate(Uri source, string targetFrameName, byte[] postData, string additionalHeaders)
        {
            object obj = targetFrameName;
            object obj2 = postData;
            object obj3 = additionalHeaders;
            this.DoNavigate(source, ref obj, ref obj2, ref obj3, false);
        }
        /// <summary>Navigates asynchronously to the document at the specified URL and specify the target frame to load the document's content into. Additional HTTP POST data and HTTP headers can be sent to the server as part of the navigation request.</summary>
        /// <param name="source">The URL to navigate to.</param>
        /// <param name="targetFrameName">The name of the frame to display the document's content in.</param>
        /// <param name="postData">HTTP POST data to send to the server when the source is requested.</param>
        /// <param name="additionalHeaders">HTTP headers to send to the server when the source is requested.</param>
        public void Navigate(string source, string targetFrameName, byte[] postData, string additionalHeaders)
        {
            object obj = targetFrameName;
            object obj2 = postData;
            object obj3 = additionalHeaders;
            Uri source2 = new Uri(source);
            this.DoNavigate(source2, ref obj, ref obj2, ref obj3, true);
        }
        /// <summary>Navigate asynchronously to a <see cref="T:System.IO.Stream" /> that contains the content for a document.</summary>
        /// <param name="stream">The <see cref="T:System.IO.Stream" /> that contains the content for a document.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        public void NavigateToStream(Stream stream)
        {
            if (stream == null)
            {
                throw new ArgumentNullException("stream");
            }
            this.DocumentStream = stream;
            this.Source = null;
        }
        /// <summary>Navigate asynchronously to a <see cref="T:System.String" /> that contains the content for a document.</summary>
        /// <param name="text">The <see cref="T:System.String" /> that contains the content for a document.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        public void NavigateToString(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException("text");
            }
            MemoryStream memoryStream = new MemoryStream(text.Length);
            StreamWriter streamWriter = new StreamWriter(memoryStream);
            streamWriter.Write(text);
            streamWriter.Flush();
            memoryStream.Position = 0L;
            this.NavigateToStream(memoryStream);
        }
        /// <summary>Navigate back to the previous document, if there is one.</summary>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Runtime.InteropServices.COMException">There is no document to navigate back to.</exception>
        [SecurityCritical]
        public void GoBack()
        {
            base.VerifyAccess();
            this.AxIWebBrowser2.GoBack();
        }
        /// <summary>Navigate forward to the next HTML document, if there is one.</summary>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Runtime.InteropServices.COMException">There is no document to navigate forward to.</exception>
        [SecurityCritical]
        public void GoForward()
        {
            base.VerifyAccess();
            this.AxIWebBrowser2.GoForward();
        }
        /// <summary>Reloads the current page.</summary>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        [SecurityCritical]
        public void Refresh()
        {
            base.VerifyAccess();
            this.AxIWebBrowser2.Refresh();
        }
        /// <summary>Reloads the current page with optional cache validation.</summary>
        /// <param name="noCache">Specifies whether to refresh without cache validation.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        [SecurityCritical]
        public void Refresh(bool noCache)
        {
            base.VerifyAccess();
            int num = noCache ? 3 : 0;
            object obj = num;
            this.AxIWebBrowser2.Refresh2(ref obj);
        }
        /// <summary>Executes a script function that is implemented by the currently loaded document.</summary>
        /// <returns>The object returned by the Active Scripting call.</returns>
        /// <param name="scriptName">The name of the script function to execute.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Runtime.InteropServices.COMException">The script function does not exist.</exception>
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public object InvokeScript(string scriptName)
        {
            return this.InvokeScript(scriptName, null);
        }
        /// <summary>Executes a script function that is defined in the currently loaded document.</summary>
        /// <returns>The object returned by the Active Scripting call.</returns>
        /// <param name="scriptName">The name of the script function to execute.</param>
        /// <param name="args">The parameters to pass to the script function.</param>
        /// <exception cref="T:System.ObjectDisposedException">The <see cref="T:System.Windows.Controls.WebBrowser" /> instance is no longer valid.</exception>
        /// <exception cref="T:System.InvalidOperationException">A reference to the underlying native WebBrowser could not be retrieved.</exception>
        /// <exception cref="T:System.Runtime.InteropServices.COMException">The script function does not exist.</exception>
        [SecurityCritical]
        public object InvokeScript(string scriptName, params object[] args)
        {
            base.VerifyAccess();
            if (string.IsNullOrEmpty(scriptName))
            {
                throw new ArgumentNullException("scriptName");
            }
            UnsafeNativeMethods.IDispatchEx dispatchEx = null;
            UnsafeNativeMethods.IHTMLDocument2 nativeHTMLDocument = this.NativeHTMLDocument;
            if (nativeHTMLDocument != null)
            {
                dispatchEx = (nativeHTMLDocument.GetScript() as UnsafeNativeMethods.IDispatchEx);
            }
            Uri source = this.Source;
            if (source != null)
            {

                SecurityHelper.DemandWebPermission(source);
            }
            if (nativeHTMLDocument != null)
            {
                string url = nativeHTMLDocument.GetUrl();
                if (string.CompareOrdinal(url, this.AxIWebBrowser2.LocationURL) != 0)
                {
                    SecurityHelper.DemandWebPermission(new Uri(url, UriKind.Absolute));
                }
            }
            object result = null;
            if (dispatchEx != null)
            {
                NativeMethods.DISPPARAMS dISPPARAMS = new NativeMethods.DISPPARAMS();
                dISPPARAMS.rgvarg = IntPtr.Zero;
                try
                {
                    Guid empty = Guid.Empty;
                    string[] rgszNames = new string[]
					{
						scriptName
					};
                    int[] array = new int[]
					{
						-1
					};
                    dispatchEx.GetIDsOfNames(ref empty, rgszNames, 1, Thread.CurrentThread.CurrentCulture.LCID, array).ThrowIfFailed();
                    if (args != null)
                    {
                        Array.Reverse(args);
                    }
                    dISPPARAMS.rgvarg = ((args == null) ? IntPtr.Zero : UnsafeNativeMethods.ArrayToVARIANTHelper.ArrayToVARIANTVector(args));
                    dISPPARAMS.cArgs = (uint)((args == null) ? 0 : args.Length);
                    dISPPARAMS.rgdispidNamedArgs = IntPtr.Zero;
                    dISPPARAMS.cNamedArgs = 0u;
                    dispatchEx.InvokeEx(array[0], Thread.CurrentThread.CurrentCulture.LCID, 1, dISPPARAMS, out result, new NativeMethods.EXCEPINFO(), (UnsafeNativeMethods.IServiceProvider)nativeHTMLDocument).ThrowIfFailed();
                    return result;
                }
                finally
                {
                    if (dISPPARAMS.rgvarg != IntPtr.Zero)
                    {
                        UnsafeNativeMethods.ArrayToVARIANTHelper.FreeVARIANTVector(dISPPARAMS.rgvarg, args.Length);
                    }
                }
            }
            throw new InvalidOperationException("CannotInvokeScript");
        }
        internal virtual void OnNavigating(NavigatingCancelEventArgs e)
        {
            base.VerifyAccess();
            if (this.Navigating != null)
            {
                this.Navigating(this, e);
            }
        }

        internal virtual void OnNavigated(NavigationEventArgs e)
        {
            base.VerifyAccess();
            if (this.Navigated != null)
            {
                this.Navigated(this, e);
            }
        }
       
        internal virtual void OnLoadCompleted(NavigationEventArgs e)
        {
            base.VerifyAccess();
           
            if (this.LoadCompleted != null)
            {
                this.LoadCompleted(this, e);
            }
        }
        internal virtual void OnNewWindow2(ref object ppDisp, ref bool cancel)
        {

        }
        internal virtual void OnNewWindow3(ref object ppDisp, ref bool Cancel, uint dwFlags, string bstrUrlContext, string bstrUrl)
        {
            if (this.NewWindow3 == null)
                return;
            var e = new NewWindow3EventArgs()
            {
                dwFlags = dwFlags,
                bstrUrlContext = bstrUrlContext,
                bstrUrl = bstrUrl
            };
            this.NewWindow3(this, e);
            ppDisp = e.ppDisp;
            Cancel = e.Cancel;
        }
        public EventHandler TitleChanged;
        internal virtual void OnTitleChange(string text)
        {
            if (this.TitleChanged == null)
                return;
            this.TitleChanged(this, new EventArgs());
        }
        public EventHandler<NewWindow3EventArgs> NewWindow3;
        [SecurityCritical]
        internal override object CreateActiveXObject(Guid clsid)
        {
            return this._hostingAdaptor.CreateWebOC();
        }
        [SecurityCritical]
        internal override void AttachInterfaces(object nativeActiveXObject)
        {
            this._axIWebBrowser2 = (UnsafeNativeMethods.IWebBrowser2)nativeActiveXObject;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal override void DetachInterfaces()
        {
            this._axIWebBrowser2 = null;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal override void CreateSink()
        {
            this._cookie = new ConnectionPointCookie(this._axIWebBrowser2, this._hostingAdaptor.CreateEventSink(), typeof(UnsafeNativeMethods.DWebBrowserEvents2));
        }
        [SecurityCritical]
        internal override void DetachSink()
        {
            if (this._cookie != null)
            {
                this._cookie.Disconnect();
                this._cookie = null;
            }
        }
        [SecurityCritical]
        [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
        internal override ActiveXSite CreateActiveXSite()
        {
            return new WebBrowserSite(this);
        }

        [SecurityCritical]
        internal void CleanInternalState()
        {
            this.NavigatingToAboutBlank = false;
            this.DocumentStream = null;
        }
        [SecurityCritical, SecuritySafeCritical]
        protected override bool TranslateAcceleratorCore(ref MSG msg, ModifierKeys modifiers)
        {
            this.SyncUIActiveState();
            return base.ActiveXInPlaceActiveObject.TranslateAccelerator(ref msg) == 0;
        }
        [SecurityCritical]
        protected override bool TabIntoCore(TraversalRequest request)
        {
            bool flag = base.DoVerb(-4);
            if (flag)
            {
                base.ActiveXState = ActiveXHelper.ActiveXState.UIActive;
            }
            return flag;
        }
        [SecurityCritical, SecuritySafeCritical]
        static WebBrowser()
        {
            WebBrowser.IsWebOCPermissionRestricted = !SecurityHelper.CallerAndAppDomainHaveUnrestrictedWebBrowserPermission();
            if (WebBrowser.IsWebOCPermissionRestricted)
            {
                if (BrowserInteropHelper.IsBrowserHosted)
                {
                    if ((Helper.HostingFlags & HostingFlags.hfHostedInIEorWebOC) == (HostingFlags)0)
                    {
                        int num = AppSecurityManager.MapUrlToZone(BrowserInteropHelper.Source);
                        if (num != 1 && num != 2 && num != 0 && !RegistryKeys.ReadLocalMachineBool("Software\\Microsoft\\.NETFramework\\Windows Presentation Foundation\\Hosting", "UnblockWebBrowserControl"))
                        {
                            throw new SecurityException("AffectedByMsCtfIssue");
                        }
                    }
                }
                else
                {
                    string fileName = Path.GetFileName(UnsafeNativeMethods.GetModuleFileName(default(HandleRef)));
                    if (string.Compare(fileName, "AppLaunch.exe", StringComparison.OrdinalIgnoreCase) == 0)
                    {
                        SecurityHelper.DemandWebBrowserPermission();
                    }
                }
                WebBrowser.RegisterWithRBW();
            }
            WebBrowser.TurnOnFeatureControlKeys();
        }
        [SecurityCritical, SecuritySafeCritical]
        private void LoadedHandler(object sender, RoutedEventArgs args)
        {
            PresentationSource presentationSource = typeof(PresentationSource).CallMethod("CriticalFromVisual", new object[] { this }) as PresentationSource;
            if (presentationSource != null && presentationSource.RootVisual.GetType().ToString().Contains("PopupRoot"))
            {
                throw new InvalidOperationException("CannotBeInsidePopup");
            }
        }
        private static void RegisterWithRBW()
        {
            if (WebBrowser.RootBrowserWindow != null)
            {
                WebBrowser.RootBrowserWindow.AddLayoutUpdatedHandler();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private static void TurnOnFeatureControlKeys()
        {
            Version version = Environment.OSVersion.Version;
            if (version.Major == 5 && version.Minor == 2 && version.MajorRevision == 0)
            {
                return;
            }
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(0, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(1, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(2, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(3, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(4, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(5, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(6, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(7, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(8, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(9, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(10, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(11, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(12, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(13, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(14, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(15, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(16, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(17, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(18, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(20, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(22, 2, true);
            UnsafeNativeMethods.CoInternetSetFeatureEnabled(25, 2, true);
            if (WebBrowser.IsWebOCPermissionRestricted)
            {
                UnsafeNativeMethods.CoInternetSetFeatureEnabled(23, 2, true);
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void DoNavigate(Uri source, ref object targetFrameName, ref object postData, ref object headers, bool ignoreEscaping = false)
        {
            base.VerifyAccess();
            NativeMethods.IOleCommandTarget oleCommandTarget = (NativeMethods.IOleCommandTarget)this.AxIWebBrowser2;
            object obj = false;
           
            int d = 0;
            oleCommandTarget.Exec(null, 23, 0, new object[]
			{
				obj
			},ref d);
            this.LastNavigation = Guid.NewGuid();
            if (source == null)
            {
                this.NavigatingToAboutBlank = true;
                source = new Uri("about:blank");
            }
            else
            {
                this.CleanInternalState();
            }
            if (!source.IsAbsoluteUri)
            {
                throw new ArgumentException("AbsoluteUriOnly", "source");
            }
            if (source != null && string.Compare(source.Scheme, PackUriHelper.UriSchemePack, StringComparison.OrdinalIgnoreCase) == 0)
            {
                source = (Uri)typeof(BaseUriHelper).CallMethod("ConvertPackUriToAbsoluteExternallyVisibleUri", new object[] { source });
            }
            if (!string.IsNullOrEmpty((string)targetFrameName))
            {
                new WebPermission(PermissionState.Unrestricted).Demand();
            }
            else
            {
                if (!this.NavigatingToAboutBlank)
                {
                    SecurityHelper.DemandWebPermission(source);
                }
            }
            object obj2 = null;
            object obj3 = ignoreEscaping ? source.AbsoluteUri : BindUriHelper.UriToString(source);
            try
            {
                this.AxIWebBrowser2.Navigate2(ref obj3, ref obj2, ref targetFrameName, ref postData, ref headers);
            }
            catch (COMException ex)
            {
                this.CleanInternalState();
                if (ex.ErrorCode != -2147023673)
                {
                    throw;
                }
            }
        }
        private void SyncUIActiveState()
        {
            if (base.ActiveXState != ActiveXHelper.ActiveXState.UIActive && this.HasFocusWithinCore())
            {
                base.ActiveXState = ActiveXHelper.ActiveXState.UIActive;
            }
        }
        public event EventHandler Closed;
        protected virtual void OnClosed()
        {
            if (this.Closed == null)
                return;
            this.Closed(this, new EventArgs());
        }
        protected override IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg ==(int) WindowMessage.WM_PARENTNOTIFY)
            {
                if (wParam.ToInt32() == (int)WindowMessage.WM_DESTROY)
                {
                    this.OnClosed();
                }
            }
            return base.WndProc(hwnd, msg, wParam, lParam, ref handled);
        }
    }
}
