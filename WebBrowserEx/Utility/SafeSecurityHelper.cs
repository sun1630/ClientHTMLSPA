using BOC.UOP.Permissions;
using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Permissions;
using System.Text;
using System.Windows;
using System.Windows.Media;

namespace BOC.UOP.Utility
{
    internal static class SafeSecurityHelper
    {
        internal enum KeyToRead
        {
            WebBrowserDisable = 1,
            MediaAudioDisable,
            MediaVideoDisable = 4,
            MediaImageDisable = 8,
            MediaAudioOrVideoDisable = 6,
            ScriptInteropDisable = 16
        }
        internal const string IMAGE = "image";
        internal static string GetAssemblyPartialName(Assembly assembly)
        {
            AssemblyName assemblyName = new AssemblyName(assembly.FullName);
            string name = assemblyName.Name;
            if (name == null)
            {
                return string.Empty;
            }
            return name;
        }
        internal static string GetFullAssemblyNameFromPartialName(Assembly protoAssembly, string partialName)
        {
            return new AssemblyName(protoAssembly.FullName)
            {
                Name = partialName
            }.FullName;
        }
        //[SecurityCritical, SecurityTreatAsSafe]
        //internal static Point ClientToScreen(UIElement relativeTo, Point point)
        //{
        //    PresentationSource presentationSource = PresentationSource.CriticalFromVisual(relativeTo);
        //    if (presentationSource == null)
        //    {
        //        return new Point(double.NaN, double.NaN);
        //    }
        //    GeneralTransform generalTransform = relativeTo.TransformToAncestor(presentationSource.RootVisual);
        //    Point point2;
        //    generalTransform.TryTransform(point, out point2);
        //    Point pointClient = PointUtil.RootToClient(point2, presentationSource);
        //    return PointUtil.ClientToScreen(pointClient, presentationSource);
        //}
        internal static bool IsSameKeyToken(byte[] reqKeyToken, byte[] curKeyToken)
        {
            bool result = false;
            if (reqKeyToken == null && curKeyToken == null)
            {
                result = true;
            }
            else
            {
                if (reqKeyToken != null && curKeyToken != null && reqKeyToken.Length == curKeyToken.Length)
                {
                    result = true;
                    for (int i = 0; i < reqKeyToken.Length; i++)
                    {
                        if (reqKeyToken[i] != curKeyToken[i])
                        {
                            result = false;
                            break;
                        }
                    }
                }
            }
            return result;
        }
        [SecurityCritical, SecuritySafeCritical]
        internal static bool IsFeatureDisabled(KeyToRead key)
        {
            string name = null;
            bool flag = false;
            switch (key)
            {
                case KeyToRead.WebBrowserDisable:
                    name = "WebBrowserDisallow";
                    break;

                case KeyToRead.MediaAudioDisable:
                    name = "MediaAudioDisallow";
                    break;

                case KeyToRead.MediaVideoDisable:
                    name = "MediaVideoDisallow";
                    break;

                case KeyToRead.MediaAudioOrVideoDisable:
                    name = "MediaAudioDisallow";
                    break;

                case KeyToRead.MediaImageDisable:
                    name = "MediaImageDisallow";
                    break;

                case KeyToRead.ScriptInteropDisable:
                    name = "ScriptInteropDisallow";
                    break;

                default:
                    throw new ArgumentException(key.ToString());
            }
            new RegistryPermission(RegistryPermissionAccess.Read, @"HKEY_LOCAL_MACHINE\Software\Microsoft\.NETFramework\Windows Presentation Foundation\Features").Assert();
            try
            {
                object obj2 = null;
                RegistryKey key2 = Registry.LocalMachine.OpenSubKey(@"Software\Microsoft\.NETFramework\Windows Presentation Foundation\Features");
                if (key2 == null)
                {
                    return flag;
                }
                obj2 = key2.GetValue(name);
                if ((obj2 is int) && (((int)obj2) == 1))
                {
                    flag = true;
                }
                if (!flag && (key == KeyToRead.MediaAudioOrVideoDisable))
                {
                    name = "MediaVideoDisallow";
                    obj2 = key2.GetValue(name);
                    if ((obj2 is int) && (((int)obj2) == 1))
                    {
                        flag = true;
                    }
                }
            }
            finally
            {
                CodeAccessPermission.RevertAssert();
            }
            return flag;
        }
        //[SecurityCritical, SecurityTreatAsSafe]
        //internal static bool IsConnectedToPresentationSource(Visual visual)
        //{
        //    return PresentationSource.CriticalFromVisual(visual) != null;
        //}
    }
}
