using BOC.UOP.WindowsBase;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;

namespace BOC.UOP.Win32
{
    internal static class SafeNativeMethods
    {
        [Flags]
        internal enum PlaySoundFlags
        {
            SND_SYNC = 0,
            SND_ASYNC = 1,
            SND_NODEFAULT = 2,
            SND_MEMORY = 4,
            SND_LOOP = 8,
            SND_NOSTOP = 16,
            SND_PURGE = 64,
            SND_APPLICATION = 128,
            SND_NOWAIT = 8192,
            SND_ALIAS = 65536,
            SND_FILENAME = 131072,
            SND_RESOURCE = 262144
        }
        [SecurityCritical(SecurityCriticalScope.Everything), SuppressUnmanagedCodeSecurity, SuppressUnmanagedCodeSecurity]
        private static class SafeNativeMethodsPrivate
        {
            [DllImport("kernel32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int GetCurrentProcessId();
            [DllImport("kernel32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int GetCurrentThreadId();
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr GetCapture();
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern bool IsWindowVisible(HandleRef hWnd);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int GetMessagePos();
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "ReleaseCapture", ExactSpelling = true, SetLastError = true)]
            public static extern bool IntReleaseCapture();
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowRect", ExactSpelling = true, SetLastError = true)]
            public static extern bool IntGetWindowRect(HandleRef hWnd, [In] [Out] ref NativeMethods.RECT rect);
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "GetClientRect", ExactSpelling = true, SetLastError = true)]
            public static extern bool IntGetClientRect(HandleRef hWnd, [In] [Out] ref NativeMethods.RECT rect);
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "AdjustWindowRectEx", ExactSpelling = true, SetLastError = true)]
            public static extern bool IntAdjustWindowRectEx(ref NativeMethods.RECT lpRect, int dwStyle, bool bMenu, int dwExStyle);
            [DllImport("user32.dll", ExactSpelling = true)]
            public static extern IntPtr MonitorFromRect(ref NativeMethods.RECT rect, int flags);
            [DllImport("user32.dll", ExactSpelling = true)]
            public static extern IntPtr MonitorFromPoint(NativeMethods.POINTSTRUCT pt, int flags);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr ActivateKeyboardLayout(HandleRef hkl, int uFlags);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr GetKeyboardLayout(int dwLayout);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true, SetLastError = true)]
            public static extern IntPtr SetTimer(HandleRef hWnd, int nIDEvent, int uElapse, NativeMethods.TimerProc lpTimerFunc);
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "SetTimer")]
            public static extern IntPtr TrySetTimer(HandleRef hWnd, int nIDEvent, int uElapse, NativeMethods.TimerProc lpTimerFunc);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern bool KillTimer(HandleRef hwnd, int idEvent);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern bool IsWindowUnicode(HandleRef hWnd);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int GetDoubleClickTime();
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern bool IsWindowEnabled(HandleRef hWnd);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr GetCursor();
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int ShowCursor(bool show);
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "GetMonitorInfo", SetLastError = true)]
            public static extern bool IntGetMonitorInfo(HandleRef hmonitor, [In] [Out] NativeMethods.MONITORINFOEX info);
            [DllImport("user32.dll", ExactSpelling = true, SetLastError = true)]
            public static extern IntPtr MonitorFromWindow(HandleRef handle, int flags);
            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            internal static extern int MapVirtualKey(int nVirtKey, int nMapType);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr SetCapture(HandleRef hwnd);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr SetCursor(HandleRef hcursor);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern IntPtr SetCursor(SafeHandle hcursor);
            [DllImport("user32.dll", ExactSpelling = true, SetLastError = true)]
            public static extern bool TrackMouseEvent(NativeMethods.TRACKMOUSEEVENT tme);
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern NativeMethods.CursorHandle LoadCursor(HandleRef hInst, IntPtr iconId);
            [DllImport("kernel32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern int GetTickCount();
            [DllImport("user32.dll", CharSet = CharSet.Auto, EntryPoint = "ScreenToClient", ExactSpelling = true, SetLastError = true)]
            public static extern int IntScreenToClient(HandleRef hWnd, [In] [Out] NativeMethods.POINT pt);
            [DllImport("user32.dll")]
            public static extern int MessageBeep(int uType);
            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            internal static extern bool InSendMessage();
            [DllImport("uxtheme.dll", CharSet = CharSet.Unicode)]
            public static extern int IsThemeActive();
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern bool SetCaretPos(int x, int y);
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern bool DestroyCaret();
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern int GetCaretBlinkTime();
            [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern bool GetStringTypeEx(uint locale, uint infoType, char[] sourceString, int count, [MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 3)] [Out] ushort[] charTypes);
            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            public static extern int GetSysColor(int nIndex);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            public static extern bool IsClipboardFormatAvailable(int format);
            [DllImport("kernel32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            internal static extern bool IsDebuggerPresent();
            [DllImport("kernel32.dll", SetLastError = true)]
            public static extern bool QueryPerformanceCounter(out long lpPerformanceCount);
            [DllImport("kernel32.dll", SetLastError = true)]
            public static extern bool QueryPerformanceFrequency(out long lpFrequency);
            [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
            internal static extern int GetMessageTime();
        }
        public const uint CT_CTYPE1 = 1u;
        public const uint CT_CTYPE2 = 2u;
        public const uint CT_CTYPE3 = 4u;
        public const ushort C1_SPACE = 8;
        public const ushort C1_PUNCT = 16;
        public const ushort C1_BLANK = 64;
        public const ushort C3_NONSPACING = 1;
        public const ushort C3_DIACRITIC = 2;
        public const ushort C3_VOWELMARK = 4;
        public const ushort C3_KATAKANA = 16;
        public const ushort C3_HIRAGANA = 32;
        public const ushort C3_HALFWIDTH = 64;
        public const ushort C3_FULLWIDTH = 128;
        public const ushort C3_IDEOGRAPH = 256;
        public const ushort C3_KASHIDA = 512;
        [SecurityCritical, SecuritySafeCritical]
        public static int GetMessagePos()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetMessagePos();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr GetKeyboardLayout(int dwLayout)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetKeyboardLayout(dwLayout);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr ActivateKeyboardLayout(HandleRef hkl, int uFlags)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.ActivateKeyboardLayout(hkl, uFlags);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetKeyboardLayoutList(int size, [MarshalAs(UnmanagedType.LPArray)] [Out] IntPtr[] hkls)
        {
            int keyboardLayoutList = NativeMethodsSetLastError.GetKeyboardLayoutList(size, hkls);
            if (keyboardLayoutList == 0)
            {
                int lastWin32Error = Marshal.GetLastWin32Error();
                if (lastWin32Error != 0)
                {
                    throw new Win32Exception(lastWin32Error);
                }
            }
            return keyboardLayoutList;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static void GetMonitorInfo(HandleRef hmonitor, [In] [Out] NativeMethods.MONITORINFOEX info)
        {
            if (!SafeNativeMethods.SafeNativeMethodsPrivate.IntGetMonitorInfo(hmonitor, info))
            {
                throw new Win32Exception();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr MonitorFromPoint(NativeMethods.POINTSTRUCT pt, int flags)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.MonitorFromPoint(pt, flags);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr MonitorFromRect(ref NativeMethods.RECT rect, int flags)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.MonitorFromRect(ref rect, flags);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr MonitorFromWindow(HandleRef handle, int flags)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.MonitorFromWindow(handle, flags);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static NativeMethods.CursorHandle LoadCursor(HandleRef hInst, IntPtr iconId)
        {
            NativeMethods.CursorHandle cursorHandle = SafeNativeMethods.SafeNativeMethodsPrivate.LoadCursor(hInst, iconId);
            if (cursorHandle == null || cursorHandle.IsInvalid)
            {
                throw new Win32Exception();
            }
            return cursorHandle;
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr GetCursor()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetCursor();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int ShowCursor(bool show)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.ShowCursor(show);
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static bool AdjustWindowRectEx(ref NativeMethods.RECT lpRect, int dwStyle, bool bMenu, int dwExStyle)
        {
            bool flag = SafeNativeMethods.SafeNativeMethodsPrivate.IntAdjustWindowRectEx(ref lpRect, dwStyle, bMenu, dwExStyle);
            if (!flag)
            {
                throw new Win32Exception();
            }
            return flag;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static void GetClientRect(HandleRef hWnd, [In] [Out] ref NativeMethods.RECT rect)
        {
            if (!SafeNativeMethods.SafeNativeMethodsPrivate.IntGetClientRect(hWnd, ref rect))
            {
                throw new Win32Exception();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static void GetWindowRect(HandleRef hWnd, [In] [Out] ref NativeMethods.RECT rect)
        {
            if (!SafeNativeMethods.SafeNativeMethodsPrivate.IntGetWindowRect(hWnd, ref rect))
            {
                throw new Win32Exception();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetDoubleClickTime()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetDoubleClickTime();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsWindowEnabled(HandleRef hWnd)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsWindowEnabled(hWnd);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsWindowVisible(HandleRef hWnd)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsWindowVisible(hWnd);
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static bool ReleaseCapture()
        {
            bool flag = SafeNativeMethods.SafeNativeMethodsPrivate.IntReleaseCapture();
            if (!flag)
            {
                throw new Win32Exception();
            }
            return flag;
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool TrackMouseEvent(NativeMethods.TRACKMOUSEEVENT tme)
        {
            bool flag = SafeNativeMethods.SafeNativeMethodsPrivate.TrackMouseEvent(tme);
            int lastWin32Error = Marshal.GetLastWin32Error();
            if (!flag && lastWin32Error != 0)
            {
                throw new Win32Exception(lastWin32Error);
            }
            return flag;
        }
        [SecurityCritical, SecuritySafeCritical]
        public static void SetTimer(HandleRef hWnd, int nIDEvent, int uElapse)
        {
            if (SafeNativeMethods.SafeNativeMethodsPrivate.SetTimer(hWnd, nIDEvent, uElapse, null) == IntPtr.Zero)
            {
                throw new Win32Exception();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool TrySetTimer(HandleRef hWnd, int nIDEvent, int uElapse)
        {
            return !(SafeNativeMethods.SafeNativeMethodsPrivate.TrySetTimer(hWnd, nIDEvent, uElapse, null) == IntPtr.Zero);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool KillTimer(HandleRef hwnd, int idEvent)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.KillTimer(hwnd, idEvent);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetTickCount()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetTickCount();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int MessageBeep(int uType)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.MessageBeep(uType);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsWindowUnicode(HandleRef hWnd)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsWindowUnicode(hWnd);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr SetCursor(HandleRef hcursor)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.SetCursor(hcursor);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr SetCursor(SafeHandle hcursor)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.SetCursor(hcursor);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static void ScreenToClient(HandleRef hWnd, [In] [Out] NativeMethods.POINT pt)
        {
            if (SafeNativeMethods.SafeNativeMethodsPrivate.IntScreenToClient(hWnd, pt) == 0)
            {
                throw new Win32Exception();
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetCurrentProcessId()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetCurrentProcessId();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetCurrentThreadId()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetCurrentThreadId();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr GetCapture()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetCapture();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static IntPtr SetCapture(HandleRef hwnd)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.SetCapture(hwnd);
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static int MapVirtualKey(int nVirtKey, int nMapType)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.MapVirtualKey(nVirtKey, nMapType);
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static bool InSendMessage()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.InSendMessage();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsUxThemeActive()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsThemeActive() != 0;
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool SetCaretPos(int x, int y)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.SetCaretPos(x, y);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool DestroyCaret()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.DestroyCaret();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetCaretBlinkTime()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetCaretBlinkTime();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool GetStringTypeEx(uint locale, uint infoType, char[] sourceString, int count, ushort[] charTypes)
        {
            bool stringTypeEx = SafeNativeMethods.SafeNativeMethodsPrivate.GetStringTypeEx(locale, infoType, sourceString, count, charTypes);
            int lastWin32Error = Marshal.GetLastWin32Error();
            if (!stringTypeEx)
            {
                throw new Win32Exception(lastWin32Error);
            }
            return stringTypeEx;
        }
        [SecurityCritical, SecuritySafeCritical]
        public static int GetSysColor(int nIndex)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetSysColor(nIndex);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsClipboardFormatAvailable(int format)
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsClipboardFormatAvailable(format);
        }
        [SecurityCritical, SecuritySafeCritical]
        public static bool IsDebuggerPresent()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.IsDebuggerPresent();
        }
        [SecurityCritical, SecuritySafeCritical]
        public static void QueryPerformanceCounter(out long lpPerformanceCount)
        {
            if (!SafeNativeMethods.SafeNativeMethodsPrivate.QueryPerformanceCounter(out lpPerformanceCount))
            {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        public static void QueryPerformanceFrequency(out long lpFrequency)
        {
            if (!SafeNativeMethods.SafeNativeMethodsPrivate.QueryPerformanceFrequency(out lpFrequency))
            {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static int GetMessageTime()
        {
            return SafeNativeMethods.SafeNativeMethodsPrivate.GetMessageTime();
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static int GetWindowStyle(HandleRef hWnd, bool exStyle)
        {
            int nIndex = exStyle ? -20 : -16;
            return UnsafeNativeMethods.GetWindowLong(hWnd, nIndex);
        }
    }
}
