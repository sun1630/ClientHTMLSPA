using BOC.UOP.Permissions;
using BOC.UOP.Utility;
using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.Internal
{
    internal static class SecurityHelper
    {
        private static SecurityPermission _unmanagedCodePermission = null;
        private static UserInitiatedRoutedEventPermission _userInitiatedRoutedEventPermission = null;
        private static PermissionSet _fullTrustPermissionSet = null;
        private static SecurityPermission _serializationSecurityPermission = null;
        private static UIPermission _uiPermissionAllClipboard = null;
        private static EnvironmentPermission _unrestrictedEnvironmentPermission = null;
        private static PermissionSet _envelopePermissionSet = null;
        private static RegistryPermission _unrestrictedRegistryPermission = null;
        private static UIPermission _allWindowsUIPermission = null;
        private static SecurityPermission _infrastructurePermission = null;
        private static UIPermission _unrestrictedUIPermission = null;
        [SecurityCritical]
        private static bool? _appDomainGrantedUnrestrictedUIPermission;
        private static PermissionSet _plugInSerializerPermissions = null;
        internal static PermissionSet EnvelopePermissionSet
        {
            [SecurityCritical]
            get
            {
                if (SecurityHelper._envelopePermissionSet == null)
                {
                    SecurityHelper._envelopePermissionSet = SecurityHelper.CreateEnvelopePermissionSet();
                }
                return SecurityHelper._envelopePermissionSet;
            }
        }
        internal static bool AppDomainGrantedUnrestrictedUIPermission
        {
            [SecurityCritical]
            get
            {
                if (!SecurityHelper._appDomainGrantedUnrestrictedUIPermission.HasValue)
                {
                    SecurityHelper._appDomainGrantedUnrestrictedUIPermission = new bool?(SecurityHelper.AppDomainHasPermission(new UIPermission(PermissionState.Unrestricted)));
                }
                return SecurityHelper._appDomainGrantedUnrestrictedUIPermission.Value;
            }
        }
        [SecuritySafeCritical]
        internal static bool CheckUnmanagedCodePermission()
        {
            try
            {
                SecurityHelper.DemandUnmanagedCode();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecurityCritical]
        internal static void DemandUnmanagedCode()
        {
            if (SecurityHelper._unmanagedCodePermission == null)
            {
                SecurityHelper._unmanagedCodePermission = new SecurityPermission(SecurityPermissionFlag.UnmanagedCode);
            }
            SecurityHelper._unmanagedCodePermission.Demand();
        }
        [SecurityCritical]
        internal static CodeAccessPermission CreateUserInitiatedRoutedEventPermission()
        {
            if (SecurityHelper._userInitiatedRoutedEventPermission == null)
            {
                SecurityHelper._userInitiatedRoutedEventPermission = new UserInitiatedRoutedEventPermission();
            }
            return SecurityHelper._userInitiatedRoutedEventPermission;
        }
        [SecuritySafeCritical]
        internal static bool CallerHasUserInitiatedRoutedEventPermission()
        {
            try
            {
                SecurityHelper.CreateUserInitiatedRoutedEventPermission().Demand();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecuritySafeCritical]
        internal static bool IsFullTrustCaller()
        {
            try
            {
                if (SecurityHelper._fullTrustPermissionSet == null)
                {
                    SecurityHelper._fullTrustPermissionSet = new PermissionSet(PermissionState.Unrestricted);
                }
                SecurityHelper._fullTrustPermissionSet.Demand();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecuritySafeCritical]
        internal static bool CallerHasPermissionWithAppDomainOptimization(params IPermission[] permissionsToCheck)
        {
            if (permissionsToCheck == null)
            {
                return true;
            }
            PermissionSet permissionSet = new PermissionSet(PermissionState.None);
            for (int i = 0; i < permissionsToCheck.Length; i++)
            {
                permissionSet.AddPermission(permissionsToCheck[i]);
            }
            PermissionSet permissionSet2 = AppDomain.CurrentDomain.PermissionSet;
            return permissionSet.IsSubsetOf(permissionSet2);
        }
        [SecuritySafeCritical]
        internal static bool AppDomainHasPermission(IPermission permissionToCheck)
        {
            PermissionSet permissionSet = new PermissionSet(PermissionState.None);
            permissionSet.AddPermission(permissionToCheck);
            return permissionSet.IsSubsetOf(AppDomain.CurrentDomain.PermissionSet);
        }
        [SecurityCritical]
        internal static Uri GetBaseDirectory(AppDomain domain)
        {
            Uri result = null;
            new FileIOPermission(PermissionState.Unrestricted).Assert();
            try
            {
                result = new Uri(domain.BaseDirectory);
            }
            finally
            {
                CodeAccessPermission.RevertAssert();
            }
            return result;
        }
        //internal static Uri ExtractUriForClickOnceDeployedApp()
        //{
        //    return SiteOfOriginContainer.SiteOfOriginForClickOnceApp;
        //}
        //[SecurityCritical]
        //internal static void BlockCrossDomainForHttpsApps(Uri uri)
        //{
        //    Uri uri2 = SecurityHelper.ExtractUriForClickOnceDeployedApp();
        //    if (uri2 != null && uri2.Scheme == Uri.UriSchemeHttps)
        //    {
        //        if (uri.IsUnc || uri.IsFile)
        //        {
        //            new FileIOPermission(FileIOPermissionAccess.Read, uri.LocalPath).Demand();
        //            return;
        //        }
        //        new WebPermission(NetworkAccess.Connect, BindUriHelper.UriToString(uri)).Demand();
        //    }
        //}
        //[SecurityCritical]
        //internal static void EnforceUncContentAccessRules(Uri contentUri)
        //{
        //    Uri uri = SecurityHelper.ExtractUriForClickOnceDeployedApp();
        //    if (uri == null)
        //    {
        //        return;
        //    }
        //    int num = SecurityHelper.MapUrlToZoneWrapper(uri);
        //    bool flag = num >= 3;
        //    bool flag2 = num == 1 && uri.Scheme == Uri.UriSchemeHttps;
        //    if (flag || flag2)
        //    {
        //        new FileIOPermission(FileIOPermissionAccess.Read, contentUri.LocalPath).Demand();
        //    }
        //}
        [SecurityCritical]
        internal static int MapUrlToZoneWrapper(Uri uri)
        {
            int num = 0;
            object obj = null;
            int num2 = UnsafeNativeMethods.CoInternetCreateSecurityManager(null, out obj, 0);
            if (NativeMethods.Failed(num2))
            {
                throw new Win32Exception(num2);
            }
            UnsafeNativeMethods.IInternetSecurityManager internetSecurityManager = (UnsafeNativeMethods.IInternetSecurityManager)obj;
            string pwszUrl = BindUriHelper.UriToString(uri);
            if (uri.IsFile)
            {
                internetSecurityManager.MapUrlToZone(pwszUrl, out num, 1);
            }
            else
            {
                internetSecurityManager.MapUrlToZone(pwszUrl, out num, 0);
            }
            if (num < 0)
            {
                throw new SecurityException("Invalid_URI");
            }
            obj = null;
            return num;
        }
        [SecurityCritical]
        internal static void DemandFilePathDiscoveryWriteRead()
        {
            new FileIOPermission(PermissionState.None)
            {
                AllFiles = FileIOPermissionAccess.Read | FileIOPermissionAccess.Write | FileIOPermissionAccess.PathDiscovery
            }.Demand();
        }
        //[SecurityCritical]
        //internal static PermissionSet ExtractAppDomainPermissionSetMinusSiteOfOrigin()
        //{
        //    PermissionSet permissionSet = AppDomain.CurrentDomain.PermissionSet;
        //    Uri siteOfOrigin = SiteOfOriginContainer.SiteOfOrigin;
        //    CodeAccessPermission codeAccessPermission = null;
        //    if (siteOfOrigin.Scheme == Uri.UriSchemeFile)
        //    {
        //        codeAccessPermission = new FileIOPermission(PermissionState.Unrestricted);
        //    }
        //    else
        //    {
        //        if (siteOfOrigin.Scheme == Uri.UriSchemeHttp)
        //        {
        //            codeAccessPermission = new WebPermission(PermissionState.Unrestricted);
        //        }
        //    }
        //    if (codeAccessPermission != null && permissionSet.GetPermission(codeAccessPermission.GetType()) != null)
        //    {
        //        permissionSet.RemovePermission(codeAccessPermission.GetType());
        //    }
        //    return permissionSet;
        //}
        [SecuritySafeCritical]
        internal static bool CallerHasSerializationPermission()
        {
            try
            {
                if (SecurityHelper._serializationSecurityPermission == null)
                {
                    SecurityHelper._serializationSecurityPermission = new SecurityPermission(SecurityPermissionFlag.SerializationFormatter);
                }
                SecurityHelper._serializationSecurityPermission.Demand();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecuritySafeCritical]
        internal static bool CallerHasAllClipboardPermission()
        {
            try
            {
                SecurityHelper.DemandAllClipboardPermission();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecurityCritical]
        internal static void DemandAllClipboardPermission()
        {
            if (SecurityHelper._uiPermissionAllClipboard == null)
            {
                SecurityHelper._uiPermissionAllClipboard = new UIPermission(UIPermissionClipboard.AllClipboard);
            }
            SecurityHelper._uiPermissionAllClipboard.Demand();
        }
        [SecurityCritical]
        internal static void DemandPathDiscovery(string path)
        {
            new FileIOPermission(FileIOPermissionAccess.PathDiscovery, path).Demand();
        }
        [SecuritySafeCritical]
        internal static bool CheckEnvironmentPermission()
        {
            try
            {
                SecurityHelper.DemandEnvironmentPermission();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        [SecurityCritical]
        internal static void DemandEnvironmentPermission()
        {
            if (SecurityHelper._unrestrictedEnvironmentPermission == null)
            {
                SecurityHelper._unrestrictedEnvironmentPermission = new EnvironmentPermission(PermissionState.Unrestricted);
            }
            SecurityHelper._unrestrictedEnvironmentPermission.Demand();
        }
        [SecurityCritical]
        internal static void DemandUriDiscoveryPermission(Uri uri)
        {
            CodeAccessPermission codeAccessPermission = SecurityHelper.CreateUriDiscoveryPermission(uri);
            if (codeAccessPermission != null)
            {
                codeAccessPermission.Demand();
            }
        }
        [SecurityCritical]
        internal static CodeAccessPermission CreateUriDiscoveryPermission(Uri uri)
        {
            if (uri.GetType().IsSubclassOf(typeof(Uri)))
            {
                SecurityHelper.DemandInfrastructurePermission();
            }
            if (uri.IsFile)
            {
                return new FileIOPermission(FileIOPermissionAccess.PathDiscovery, uri.LocalPath);
            }
            return null;
        }
        [SecurityCritical]
        internal static CodeAccessPermission CreateUriReadPermission(Uri uri)
        {
            if (uri.GetType().IsSubclassOf(typeof(Uri)))
            {
                SecurityHelper.DemandInfrastructurePermission();
            }
            if (uri.IsFile)
            {
                return new FileIOPermission(FileIOPermissionAccess.Read, uri.LocalPath);
            }
            return null;
        }
        [SecurityCritical]
        internal static void DemandUriReadPermission(Uri uri)
        {
            CodeAccessPermission codeAccessPermission = SecurityHelper.CreateUriReadPermission(uri);
            if (codeAccessPermission != null)
            {
                codeAccessPermission.Demand();
            }
        }
        [SecuritySafeCritical]
        internal static bool CallerHasPathDiscoveryPermission(string path)
        {
            bool result;
            try
            {
                SecurityHelper.DemandPathDiscovery(path);
                result = true;
            }
            catch (SecurityException)
            {
                result = false;
            }
            return result;
        }
        [SecuritySafeCritical]
        internal static Exception GetExceptionForHR(int hr)
        {
            return Marshal.GetExceptionForHR(hr, new IntPtr(-1));
        }
        [SecuritySafeCritical]
        internal static void ThrowExceptionForHR(int hr)
        {
            Marshal.ThrowExceptionForHR(hr, new IntPtr(-1));
        }
        [SecuritySafeCritical]
        internal static int GetHRForException(Exception exception)
        {
            if (exception == null)
            {
                throw new ArgumentNullException("exception");
            }
            int hRForException = Marshal.GetHRForException(exception);
            Marshal.GetHRForException(new Exception());
            return hRForException;
        }
        [SecurityCritical]
        internal static void DemandRegistryPermission()
        {
            if (SecurityHelper._unrestrictedRegistryPermission == null)
            {
                SecurityHelper._unrestrictedRegistryPermission = new RegistryPermission(PermissionState.Unrestricted);
            }
            SecurityHelper._unrestrictedRegistryPermission.Demand();
        }
        [SecurityCritical]
        internal static void DemandUIWindowPermission()
        {
            if (SecurityHelper._allWindowsUIPermission == null)
            {
                SecurityHelper._allWindowsUIPermission = new UIPermission(UIPermissionWindow.AllWindows);
            }
            SecurityHelper._allWindowsUIPermission.Demand();
        }
        [SecurityCritical]
        internal static void DemandInfrastructurePermission()
        {
            if (SecurityHelper._infrastructurePermission == null)
            {
                SecurityHelper._infrastructurePermission = new SecurityPermission(SecurityPermissionFlag.Infrastructure);
            }
            SecurityHelper._infrastructurePermission.Demand();
        }
        [SecurityCritical]
        internal static void DemandMediaPermission(MediaPermissionAudio audioPermissionToDemand, MediaPermissionVideo videoPermissionToDemand, MediaPermissionImage imagePermissionToDemand)
        {
            new MediaPermission(audioPermissionToDemand, videoPermissionToDemand, imagePermissionToDemand).Demand();
        }
        [SecuritySafeCritical]
        internal static bool CallerHasMediaPermission(MediaPermissionAudio audioPermissionToDemand, MediaPermissionVideo videoPermissionToDemand, MediaPermissionImage imagePermissionToDemand)
        {
            bool result;
            try
            {
                new MediaPermission(audioPermissionToDemand, videoPermissionToDemand, imagePermissionToDemand).Demand();
                result = true;
            }
            catch (SecurityException)
            {
                result = false;
            }
            return result;
        }
        [SecurityCritical]
        internal static void DemandUnrestrictedUIPermission()
        {
            if (SecurityHelper._unrestrictedUIPermission == null)
            {
                SecurityHelper._unrestrictedUIPermission = new UIPermission(PermissionState.Unrestricted);
            }
            SecurityHelper._unrestrictedUIPermission.Demand();
        }
        [SecurityCritical]
        internal static void DemandFileIOReadPermission(string fileName)
        {
            new FileIOPermission(FileIOPermissionAccess.Read, fileName).Demand();
        }
        //[SecurityCritical]
        //internal static void DemandMediaAccessPermission(string uri)
        //{
        //    CodeAccessPermission codeAccessPermission = SecurityHelper.CreateMediaAccessPermission(uri);
        //    if (codeAccessPermission != null)
        //    {
        //        codeAccessPermission.Demand();
        //    }
        //}
        //[SecurityCritical]
        //internal static CodeAccessPermission CreateMediaAccessPermission(string uri)
        //{
        //    CodeAccessPermission result = null;
        //    if (uri != null)
        //    {
        //        if (string.Compare("image", uri, true, Helper.InvariantEnglishUS) == 0)
        //        {
        //            result = new MediaPermission(MediaPermissionAudio.NoAudio, MediaPermissionVideo.NoVideo, MediaPermissionImage.AllImage);
        //        }
        //        else
        //        {
        //            if (string.Compare(BaseUriHelper.GetResolvedUri(BaseUriHelper.BaseUri, new Uri(uri, UriKind.RelativeOrAbsolute)).Scheme, PackUriHelper.UriSchemePack, true, Helper.InvariantEnglishUS) != 0 && !SecurityHelper.CallerHasWebPermission(new Uri(uri, UriKind.RelativeOrAbsolute)))
        //            {
        //                result = new MediaPermission(MediaPermissionAudio.NoAudio, MediaPermissionVideo.NoVideo, MediaPermissionImage.AllImage);
        //            }
        //        }
        //    }
        //    else
        //    {
        //        result = new MediaPermission(MediaPermissionAudio.NoAudio, MediaPermissionVideo.NoVideo, MediaPermissionImage.AllImage);
        //    }
        //    return result;
        //}
        [SecuritySafeCritical]
        internal static bool CallerHasWebPermission(Uri uri)
        {
            bool result;
            try
            {
                SecurityHelper.DemandWebPermission(uri);
                result = true;
            }
            catch (SecurityException)
            {
                result = false;
            }
            return result;
        }
        [SecurityCritical]
        internal static void DemandWebPermission(Uri uri)
        {
            string uriString = BindUriHelper.UriToString(uri);
            if (uri.IsFile)
            {
                string localPath = uri.LocalPath;
                new FileIOPermission(FileIOPermissionAccess.Read, localPath).Demand();
                return;
            }
            new WebPermission(NetworkAccess.Connect, uriString).Demand();
        }
        [SecurityCritical]
        internal static void DemandPlugInSerializerPermissions()
        {
            if (SecurityHelper._plugInSerializerPermissions == null)
            {
                SecurityHelper._plugInSerializerPermissions = new PermissionSet(PermissionState.Unrestricted);
            }
            SecurityHelper._plugInSerializerPermissions.Demand();
        }
        internal static bool AreStringTypesEqual(string m1, string m2)
        {
            return string.Compare(m1, m2, StringComparison.OrdinalIgnoreCase) == 0;
        }
        [SecurityCritical]
        private static PermissionSet CreateEnvelopePermissionSet()
        {
            PermissionSet permissionSet = new PermissionSet(PermissionState.None);
            
            permissionSet.AddPermission(new RightsManagementPermission());
            permissionSet.AddPermission(new CompoundFileIOPermission());
            return permissionSet;
        }
        private static WebBrowserPermission _webBrowserPermission;
        internal static WebBrowserPermission CachedWebBrowserPermission
        {
            [SecurityCritical]
            get
            {
                if (SecurityHelper._webBrowserPermission == null)
                {
                    SecurityHelper._webBrowserPermission = new WebBrowserPermission(PermissionState.Unrestricted);
                }
                return SecurityHelper._webBrowserPermission;
            }
        }
        [SecurityCritical]
        internal static void DemandWebBrowserPermission()
        {
            SecurityHelper.CachedWebBrowserPermission.Demand();
        }
        [SecuritySafeCritical]
        internal static bool CallerAndAppDomainHaveUnrestrictedWebBrowserPermission()
        {
            if (!SecurityHelper.AppDomainHasPermission(SecurityHelper.CachedWebBrowserPermission))
            {
                return false;
            }
            try
            {
                SecurityHelper.DemandWebBrowserPermission();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
        private static UserInitiatedNavigationPermission _userInitiatedNavigationPermission = null;
        [SecurityCritical]
        internal static CodeAccessPermission CreateUserInitiatedNavigationPermission()
        {
            if (SecurityHelper._userInitiatedNavigationPermission == null)
            {
                SecurityHelper._userInitiatedNavigationPermission = new UserInitiatedNavigationPermission();
            }
            return SecurityHelper._userInitiatedNavigationPermission;
        }
        [SecuritySafeCritical]
        internal static bool CallerHasUserInitiatedNavigationPermission()
        {
            try
            {
                SecurityHelper.CreateUserInitiatedNavigationPermission();
                SecurityHelper._userInitiatedNavigationPermission.Demand();
            }
            catch (SecurityException)
            {
                return false;
            }
            return true;
        }
    }
}
