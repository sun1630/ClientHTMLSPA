using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Security;
using System.Text;
using System.Threading;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Threading;

namespace BOC.UOP.Controls
{
    internal class WebBrowserSite :
        ActiveXSite,
        UnsafeNativeMethods.IDocHostUIHandler,
        UnsafeNativeMethods.IOleControlSite,
        UnsafeNativeMethods.IServiceProvider,
        UnsafeNativeMethods.IDocHostShowUI
        ,NativeMethods.IOleCommandTarget //该接口导致window.close工作不正常，待解决
    {
        public delegate void StopEventHandler(object sender);
        private readonly NewWindowManager _manager;

        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
        internal WebBrowserSite(WebBrowser host)
            : base(host)
        {
            _manager = new NewWindowManager();

        }
        int UnsafeNativeMethods.IDocHostUIHandler.ShowContextMenu(int dwID, NativeMethods.POINT pt, object pcmdtReserved, object pdispReserved)
        {
            WebBrowser wb = (WebBrowser)base.Host;
            if (wb.IsWebBrowserContextMenuEnabled)
                return 1;
            else
                return 0;
        }
        [SecurityCritical, SecuritySafeCritical]
        int UnsafeNativeMethods.IDocHostUIHandler.GetHostInfo(NativeMethods.DOCHOSTUIINFO info)
        {
            //TODO:zhaodian:ScrollBarsEnabled 等属性的设置，参考：DOCHOSTUIFLAG
            WebBrowser webBrowser = (WebBrowser)base.Host;
            info.dwDoubleClick = 0;
            info.dwFlags = 2097168;
            if (webBrowser.ScrollBarsEnabled)
            {
                info.dwFlags |= (int)BOC.UOP.Win32.NativeMethods.DOCHOSTUIFLAG.FLAT_SCROLLBAR;
            }
            else
            {
                info.dwFlags |= (int)BOC.UOP.Win32.NativeMethods.DOCHOSTUIFLAG.SCROLL_NO;
            }
            return 0;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.EnableModeless(bool fEnable)
        {
            return -2147467263;
        }
        [SecuritySafeCritical]
        int UnsafeNativeMethods.IDocHostUIHandler.ShowUI(int dwID, UnsafeNativeMethods.IOleInPlaceActiveObject activeObject, NativeMethods.IOleCommandTarget commandTarget, UnsafeNativeMethods.IOleInPlaceFrame frame, UnsafeNativeMethods.IOleInPlaceUIWindow doc)
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.HideUI()
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.UpdateUI()
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.OnDocWindowActivate(bool fActivate)
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.OnFrameWindowActivate(bool fActivate)
        {
            return -2147467263;
        }
        [SecuritySafeCritical]
        int UnsafeNativeMethods.IDocHostUIHandler.ResizeBorder(NativeMethods.COMRECT rect, UnsafeNativeMethods.IOleInPlaceUIWindow doc, bool fFrameWindow)
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.GetOptionKeyPath(string[] pbstrKey, int dw)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IDocHostUIHandler.GetDropTarget(UnsafeNativeMethods.IOleDropTarget pDropTarget, out UnsafeNativeMethods.IOleDropTarget ppDropTarget)
        {
            ppDropTarget = null;
            return -2147467263;
        }
        [SecurityCritical, SecuritySafeCritical]
        int UnsafeNativeMethods.IDocHostUIHandler.GetExternal(out object ppDispatch)
        {
            WebBrowser webBrowser = (WebBrowser)base.Host;
            ppDispatch = webBrowser.HostingAdaptor.ObjectForScripting;
            return 0;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.TranslateAccelerator(ref MSG msg, ref Guid group, int nCmdID)
        {
            return 1;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.TranslateUrl(int dwTranslate, string strUrlIn, out string pstrUrlOut)
        {
            pstrUrlOut = null;
            return -2147467263;
        }
        int UnsafeNativeMethods.IDocHostUIHandler.FilterDataObject(System.Runtime.InteropServices.ComTypes.IDataObject pDO, out System.Runtime.InteropServices.ComTypes.IDataObject ppDORet)
        {
            ppDORet = null;
            return -2147467263;
        }
        [SecurityCritical, SecuritySafeCritical]
        int UnsafeNativeMethods.IOleControlSite.TranslateAccelerator(ref MSG msg, int grfModifiers)
        {
            if (msg.message == 256 && (int)msg.wParam == 9)
            {
                FocusNavigationDirection focusNavigationDirection = ((grfModifiers & 1) != 0) ? FocusNavigationDirection.Previous : FocusNavigationDirection.Next;
                base.Host.Dispatcher.Invoke(DispatcherPriority.Send, new SendOrPostCallback(this.MoveFocusCallback), focusNavigationDirection);
                return 0;
            }
            return 1;
        }
        [SecurityCritical, SecuritySafeCritical]
        private void MoveFocusCallback(object direction)
        {
            base.Host.MoveFocus(new TraversalRequest((FocusNavigationDirection)direction));
        }

        int UnsafeNativeMethods.IServiceProvider.QueryService(ref Guid service, ref Guid riid, out IntPtr ppvObject)
        {

            if ((service == UnsafeNativeMethods.IID_INewWindowManager && riid == UnsafeNativeMethods.IID_INewWindowManager))
            {
                ppvObject = Marshal.GetComInterfaceForObject(_manager, typeof(BOC.UOP.Win32.UnsafeNativeMethods.INewWindowManager));
                return BOC.UOP.Interop.HRESULT.S_OK.Code;
            }
            ppvObject = IntPtr.Zero;
            unchecked
            {
                return (int)0x80004002;
            }

        }

        int UnsafeNativeMethods.IDocHostShowUI.ShowMessage(IntPtr hwnd, string lpstrText, string lpstrCaption, uint dwType, string lpstrHelpFile, uint dwHelpContext, ref int lpResult)
        {
            lpResult = 0;
            return BOC.UOP.Interop.HRESULT.S_FALSE.Code; //  S_OK Host displayed its UI. MSHTML does not display its message box.

        }

        int UnsafeNativeMethods.IDocHostShowUI.ShowHelp(IntPtr hwnd, string pszHelpFile, uint uCommand, uint dwData, UnsafeNativeMethods.tagPOINT ptMouse, object pDispatchObjectHit)
        {
            return BOC.UOP.Interop.HRESULT.S_FALSE.Code; //  S_OK Host displayed its UI. MSHTML does not display its message box.

        }

        public int QueryStatus(NativeMethods.GUID pguidCmdGroup, int cCmds, NativeMethods.OLECMD prgCmds, IntPtr pCmdText)
        {
            return NativeMethods.S_FALSE;
        }
        /// <summary>
        /// http://support.microsoft.com/default.aspx?scid=kb;en-us;261003
        /// </summary>
        /// <param name="pguidCmdGroup"></param>
        /// <param name="nCmdID"></param>
        /// <param name="nCmdexecopt"></param>
        /// <param name="pvaIn"></param>
        /// <param name="pvaOut"></param>
        /// <returns></returns>
        public int Exec(NativeMethods.GUID pguidCmdGroup, int nCmdID, int nCmdexecopt, object[] pvaIn, ref int pvaOut)
        {
            //不存在Group时返回unkown，存在Group而不存在cmdId时，返回unsupport
            //返回unkown和unsupport都不会修改默认的浏览器行为。
            //当返回S_OK时会修改浏览器默认行为
            int hResult = NativeMethods.S_OK;
            if (pguidCmdGroup==null)
                return hResult = NativeMethods.OLECMDERR_E_UNKNOWN;
            switch (nCmdID)
            {
                case (int)UnsafeNativeMethods.OLECMDID.OLECMDID_SHOWSCRIPTERROR:
                    if (!(base.Host as WebBrowser).ShowScriptError)
                        pvaOut = NativeMethods.VARIANT_TRUE;
                    break;
                default:
                    hResult = NativeMethods.OLECMDERR_E_NOTSUPPORTED;
                    break;
            }
            return hResult;
            #region old code
            ////if (nCmdID == (int)UnsafeNativeMethods.OLECMDID.OLECMDID_CLOSE)
            ////    return NativeMethods.VARIANT_TRUE;
            //int hResult = NativeMethods.S_OK;
            //if (pguidCmdGroup == null)
            //    return NativeMethods.OLECMDERR_E_NOTSUPPORTED + 4;
            //Trace.WriteLine(pguidCmdGroup.guid + ":" + nCmdID + ":" + nCmdexecopt);
            ////if (string.Equals(NativeMethods.CGID_DocHostCommandHandler.ToString(), pguidCmdGroup.guid.ToString(), StringComparison.InvariantCultureIgnoreCase))
            ////{
            //    switch (nCmdID)
            //    {
            //            //edited by xulp 修改原来禁止错误提示的错误代码
            //        case (int)UnsafeNativeMethods.OLECMDID.OLECMDID_SHOWSCRIPTERROR:
            //            if (!(base.Host as WebBrowser).ShowScriptError)
            //                pvaOut = NativeMethods.VARIANT_TRUE;
            //            break;
            //        default:
            //            hResult = NativeMethods.OLECMDERR_E_NOTSUPPORTED;
            //            break;
            //    }
            ////}

            //return hResult;
            #endregion
        }
    }

}
