using BOC.UOP.Internal;
using BOC.UOP.Interop;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Windows.Interop;

namespace BOC.UOP.Controls
{
    internal class ActiveXSite :
        UnsafeNativeMethods.IOleControlSite, 
        UnsafeNativeMethods.IOleClientSite,
        UnsafeNativeMethods.IOleInPlaceSite,
        UnsafeNativeMethods.IPropertyNotifySink
    {
        [SecurityCritical]
        private BOC.UOP.Interop.ActiveXHost _host;
        [SecurityCritical]
        private ConnectionPointCookie _connectionPoint;
        private ActiveXHelper.ActiveXState HostState
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                return this.Host.ActiveXState;
            }
            [SecurityCritical, SecuritySafeCritical]
            set
            {
                this.Host.ActiveXState = value;
            }
        }
        internal NativeMethods.COMRECT HostBounds
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                return this.Host.Bounds;
            }
        }
        internal BOC.UOP.Interop.ActiveXHost Host
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._host;
            }
        }
        [SecurityCritical]
        internal ActiveXSite(BOC.UOP.Interop.ActiveXHost host)
        {
            if (host == null)
            {
                throw new ArgumentNullException("host");
            }
            this._host = host;
        }
        int UnsafeNativeMethods.IOleControlSite.OnControlInfoChanged()
        {
            return 0;
        }
        int UnsafeNativeMethods.IOleControlSite.LockInPlaceActive(int fLock)
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IOleControlSite.GetExtendedControl(out object ppDisp)
        {
            ppDisp = null;
            return -2147467263;
        }
        int UnsafeNativeMethods.IOleControlSite.TransformCoords(NativeMethods.POINT pPtlHimetric, NativeMethods.POINTF pPtfContainer, int dwFlags)
        {
            if ((dwFlags & 4) != 0)
            {
                if ((dwFlags & 2) != 0)
                {
                    pPtfContainer.x = (float)ActiveXHelper.HM2Pix(pPtlHimetric.x, ActiveXHelper.LogPixelsX);
                    pPtfContainer.y = (float)ActiveXHelper.HM2Pix(pPtlHimetric.y, ActiveXHelper.LogPixelsY);
                }
                else
                {
                    if ((dwFlags & 1) == 0)
                    {
                        return -2147024809;
                    }
                    pPtfContainer.x = (float)ActiveXHelper.HM2Pix(pPtlHimetric.x, ActiveXHelper.LogPixelsX);
                    pPtfContainer.y = (float)ActiveXHelper.HM2Pix(pPtlHimetric.y, ActiveXHelper.LogPixelsY);
                }
            }
            else
            {
                if ((dwFlags & 8) == 0)
                {
                    return -2147024809;
                }
                if ((dwFlags & 2) != 0)
                {
                    pPtlHimetric.x = ActiveXHelper.Pix2HM((int)pPtfContainer.x, ActiveXHelper.LogPixelsX);
                    pPtlHimetric.y = ActiveXHelper.Pix2HM((int)pPtfContainer.y, ActiveXHelper.LogPixelsY);
                }
                else
                {
                    if ((dwFlags & 1) == 0)
                    {
                        return -2147024809;
                    }
                    pPtlHimetric.x = ActiveXHelper.Pix2HM((int)pPtfContainer.x, ActiveXHelper.LogPixelsX);
                    pPtlHimetric.y = ActiveXHelper.Pix2HM((int)pPtfContainer.y, ActiveXHelper.LogPixelsY);
                }
            }
            return 0;
        }
        int UnsafeNativeMethods.IOleControlSite.TranslateAccelerator(ref MSG pMsg, int grfModifiers)
        {
            return 1;
        }
        int UnsafeNativeMethods.IOleControlSite.OnFocus(int fGotFocus)
        {
            return 0;
        }
        int UnsafeNativeMethods.IOleControlSite.ShowPropertyFrame()
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IOleClientSite.SaveObject()
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IOleClientSite.GetMoniker(int dwAssign, int dwWhichMoniker, out object moniker)
        {
            moniker = null;
            return -2147467263;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleClientSite.GetContainer(out UnsafeNativeMethods.IOleContainer container)
        {
            container = this.Host.Container;
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleClientSite.ShowObject()
        {
            if (this.HostState >= ActiveXHelper.ActiveXState.InPlaceActive)
            {
                IntPtr intPtr;
                if (NativeMethods.Succeeded(this.Host.ActiveXInPlaceObject.GetWindow(out intPtr)))
                {
                    if (this.Host.ControlHandle.Handle != intPtr && intPtr != IntPtr.Zero)
                    {
                        this.Host.AttachWindow(intPtr);
                        this.OnActiveXRectChange(this.Host.Bounds);
                    }
                }
                else
                {
                    if (this.Host.ActiveXInPlaceObject is UnsafeNativeMethods.IOleInPlaceObjectWindowless)
                    {
                        throw new InvalidOperationException("AxWindowlessControl");
                    }
                }
            }
            return 0;
        }
        int UnsafeNativeMethods.IOleClientSite.OnShowWindow(int fShow)
        {
            return 0;
        }
        int UnsafeNativeMethods.IOleClientSite.RequestNewObjectLayout()
        {
            return -2147467263;
        }
        [SecurityCritical]
        IntPtr UnsafeNativeMethods.IOleInPlaceSite.GetWindow()
        {
            IntPtr handle=IntPtr.Zero;
            try
            {
                handle = this.Host.ParentHandle.Handle;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return handle;
        }
        int UnsafeNativeMethods.IOleInPlaceSite.ContextSensitiveHelp(int fEnterMode)
        {
            return -2147467263;
        }
        int UnsafeNativeMethods.IOleInPlaceSite.CanInPlaceActivate()
        {
            return 0;
        }
        int UnsafeNativeMethods.IOleInPlaceSite.OnInPlaceActivate()
        {
            this.HostState = ActiveXHelper.ActiveXState.InPlaceActive;
            if (!this.HostBounds.IsEmpty)
            {
                this.OnActiveXRectChange(this.HostBounds);
            }
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceSite.OnUIActivate()
        {
            this.HostState = ActiveXHelper.ActiveXState.UIActive;
            this.Host.Container.OnUIActivate(this.Host);
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceSite.GetWindowContext(out UnsafeNativeMethods.IOleInPlaceFrame ppFrame, out UnsafeNativeMethods.IOleInPlaceUIWindow ppDoc, NativeMethods.COMRECT lprcPosRect, NativeMethods.COMRECT lprcClipRect, NativeMethods.OLEINPLACEFRAMEINFO lpFrameInfo)
        {
            ppDoc = null;
            ppFrame = this.Host.Container;
            lprcPosRect.left = this.Host.Bounds.left;
            lprcPosRect.top = this.Host.Bounds.top;
            lprcPosRect.right = this.Host.Bounds.right;
            lprcPosRect.bottom = this.Host.Bounds.bottom;
            lprcClipRect = this.Host.Bounds;
            if (lpFrameInfo != null)
            {
                lpFrameInfo.cb = (uint)Marshal.SizeOf(typeof(NativeMethods.OLEINPLACEFRAMEINFO));
                lpFrameInfo.fMDIApp = false;
                lpFrameInfo.hAccel = IntPtr.Zero;
                lpFrameInfo.cAccelEntries = 0u;
                lpFrameInfo.hwndFrame = this.Host.ParentHandle.Handle;
            }
            return 0;
        }
        int UnsafeNativeMethods.IOleInPlaceSite.Scroll(NativeMethods.SIZE scrollExtant)
        {
            return 1;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceSite.OnUIDeactivate(int fUndoable)
        {
            this.Host.Container.OnUIDeactivate(this.Host);
            if (this.HostState > ActiveXHelper.ActiveXState.InPlaceActive)
            {
                this.HostState = ActiveXHelper.ActiveXState.InPlaceActive;
            }
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceSite.OnInPlaceDeactivate()
        {
            if (this.HostState == ActiveXHelper.ActiveXState.UIActive)
            {
                ((UnsafeNativeMethods.IOleInPlaceSite)this).OnUIDeactivate(0);
            }
            this.Host.Container.OnInPlaceDeactivate(this.Host);
            this.HostState = ActiveXHelper.ActiveXState.Running;
            return 0;
        }
        int UnsafeNativeMethods.IOleInPlaceSite.DiscardUndoState()
        {
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IOleInPlaceSite.DeactivateAndUndo()
        {
            return this.Host.ActiveXInPlaceObject.UIDeactivate();
        }
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        int UnsafeNativeMethods.IOleInPlaceSite.OnPosRectChange(NativeMethods.COMRECT lprcPosRect)
        {
            return this.OnActiveXRectChange(lprcPosRect);
        }
        [SecurityCritical]
        void UnsafeNativeMethods.IPropertyNotifySink.OnChanged(int dispid)
        {
            try
            {
                this.OnPropertyChanged(dispid);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        int UnsafeNativeMethods.IPropertyNotifySink.OnRequestEdit(int dispid)
        {
            return 0;
        }
        [SecurityCritical]
        internal virtual void OnPropertyChanged(int dispid)
        {
        }
        [SecurityCritical]
        internal void StartEvents()
        {
            if (this._connectionPoint != null)
            {
                return;
            }
            object activeXInstance = this.Host.ActiveXInstance;
            if (activeXInstance != null)
            {
                try
                {
                    this._connectionPoint = new ConnectionPointCookie(activeXInstance, this, typeof(UnsafeNativeMethods.IPropertyNotifySink));
                }
                catch (Exception ex)
                {
                    if (CriticalExceptions.IsCriticalException(ex))
                    {
                        throw;
                    }
                }
            }
        }
        [SecurityCritical]
        internal void StopEvents()
        {
            if (this._connectionPoint != null)
            {
                this._connectionPoint.Disconnect();
                this._connectionPoint = null;
            }
        }
        [SecurityCritical, SecurityTreatAsSafe]
        internal int OnActiveXRectChange(NativeMethods.COMRECT lprcPosRect)
        {
            if (this.Host.ActiveXInPlaceObject != null)
            {
                this.Host.ActiveXInPlaceObject.SetObjectRects(lprcPosRect, lprcPosRect);
                this.Host.Bounds = lprcPosRect;
            }
            return 0;
        }
    }

}
