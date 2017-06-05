using BOC.UOP.Interop;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Security;
using System.Text;
using System.Windows.Interop;

namespace BOC.UOP.Controls
{
    internal class ActiveXContainer : UnsafeNativeMethods.IOleContainer, UnsafeNativeMethods.IOleInPlaceFrame
    {
        [SecurityCritical]
        private BOC.UOP.Interop.ActiveXHost _host;
        [SecurityCritical]
        private BOC.UOP.Interop.ActiveXHost _siteUIActive;
        internal BOC.UOP.Interop.ActiveXHost ActiveXHost
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._host;
            }
        }
        [SecurityCritical]
        internal ActiveXContainer(BOC.UOP.Interop.ActiveXHost host)
        {
            this._host = host;

        }
        int UnsafeNativeMethods.IOleContainer.ParseDisplayName(object pbc, string pszDisplayName, int[] pchEaten, object[] ppmkOut)
        {
            if (ppmkOut != null)
            {
                ppmkOut[0] = null;
            }
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleContainer.EnumObjects(int grfFlags, out UnsafeNativeMethods.IEnumUnknown ppenum)
        {
            ppenum = null;
            object activeXInstance = this._host.ActiveXInstance;
            if (activeXInstance != null && ((grfFlags & 1) != 0 || ((grfFlags & 16) != 0 && this._host.ActiveXState == ActiveXHelper.ActiveXState.Running)))
            {
                ppenum = new EnumUnknown(new object[]
				{
					activeXInstance
				});
                return 0;
            }
            ppenum = new EnumUnknown(null);
            return 0;
        }
        int UnsafeNativeMethods.IOleContainer.LockContainer(bool fLock)
        {
            return -2147467263;
        }
        [SecurityCritical]
        IntPtr UnsafeNativeMethods.IOleInPlaceFrame.GetWindow()
        {
            return this._host.ParentHandle.Handle;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.ContextSensitiveHelp(int fEnterMode)
        {
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.GetBorder(NativeMethods.COMRECT lprectBorder)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.RequestBorderSpace(NativeMethods.COMRECT pborderwidths)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.SetBorderSpace(NativeMethods.COMRECT pborderwidths)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.SetActiveObject(UnsafeNativeMethods.IOleInPlaceActiveObject pActiveObject, string pszObjName)
        {
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.InsertMenus(IntPtr hmenuShared, NativeMethods.tagOleMenuGroupWidths lpMenuWidths)
        {
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.SetMenu(IntPtr hmenuShared, IntPtr holemenu, IntPtr hwndActiveObject)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.RemoveMenus(IntPtr hmenuShared)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.SetStatusText(string pszStatusText)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.EnableModeless(bool fEnable)
        {
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceFrame.TranslateAccelerator(ref MSG lpmsg, short wID)
        {
            return 1;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal void OnUIActivate(BOC.UOP.Interop.ActiveXHost site)
        {
            if (this._siteUIActive == site)
            {
                return;
            }
            if (this._siteUIActive != null)
            {
                BOC.UOP.Interop.ActiveXHost siteUIActive = this._siteUIActive;
                siteUIActive.ActiveXInPlaceObject.UIDeactivate();
            }
            this._siteUIActive = site;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal void OnUIDeactivate(BOC.UOP.Interop.ActiveXHost site)
        {
            this._siteUIActive = null;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal void OnInPlaceDeactivate(BOC.UOP.Interop.ActiveXHost site)
        {
            BOC.UOP.Interop.ActiveXHost arg_08_0 = this.ActiveXHost;
        }
    }
}
