using BOC.UOP.Win32;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.WindowsBase
{
    [SecurityCritical(SecurityCriticalScope.Everything), SuppressUnmanagedCodeSecurity]
    internal static class NativeMethodsSetLastError
    {
        private const string PresentationNativeDll = "PresentationNative_v0400.dll";
        private const string COMPLUS_Version = "COMPLUS_Version";
        private const string COMPLUS_InstallRoot = "COMPLUS_InstallRoot";
        private const string EnvironmentVariables = "COMPLUS_Version;COMPLUS_InstallRoot";
        private const string FRAMEWORK_RegKey = "Software\\Microsoft\\Net Framework Setup\\NDP\\v4\\Client\\";
        private const string FRAMEWORK_RegKey_FullPath = "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Net Framework Setup\\NDP\\v4\\Client\\";
        private const string FRAMEWORK_InstallPath_RegValue = "InstallPath";
        private const string DOTNET_RegKey = "Software\\Microsoft\\.NETFramework";
        private const string DOTNET_Install_RegValue = "InstallRoot";
        private const string WPF_SUBDIR = "WPF";
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "EnableWindowWrapper", ExactSpelling = true, SetLastError = true)]
        public static extern bool EnableWindow(HandleRef hWnd, bool enable);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetAncestorWrapper")]
        public static extern IntPtr GetAncestor(IntPtr hwnd, int gaFlags);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetKeyboardLayoutListWrapper", ExactSpelling = true, SetLastError = true)]
        public static extern int GetKeyboardLayoutList(int size, [MarshalAs(UnmanagedType.LPArray)] [Out] IntPtr[] hkls);
        [DllImport("PresentationNative_v0400.dll", EntryPoint = "GetParentWrapper", SetLastError = true)]
        public static extern IntPtr GetParent(HandleRef hWnd);
        [DllImport("PresentationNative_v0400.dll", EntryPoint = "GetWindowWrapper", ExactSpelling = true, SetLastError = true)]
        public static extern IntPtr GetWindow(IntPtr hWnd, int uCmd);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongWrapper", SetLastError = true)]
        public static extern int GetWindowLong(HandleRef hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongWrapper", SetLastError = true)]
        public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongWrapper", SetLastError = true)]
        public static extern NativeMethods.WndProc GetWindowLongWndProc(HandleRef hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongPtrWrapper", SetLastError = true)]
        public static extern IntPtr GetWindowLongPtr(IntPtr hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongPtrWrapper", SetLastError = true)]
        public static extern IntPtr GetWindowLongPtr(HandleRef hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowLongPtrWrapper", SetLastError = true)]
        public static extern NativeMethods.WndProc GetWindowLongPtrWndProc(HandleRef hWnd, int nIndex);
        [DllImport("PresentationNative_v0400.dll", BestFitMapping = false, CharSet = CharSet.Auto, EntryPoint = "GetWindowTextWrapper", SetLastError = true)]
        public static extern int GetWindowText(HandleRef hWnd, [Out] StringBuilder lpString, int nMaxCount);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "GetWindowTextLengthWrapper", SetLastError = true)]
        public static extern int GetWindowTextLength(HandleRef hWnd);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "MapWindowPointsWrapper", ExactSpelling = true, SetLastError = true)]
        public static extern int MapWindowPoints(HandleRef hWndFrom, HandleRef hWndTo, [In] [Out] ref NativeMethods.RECT rect, int cPoints);
        [DllImport("PresentationNative_v0400.dll", EntryPoint = "SetFocusWrapper", SetLastError = true)]
        public static extern IntPtr SetFocus(HandleRef hWnd);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongWrapper")]
        public static extern int SetWindowLong(HandleRef hWnd, int nIndex, int dwNewLong);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongWrapper")]
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongWrapper", SetLastError = true)]
        public static extern int SetWindowLongWndProc(HandleRef hWnd, int nIndex, NativeMethods.WndProc dwNewLong);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongPtrWrapper")]
        public static extern IntPtr SetWindowLongPtr(HandleRef hWnd, int nIndex, IntPtr dwNewLong);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongPtrWrapper")]
        public static extern IntPtr SetWindowLongPtr(IntPtr hWnd, int nIndex, IntPtr dwNewLong);
        [DllImport("PresentationNative_v0400.dll", CharSet = CharSet.Auto, EntryPoint = "SetWindowLongPtrWrapper", SetLastError = true)]
        public static extern IntPtr SetWindowLongPtrWndProc(HandleRef hWnd, int nIndex, NativeMethods.WndProc dwNewLong);
        static NativeMethodsSetLastError()
        {
            NativeMethodsSetLastError.EnsureLoaded();
        }
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr LoadLibrary(string lpFileName);
        private static void EnsureLoaded()
        {
            string wPFInstallPath = NativeMethodsSetLastError.GetWPFInstallPath();
            string lpFileName = Path.Combine(wPFInstallPath, "PresentationNative_v0400.dll");
            NativeMethodsSetLastError.LoadLibrary(lpFileName);
        }
        private static string GetWPFInstallPath()
        {
            string text = null;
            EnvironmentPermission environmentPermission = new EnvironmentPermission(EnvironmentPermissionAccess.Read, "COMPLUS_Version;COMPLUS_InstallRoot");
            environmentPermission.Assert();
            try
            {
                string environmentVariable = Environment.GetEnvironmentVariable("COMPLUS_Version");
                if (!string.IsNullOrEmpty(environmentVariable))
                {
                    text = Environment.GetEnvironmentVariable("COMPLUS_InstallRoot");
                    if (string.IsNullOrEmpty(text))
                    {
                        text = NativeMethodsSetLastError.ReadLocalMachineString("Software\\Microsoft\\.NETFramework", "InstallRoot");
                    }
                    if (!string.IsNullOrEmpty(text))
                    {
                        text = Path.Combine(text, environmentVariable);
                    }
                }
            }
            finally
            {
                CodeAccessPermission.RevertAssert();
            }
            if (string.IsNullOrEmpty(text))
            {
                text = NativeMethodsSetLastError.ReadLocalMachineString("Software\\Microsoft\\Net Framework Setup\\NDP\\v4\\Client\\", "InstallPath");
            }
            text = Path.Combine(text, "WPF");
            return text;
        }
        private static string ReadLocalMachineString(string key, string valueName)
        {
            string text = "HKEY_LOCAL_MACHINE\\" + key;
            new RegistryPermission(RegistryPermissionAccess.Read, text).Assert();
            return Registry.GetValue(text, valueName, null) as string;
        }
    }
}
