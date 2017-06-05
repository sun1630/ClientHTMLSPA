using BOC.UOP.Internal;
using BOC.UOP.Utility;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Text;
using System.Windows;

namespace BOC.UOP.AppModel
{
    internal static class AppSecurityManager
    {
        [ComVisible(false), Guid("7b8a2d94-0ac9-11d1-896c-00c04Fb6bfc4")]
        [ComImport]
        internal class InternetSecurityManager
        {
           
        }
        private static object _lockObj = new object();
        [SecurityCritical]
        private static UnsafeNativeMethods.IInternetSecurityManager _secMgr;
        private static SecurityMgrSite _secMgrSite;
        private const string RefererHeader = "Referer: ";
        private const string BrowserOpenCommandLookupKey = "htmlfile\\shell\\open\\command";
        //[SecurityCritical, SecurityTreatAsSafe]
        //internal static void SafeLaunchBrowserDemandWhenUnsafe(Uri originatingUri, Uri destinationUri, bool fIsTopLevel)
        //{
        //    LaunchResult launchResult = AppSecurityManager.SafeLaunchBrowserOnlyIfPossible(originatingUri, destinationUri, fIsTopLevel);
        //    if (launchResult == LaunchResult.NotLaunched)
        //    {
        //        SecurityHelper.DemandUnmanagedCode();
        //        AppSecurityManager.UnsafeLaunchBrowser(destinationUri, null);
        //    }
        //}
        //[TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        //internal static LaunchResult SafeLaunchBrowserOnlyIfPossible(Uri originatingUri, Uri destinationUri, bool fIsTopLevel)
        //{
        //    return AppSecurityManager.SafeLaunchBrowserOnlyIfPossible(originatingUri, destinationUri, null, fIsTopLevel);
        //}
        //[SecurityCritical, SecurityTreatAsSafe]
        //internal static LaunchResult SafeLaunchBrowserOnlyIfPossible(Uri originatingUri, Uri destinationUri, string targetName, bool fIsTopLevel)
        //{
        //    LaunchResult launchResult = LaunchResult.NotLaunched;
        //    bool flag = object.ReferenceEquals(destinationUri.Scheme, Uri.UriSchemeHttp) || object.ReferenceEquals(destinationUri.Scheme, Uri.UriSchemeHttps) || destinationUri.IsFile;
        //    bool flag2 = string.Compare(destinationUri.Scheme, Uri.UriSchemeMailto, StringComparison.OrdinalIgnoreCase) == 0;
        //    if (!BrowserInteropHelper.IsInitialViewerNavigation && SecurityHelper.CallerHasUserInitiatedNavigationPermission() && ((fIsTopLevel && flag) || flag2))
        //    {
        //        if (flag)
        //        {
        //            IBrowserCallbackServices browserCallbackServices = (Application.Current != null) ? Application.Current.BrowserCallbackServices : null;
        //            if (browserCallbackServices != null)
        //            {
        //                launchResult = AppSecurityManager.CanNavigateToUrlWithZoneCheck(originatingUri, destinationUri);
        //                if (launchResult == LaunchResult.Launched)
        //                {
        //                    browserCallbackServices.DelegateNavigation(BindUriHelper.UriToString(destinationUri), targetName, AppSecurityManager.GetHeaders(destinationUri));
        //                    launchResult = LaunchResult.Launched;
        //                }
        //            }
        //        }
        //        else
        //        {
        //            if (flag2)
        //            {
        //                UnsafeNativeMethods.ShellExecute(new HandleRef(null, IntPtr.Zero), null, BindUriHelper.UriToString(destinationUri), null, null, 0);
        //                launchResult = LaunchResult.Launched;
        //            }
        //        }
        //    }
        //    return launchResult;
        //}
        //[SecurityCritical]
        //internal static void UnsafeLaunchBrowser(Uri uri, string targetFrame = null)
        //{
        //    if (Application.Current != null && Application.Current.CheckAccess())
        //    {
        //        IBrowserCallbackServices browserCallbackServices = Application.Current.BrowserCallbackServices;
        //        if (browserCallbackServices != null)
        //        {
        //            browserCallbackServices.DelegateNavigation(BindUriHelper.UriToString(uri), targetFrame, AppSecurityManager.GetHeaders(uri));
        //            return;
        //        }
        //    }
        //    AppSecurityManager.ShellExecuteDefaultBrowser(uri);
        //}
        [SecurityCritical]
        internal static void ShellExecuteDefaultBrowser(Uri uri)
        {
            UnsafeNativeMethods.ShellExecuteInfo shellExecuteInfo = new UnsafeNativeMethods.ShellExecuteInfo();
            shellExecuteInfo.cbSize = Marshal.SizeOf(shellExecuteInfo);
            shellExecuteInfo.fMask = UnsafeNativeMethods.ShellExecuteFlags.SEE_MASK_FLAG_DDEWAIT;
            if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            {
                shellExecuteInfo.fMask |= UnsafeNativeMethods.ShellExecuteFlags.SEE_MASK_CLASSNAME;
                shellExecuteInfo.lpClass = ".htm";
            }
            shellExecuteInfo.lpFile = uri.ToString();
            if (!UnsafeNativeMethods.ShellExecuteEx(shellExecuteInfo))
            {
                throw new InvalidOperationException("FailToLaunchDefaultBrowser", new Win32Exception());
            }
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static void ClearSecurityManager()
        {
            if (AppSecurityManager._secMgr != null)
            {
                new SecurityPermission(SecurityPermissionFlag.UnmanagedCode).Assert();
                try
                {
                    lock (AppSecurityManager._lockObj)
                    {
                        if (AppSecurityManager._secMgr != null)
                        {
                            AppSecurityManager._secMgr.SetSecuritySite(null);
                            AppSecurityManager._secMgrSite = null;
                            AppSecurityManager._secMgr = null;
                        }
                    }
                }
                finally
                {
                    CodeAccessPermission.RevertAssert();
                }
            }
        }
        [SecurityCritical]
        internal static int MapUrlToZone(Uri url)
        {
            AppSecurityManager.EnsureSecurityManager();
            int result;
            AppSecurityManager._secMgr.MapUrlToZone(BindUriHelper.UriToString(url), out result, 0);
            return result;
        }
        //private static string GetHeaders(Uri destinationUri)
        //{
        //    string text = BindUriHelper.GetReferer(destinationUri);
        //    if (!string.IsNullOrEmpty(text))
        //    {
        //        text = "Referer: " + text + "\r\n";
        //    }
        //    return text;
        //}
        //[SecurityCritical, SecurityTreatAsSafe]
        //private static LaunchResult CanNavigateToUrlWithZoneCheck(Uri originatingUri, Uri destinationUri)
        //{
        //    AppSecurityManager.EnsureSecurityManager();
        //    bool flag = UnsafeNativeMethods.CoInternetIsFeatureEnabled(1, 2) != 1;
        //    int num = AppSecurityManager.MapUrlToZone(destinationUri);
        //    Uri uri = null;
        //    if (Application.Current.MimeType != MimeType.Document)
        //    {
        //        uri = BrowserInteropHelper.Source;
        //    }
        //    else
        //    {
        //        if (destinationUri.IsFile && Path.GetExtension(destinationUri.LocalPath).Equals(DocumentStream.XpsFileExtension, StringComparison.OrdinalIgnoreCase))
        //        {
        //            num = 3;
        //        }
        //    }
        //    int num2;
        //    if (uri != null)
        //    {
        //        num2 = AppSecurityManager.MapUrlToZone(uri);
        //    }
        //    else
        //    {
        //        bool flag2 = SecurityHelper.CheckUnmanagedCodePermission();
        //        if (flag2)
        //        {
        //            return LaunchResult.Launched;
        //        }
        //        num2 = 3;
        //        uri = originatingUri;
        //    }
        //    if ((!flag && ((num2 != 3 && num2 != 4) || num != 0)) || (flag && (num2 == num || (num2 <= 4 && num <= 4 && (num2 < num || ((num2 == 2 || num2 == 1) && (num == 2 || num == 1)))))))
        //    {
        //        return LaunchResult.Launched;
        //    }
        //    return AppSecurityManager.CheckBlockNavigation(uri, destinationUri, flag);
        //}
        //[SecurityCritical]
        //private static LaunchResult CheckBlockNavigation(Uri originatingUri, Uri destinationUri, bool fEnabled)
        //{
        //    if (!fEnabled)
        //    {
        //        return LaunchResult.Launched;
        //    }
        //    if (UnsafeNativeMethods.CoInternetIsFeatureZoneElevationEnabled(BindUriHelper.UriToString(originatingUri), BindUriHelper.UriToString(destinationUri), AppSecurityManager._secMgr, 2) == 1)
        //    {
        //        return LaunchResult.Launched;
        //    }
        //    if (AppSecurityManager.IsZoneElevationSettingPrompt(destinationUri))
        //    {
        //        return LaunchResult.NotLaunchedDueToPrompt;
        //    }
        //    return LaunchResult.NotLaunched;
        //}
        [SecurityCritical, SecurityTreatAsSafe]
        private unsafe static bool IsZoneElevationSettingPrompt(Uri target)
        {
            int num = 3;
            string pwszUrl = BindUriHelper.UriToString(target);
            new SecurityPermission(SecurityPermissionFlag.UnmanagedCode).Assert();
            try
            {
                AppSecurityManager._secMgr.ProcessUrlAction(pwszUrl, 8449, (byte*)(&num), Marshal.SizeOf(typeof(int)), null, 0, 1, 0);
            }
            finally
            {
                CodeAccessPermission.RevertAssert();
            }
            return num == 1;
        }
        [SecurityCritical, SecurityTreatAsSafe]
        private static void EnsureSecurityManager()
        {
            if (AppSecurityManager._secMgr == null)
            {
                lock (AppSecurityManager._lockObj)
                {
                    if (AppSecurityManager._secMgr == null)
                    {
                        AppSecurityManager._secMgr = (UnsafeNativeMethods.IInternetSecurityManager)new AppSecurityManager.InternetSecurityManager();
                        AppSecurityManager._secMgrSite = new SecurityMgrSite();
                        new SecurityPermission(SecurityPermissionFlag.UnmanagedCode).Assert();
                        try
                        {
                            AppSecurityManager._secMgr.SetSecuritySite(AppSecurityManager._secMgrSite);
                        }
                        finally
                        {
                            CodeAccessPermission.RevertAssert();
                        }
                    }
                }
            }
        }
    }
}
