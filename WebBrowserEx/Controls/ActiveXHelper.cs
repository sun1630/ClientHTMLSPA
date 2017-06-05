using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;

namespace BOC.UOP.Controls
{
    internal class ActiveXHelper
    {
        public enum ActiveXState
        {
            Passive,
            Loaded,
            Running,
            InPlaceActive = 4,
            UIActive = 8,
            Open = 16
        }
        public static readonly int sinkAttached = BitVector32.CreateMask();
        public static readonly int inTransition = BitVector32.CreateMask(ActiveXHelper.sinkAttached);
        public static readonly int processingKeyUp = BitVector32.CreateMask(ActiveXHelper.inTransition);
        private static int logPixelsX = -1;
        private static int logPixelsY = -1;
        private const int HMperInch = 2540;
        public static int LogPixelsX
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                if (ActiveXHelper.logPixelsX == -1)
                {
                    IntPtr dC = UnsafeNativeMethods.GetDC(NativeMethods.NullHandleRef);
                    if (dC != IntPtr.Zero)
                    {
                        ActiveXHelper.logPixelsX = UnsafeNativeMethods.GetDeviceCaps(new HandleRef(null, dC), 88);
                        UnsafeNativeMethods.ReleaseDC(NativeMethods.NullHandleRef, new HandleRef(null, dC));
                    }
                }
                return ActiveXHelper.logPixelsX;
            }
        }
        public static int LogPixelsY
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                if (ActiveXHelper.logPixelsY == -1)
                {
                    IntPtr dC = UnsafeNativeMethods.GetDC(NativeMethods.NullHandleRef);
                    if (dC != IntPtr.Zero)
                    {
                        ActiveXHelper.logPixelsY = UnsafeNativeMethods.GetDeviceCaps(new HandleRef(null, dC), 90);
                        UnsafeNativeMethods.ReleaseDC(NativeMethods.NullHandleRef, new HandleRef(null, dC));
                    }
                }
                return ActiveXHelper.logPixelsY;
            }
        }
        public static int Pix2HM(int pix, int logP)
        {
            return (2540 * pix + (logP >> 1)) / logP;
        }
        public static int HM2Pix(int hm, int logP)
        {
            return (logP * hm + 1270) / 2540;
        }
        public static void ResetLogPixelsX()
        {
            ActiveXHelper.logPixelsX = -1;
        }
        public static void ResetLogPixelsY()
        {
            ActiveXHelper.logPixelsY = -1;
        }
        [SecurityCritical, SuppressUnmanagedCodeSecurity]
        [DllImport("PresentationHost_v0400.dll", PreserveSig = false)]
        [return: MarshalAs(UnmanagedType.IDispatch)]
        internal static extern object CreateIDispatchSTAForwarder([MarshalAs(UnmanagedType.IDispatch)] object pDispatchDelegate);
        private ActiveXHelper()
        {
        }
    }
}
