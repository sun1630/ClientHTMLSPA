using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Permissions;
using System.Text;

namespace BOC.UOP.Internal
{
    internal static class RegistryKeys
    {
        internal const string WPF = "Software\\Microsoft\\.NETFramework\\Windows Presentation Foundation";
        internal const string WPF_Features = "Software\\Microsoft\\.NETFramework\\Windows Presentation Foundation\\Features";
        internal const string value_MediaImageDisallow = "MediaImageDisallow";
        internal const string value_MediaVideoDisallow = "MediaVideoDisallow";
        internal const string value_MediaAudioDisallow = "MediaAudioDisallow";
        internal const string value_WebBrowserDisallow = "WebBrowserDisallow";
        internal const string value_ScriptInteropDisallow = "ScriptInteropDisallow";
        internal const string value_AutomationWeakReferenceDisallow = "AutomationWeakReferenceDisallow";
        internal const string WPF_Hosting = "Software\\Microsoft\\.NETFramework\\Windows Presentation Foundation\\Hosting";
        internal const string value_DisableXbapErrorPage = "DisableXbapErrorPage";
        internal const string value_UnblockWebBrowserControl = "UnblockWebBrowserControl";
        internal const string HKCU_XpsViewer = "HKEY_CURRENT_USER\\Software\\Microsoft\\XPSViewer";
        internal const string value_IsolatedStorageUserQuota = "IsolatedStorageUserQuota";
        internal const string HKLM_XpsViewerLocalServer32 = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\CLSID\\{7DDA204B-2097-47C9-8323-C40BB840AE44}\\LocalServer32";
        internal const string HKLM_IetfLanguage = "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Nls\\IetfLanguage";
        internal const string FRAMEWORK_RegKey = "Software\\Microsoft\\Net Framework Setup\\NDP\\v4\\Client\\";
        internal const string FRAMEWORK_RegKey_FullPath = "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Net Framework Setup\\NDP\\v4\\Client\\";
        internal const string FRAMEWORK_InstallPath_RegValue = "InstallPath";
        [SecurityCritical]
        internal static bool ReadLocalMachineBool(string key, string valueName)
        {
            string text = "HKEY_LOCAL_MACHINE\\" + key;
            new RegistryPermission(RegistryPermissionAccess.Read, text).Assert();
            object value = Registry.GetValue(text, valueName, null);
            return value is int && (int)value != 0;
        }
    }
}
