using BOC.UOP.Controls;
using BOC.UOP.Internal;
using BOC.UOP.Win32;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Reflection;
using System.Runtime;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Text;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using Fasterflect;
using BOC.UOP.Utility;

namespace BOC.UOP.Interop
{
    /// <summary>Hosts an ActiveX control as an element within Windows Presentation Foundation (WPF) content. </summary>
    public class ActiveXHost : HwndHost
    {
        private delegate void PropertyInvalidator(ActiveXHost axhost);
        internal static readonly DependencyProperty TabIndexProperty;
        private static Hashtable invalidatorMap;
        private NativeMethods.COMRECT _bounds = new NativeMethods.COMRECT(0, 0, 0, 0);
        private Rect _boundRect = new Rect(0.0, 0.0, 0.0, 0.0);
        private Size _cachedSize = Size.Empty;
        [SecurityCritical]
        private HandleRef _hwndParent;
        private bool _isDisposed;
        private SecurityCriticalDataForSet<Guid> _clsid;
        [SecurityCritical]
        private HandleRef _axWindow;
        private BitVector32 _axHostState = default(BitVector32);
        private ActiveXHelper.ActiveXState _axState;
        [SecurityCritical]
        private ActiveXSite _axSite;
        [SecurityCritical]
        private ActiveXContainer _axContainer;
        [SecurityCritical]
        private object _axInstance;
        [SecurityCritical]
        private UnsafeNativeMethods.IOleObject _axOleObject;
        [SecurityCritical]
        private UnsafeNativeMethods.IOleInPlaceObject _axOleInPlaceObject;
        [SecurityCritical]
        private UnsafeNativeMethods.IOleInPlaceActiveObject _axOleInPlaceActiveObject;
        /// <summary>Gets a value that indicates whether the <see cref="M:System.Windows.Interop.ActiveXHost.Dispose(System.Boolean)" /> method has been called on the <see cref="T:System.Windows.Interop.ActiveXHost" /> instance. </summary>
        /// <returns>true if the <see cref="T:System.Windows.Interop.ActiveXHost" /> instance has been disposed; otherwise, false. The default is false.</returns>
        protected bool IsDisposed
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._isDisposed;
            }
        }
        internal ActiveXSite ActiveXSite
        {
            [SecurityCritical]
            [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
            get
            {
                if (this._axSite == null)
                {
                    this._axSite = this.CreateActiveXSite();
                }
                return this._axSite;
            }
        }
        internal ActiveXContainer Container
        {
            [SecurityCritical]
            get
            {
                if (this._axContainer == null)
                {
                    this._axContainer = new ActiveXContainer(this);
                }
                return this._axContainer;
            }
        }
        internal ActiveXHelper.ActiveXState ActiveXState
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._axState;
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            set
            {
                this._axState = value;
            }
        }
        internal int TabIndex
        {
            get
            {
                return (int)base.GetValue(ActiveXHost.TabIndexProperty);
            }
            set
            {
                base.SetValue(ActiveXHost.TabIndexProperty, value);
            }
        }
        internal HandleRef ParentHandle
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._hwndParent;
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            set
            {
                this._hwndParent = value;
            }
        }
        internal NativeMethods.COMRECT Bounds
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._bounds;
            }
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            set
            {
                this._bounds = value;
            }
        }
        internal Rect BoundRect
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
            get
            {
                return this._boundRect;
            }
        }
        internal HandleRef ControlHandle
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._axWindow;
            }
        }
        public object ActiveXInstance
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._axInstance;
            }
        }
        internal UnsafeNativeMethods.IOleInPlaceObject ActiveXInPlaceObject
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._axOleInPlaceObject;
            }
        }
        internal UnsafeNativeMethods.IOleInPlaceActiveObject ActiveXInPlaceActiveObject
        {
            [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries"), SecurityCritical]
            get
            {
                return this._axOleInPlaceActiveObject;
            }
        }
        [SecurityCritical]
        internal ActiveXHost(Guid clsid, bool fTrusted)
        {
            HwndHost hh = this as HwndHost;
            Type t = typeof(HwndHost);
            var mi = t.GetMethod("Initialize", BindingFlags.NonPublic | BindingFlags.Instance);
            mi.Invoke(this, new object[] { fTrusted });
            if (Thread.CurrentThread.GetApartmentState()!= ApartmentState.STA)
            {
                throw new ThreadStateException("AxRequiresApartmentThread");
            }
            this._clsid.Value = clsid;
            base.Initialized += new EventHandler(this.OnInitialized);
        }

        protected override void OnPropertyChanged(DependencyPropertyChangedEventArgs e)
        {
            base.OnPropertyChanged(e);
            if (e.GetProperty<bool>("IsAValueChange") || e.GetProperty<bool>("IsASubPropertyChange"))
            {
                DependencyProperty property = e.Property;
                if (property != null && ActiveXHost.invalidatorMap.ContainsKey(property))
                {
                    ActiveXHost.PropertyInvalidator propertyInvalidator = (ActiveXHost.PropertyInvalidator)ActiveXHost.invalidatorMap[property];
                    propertyInvalidator(this);
                }
            }
        }
        /// <summary>Creates the <see cref="T:System.Windows.Interop.ActiveXHost" /> window and assigns it to a parent.</summary>
        /// <returns>A <see cref="T:System.Runtime.InteropServices.HandleRef" /> to the <see cref="T:System.Windows.Interop.ActiveXHost" /> window.</returns>
        /// <param name="hwndParent">The parent window.</param>
        [SecurityCritical]
        protected override HandleRef BuildWindowCore(HandleRef hwndParent)
        {
            this.ParentHandle = hwndParent;
            this.TransitionUpTo(ActiveXHelper.ActiveXState.InPlaceActive);
            if (this.ControlHandle.Handle == IntPtr.Zero)
            {
                IntPtr zero = IntPtr.Zero;
                this._axOleInPlaceActiveObject.GetWindow(out zero);
                this.AttachWindow(zero);
            }
            return this._axWindow;
        }
        /// <param name="bounds"></param>
        [SecurityCritical]
        protected override void OnWindowPositionChanged(Rect bounds)
        {
            this._boundRect = bounds;
            this._bounds.left = (int)bounds.X;
            this._bounds.top = (int)bounds.Y;
            this._bounds.right = (int)(bounds.Width + bounds.X);
            this._bounds.bottom = (int)(bounds.Height + bounds.Y);
            this.ActiveXSite.OnActiveXRectChange(this._bounds);
        }
        /// <param name="hwnd"></param>
        protected override void DestroyWindowCore(HandleRef hwnd)
        {
        }
        /// <param name="swConstraint"></param>
        protected override Size MeasureOverride(Size swConstraint)
        {
            base.MeasureOverride(swConstraint);
            double width;
            if (double.IsPositiveInfinity(swConstraint.Width))
            {
                width = 150.0;
            }
            else
            {
                width = swConstraint.Width;
            }
            double height;
            if (double.IsPositiveInfinity(swConstraint.Height))
            {
                height = 150.0;
            }
            else
            {
                height = swConstraint.Height;
            }
            return new Size(width, height);
        }
        /// <param name="args"></param>
        protected override void OnAccessKey(AccessKeyEventArgs args)
        {
        }
        /// <summary>Releases the unmanaged resources that are used by the <see cref="T:System.Windows.Interop.ActiveXHost" /> and optionally releases the managed resources. </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources. </param>
        protected override void Dispose(bool disposing)
        {
            try
            {
                if (disposing && !this._isDisposed)
                {
                    this.TransitionDownTo(ActiveXHelper.ActiveXState.Passive);
                    this._isDisposed = true;
                }
            }
            finally
            {
                base.Dispose(disposing);
            }
        }
        [SecurityCritical]
        [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
        internal virtual ActiveXSite CreateActiveXSite()
        {
            return new BOC.UOP.Controls.ActiveXSite(this);
        }
        [SecurityCritical]
        internal virtual object CreateActiveXObject(Guid clsid)
        {
            return Activator.CreateInstance(Type.GetTypeFromCLSID(clsid));
        }
        internal virtual void AttachInterfaces(object nativeActiveXObject)
        {
        }
        internal virtual void DetachInterfaces()
        {
        }
        internal virtual void CreateSink()
        {
        }
        [SecurityCritical]
        internal virtual void DetachSink()
        {
        }
        internal virtual void OnActiveXStateChange(int oldState, int newState)
        {
        }
        internal void RegisterAccessKey(char key)
        {
            AccessKeyManager.Register(key.ToString(), this);
        }
        internal bool GetAxHostState(int mask)
        {
            return this._axHostState[mask];
        }
        internal void SetAxHostState(int mask, bool value)
        {
            this._axHostState[mask] = value;
        }
        internal void TransitionUpTo(ActiveXHelper.ActiveXState state)
        {
            if (!this.GetAxHostState(ActiveXHelper.inTransition))
            {
                this.SetAxHostState(ActiveXHelper.inTransition, true);
                try
                {
                    while (state > this.ActiveXState)
                    {
                        ActiveXHelper.ActiveXState activeXState = this.ActiveXState;
                        switch (this.ActiveXState)
                        {
                            case ActiveXHelper.ActiveXState.Passive:
                                this.TransitionFromPassiveToLoaded();
                                this.ActiveXState = ActiveXHelper.ActiveXState.Loaded;
                                break;
                            case ActiveXHelper.ActiveXState.Loaded:
                                this.TransitionFromLoadedToRunning();
                                this.ActiveXState = ActiveXHelper.ActiveXState.Running;
                                break;
                            case ActiveXHelper.ActiveXState.Running:
                                this.TransitionFromRunningToInPlaceActive();
                                this.ActiveXState = ActiveXHelper.ActiveXState.InPlaceActive;
                                break;
                            case (ActiveXHelper.ActiveXState)3:
                                goto IL_87;
                            case ActiveXHelper.ActiveXState.InPlaceActive:
                                this.TransitionFromInPlaceActiveToUIActive();
                                this.ActiveXState = ActiveXHelper.ActiveXState.UIActive;
                                break;
                            default:
                                goto IL_87;
                        }
                    IL_95:
                        this.OnActiveXStateChange((int)activeXState, (int)this.ActiveXState);
                        continue;
                    IL_87:
                        this.ActiveXState++;
                        goto IL_95;
                    }
                }
                finally
                {
                    this.SetAxHostState(ActiveXHelper.inTransition, false);
                }
            }
        }
        internal void TransitionDownTo(ActiveXHelper.ActiveXState state)
        {
            if (!this.GetAxHostState(ActiveXHelper.inTransition))
            {
                this.SetAxHostState(ActiveXHelper.inTransition, true);
                try
                {
                    while (state < this.ActiveXState)
                    {
                        ActiveXHelper.ActiveXState activeXState = this.ActiveXState;
                        ActiveXHelper.ActiveXState activeXState2 = this.ActiveXState;
                        switch (activeXState2)
                        {
                            case ActiveXHelper.ActiveXState.Loaded:
                                this.TransitionFromLoadedToPassive();
                                this.ActiveXState = ActiveXHelper.ActiveXState.Passive;
                                break;
                            case ActiveXHelper.ActiveXState.Running:
                                this.TransitionFromRunningToLoaded();
                                this.ActiveXState = ActiveXHelper.ActiveXState.Loaded;
                                break;
                            case (ActiveXHelper.ActiveXState)3:
                                goto IL_95;
                            case ActiveXHelper.ActiveXState.InPlaceActive:
                                this.TransitionFromInPlaceActiveToRunning();
                                this.ActiveXState = ActiveXHelper.ActiveXState.Running;
                                break;
                            default:
                                if (activeXState2 != ActiveXHelper.ActiveXState.UIActive)
                                {
                                    if (activeXState2 != ActiveXHelper.ActiveXState.Open)
                                    {
                                        goto IL_95;
                                    }
                                    this.ActiveXState = ActiveXHelper.ActiveXState.UIActive;
                                }
                                else
                                {
                                    this.TransitionFromUIActiveToInPlaceActive();
                                    this.ActiveXState = ActiveXHelper.ActiveXState.InPlaceActive;
                                }
                                break;
                        }
                    IL_A3:
                        this.OnActiveXStateChange((int)activeXState, (int)this.ActiveXState);
                        continue;
                    IL_95:
                        this.ActiveXState--;
                        goto IL_A3;
                    }
                }
                finally
                {
                    this.SetAxHostState(ActiveXHelper.inTransition, false);
                }
            }
        }
        [SecurityCritical]
        internal bool DoVerb(int verb)
        {
            int num = this._axOleObject.DoVerb(verb, IntPtr.Zero, this.ActiveXSite, 0, this.ParentHandle.Handle, this._bounds);
            return num == 0;
        }
        [SecurityCritical]
        internal void AttachWindow(IntPtr hwnd)
        {
            if (this._axWindow.Handle == hwnd)
            {
                return;
            }
            this._axWindow = new HandleRef(this, hwnd);
            if (this.ParentHandle.Handle != IntPtr.Zero)
            {
                UnsafeNativeMethods.SetParent(this._axWindow, this.ParentHandle);
            }
        }
        static ActiveXHost()
        {
            ActiveXHost.TabIndexProperty = Control.TabIndexProperty.AddOwner(typeof(ActiveXHost));
            ActiveXHost.invalidatorMap = new Hashtable();
            ActiveXHost.invalidatorMap[UIElement.VisibilityProperty] = new ActiveXHost.PropertyInvalidator(ActiveXHost.OnVisibilityInvalidated);
            ActiveXHost.invalidatorMap[UIElement.IsEnabledProperty] = new ActiveXHost.PropertyInvalidator(ActiveXHost.OnIsEnabledInvalidated);
            EventManager.RegisterClassHandler(typeof(ActiveXHost), AccessKeyManager.AccessKeyPressedEvent, new AccessKeyPressedEventHandler(ActiveXHost.OnAccessKeyPressed));
            Control.IsTabStopProperty.OverrideMetadata(typeof(ActiveXHost), new FrameworkPropertyMetadata(true));
            UIElement.FocusableProperty.OverrideMetadata(typeof(ActiveXHost), new FrameworkPropertyMetadata(true));
            EventManager.RegisterClassHandler(typeof(ActiveXHost), Keyboard.GotKeyboardFocusEvent, new KeyboardFocusChangedEventHandler(ActiveXHost.OnGotFocus));
            EventManager.RegisterClassHandler(typeof(ActiveXHost), Keyboard.LostKeyboardFocusEvent, new KeyboardFocusChangedEventHandler(ActiveXHost.OnLostFocus));
            KeyboardNavigation.TabNavigationProperty.OverrideMetadata(typeof(ActiveXHost), new FrameworkPropertyMetadata(KeyboardNavigationMode.Once));
        }
        [SecurityCritical]
        private void StartEvents()
        {
            if (!this.GetAxHostState(ActiveXHelper.sinkAttached))
            {
                this.SetAxHostState(ActiveXHelper.sinkAttached, true);
                this.CreateSink();
            }
            this.ActiveXSite.StartEvents();
        }
        [SecurityCritical]
        private void StopEvents()
        {
            if (this.GetAxHostState(ActiveXHelper.sinkAttached))
            {
                this.SetAxHostState(ActiveXHelper.sinkAttached, false);
                this.DetachSink();
            }
            this.ActiveXSite.StopEvents();
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromPassiveToLoaded()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.Passive)
            {
                this._axInstance = this.CreateActiveXObject(this._clsid.Value);
                this.ActiveXState = ActiveXHelper.ActiveXState.Loaded;
                this.AttachInterfacesInternal();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromLoadedToPassive()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.Loaded)
            {
                if (this._axInstance != null)
                {
                    this.DetachInterfacesInternal();
                    Marshal.FinalReleaseComObject(this._axInstance);
                    this._axInstance = null;
                }
                this.ActiveXState = ActiveXHelper.ActiveXState.Passive;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromLoadedToRunning()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.Loaded)
            {
                int num = 0;
                int miscStatus = this._axOleObject.GetMiscStatus(1, out num);
                if (NativeMethods.Succeeded(miscStatus) && (num & 131072) != 0)
                {
                    this._axOleObject.SetClientSite(this.ActiveXSite);
                }
                this.StartEvents();
                this.ActiveXState = ActiveXHelper.ActiveXState.Running;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromRunningToLoaded()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.Running)
            {
                this.StopEvents();
                this._axOleObject.SetClientSite(null);
                this.ActiveXState = ActiveXHelper.ActiveXState.Loaded;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromRunningToInPlaceActive()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.Running)
            {
                try
                {
                    this.DoVerb(-5);
                }
                catch (Exception ex)
                {
                    if (CriticalExceptions.IsCriticalException(ex))
                    {
                        throw;
                    }
                    throw new TargetInvocationException("AXNohWnd", ex);
                }
                this.ActiveXState = ActiveXHelper.ActiveXState.InPlaceActive;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromInPlaceActiveToRunning()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.InPlaceActive)
            {
                this._axOleInPlaceObject.InPlaceDeactivate();
                this.ActiveXState = ActiveXHelper.ActiveXState.Running;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromInPlaceActiveToUIActive()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.InPlaceActive)
            {
                this.DoVerb(-4);
                this.ActiveXState = ActiveXHelper.ActiveXState.UIActive;
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        private void TransitionFromUIActiveToInPlaceActive()
        {
            if (this.ActiveXState == ActiveXHelper.ActiveXState.UIActive)
            {
                this._axOleInPlaceObject.UIDeactivate();
                this.ActiveXState = ActiveXHelper.ActiveXState.InPlaceActive;
            }
        }
        private void OnInitialized(object sender, EventArgs e)
        {
            base.Initialized -= new EventHandler(this.OnInitialized);
        }
        private static void OnIsEnabledInvalidated(ActiveXHost axHost)
        {
        }
        private static void OnVisibilityInvalidated(ActiveXHost axHost)
        {
            if (axHost != null)
            {
               
            }
        }
        private static void OnGotFocus(object sender, KeyboardFocusChangedEventArgs e)
        {
            ActiveXHost activeXHost = sender as ActiveXHost;
            if (activeXHost != null)
            {
                if (activeXHost.ActiveXState < ActiveXHelper.ActiveXState.UIActive)
                {
                    activeXHost.TransitionUpTo(ActiveXHelper.ActiveXState.UIActive);
                }
            }
        }
        private static void OnLostFocus(object sender, KeyboardFocusChangedEventArgs e)
        {
            ActiveXHost activeXHost = sender as ActiveXHost;
            if (activeXHost != null)
            {
                bool flag = !activeXHost.IsKeyboardFocusWithin;
                if (flag)
                {
                    activeXHost.TransitionDownTo(ActiveXHelper.ActiveXState.InPlaceActive);
                }
            }
        }
        private static void OnAccessKeyPressed(object sender, AccessKeyPressedEventArgs args)
        {
            if (!args.Handled && args.Scope == null && args.Target == null)
            {
                args.Target = (UIElement)sender;
            }
        }
        [SecurityCritical]
        private void AttachInterfacesInternal()
        {
            this._axOleObject = (UnsafeNativeMethods.IOleObject)this._axInstance;
            this._axOleInPlaceObject = (UnsafeNativeMethods.IOleInPlaceObject)this._axInstance;
            this._axOleInPlaceActiveObject = (UnsafeNativeMethods.IOleInPlaceActiveObject)this._axInstance;
            this.AttachInterfaces(this._axInstance);
        }
        [SecurityCritical, SecurityTreatAsSafe]
        private void DetachInterfacesInternal()
        {
            this._axOleObject = null;
            this._axOleInPlaceObject = null;
            this._axOleInPlaceActiveObject = null;
            this.DetachInterfaces();
        }
        [SecurityCritical]
        private NativeMethods.SIZE SetExtent(int width, int height)
        {
            NativeMethods.SIZE sIZE = new NativeMethods.SIZE();
            sIZE.cx = width;
            sIZE.cy = height;
            bool flag = false;
            try
            {
                this._axOleObject.SetExtent(1, sIZE);
            }
            catch (COMException)
            {
                flag = true;
            }
            if (flag)
            {
                this._axOleObject.GetExtent(1, sIZE);
                try
                {
                    this._axOleObject.SetExtent(1, sIZE);
                }
                catch (COMException)
                {
                }
            }
            return this.GetExtent();
        }
        [SecurityCritical, SecurityTreatAsSafe]
        private NativeMethods.SIZE GetExtent()
        {
            NativeMethods.SIZE sIZE = new NativeMethods.SIZE();
            this._axOleObject.GetExtent(1, sIZE);
            return sIZE;
        }
    }
}
