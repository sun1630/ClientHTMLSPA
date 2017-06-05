using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;
using System.Security;
using System.Text;
using System.Windows;
using Fasterflect;

namespace BOC.UOP.Internal
{
    internal class SecurityMgrSite : NativeMethods.IInternetSecurityMgrSite
    {
        [TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        internal SecurityMgrSite()
        {
        }
        [SecurityCritical]
        public void GetWindow(ref IntPtr phwnd)
        {
            phwnd = IntPtr.Zero;
            if (Application.Current != null)
            {
                Window mainWindow = Application.Current.MainWindow;
                if (mainWindow != null)
                {
                    phwnd =(IntPtr) mainWindow.GetPropertyValue("CriticalHandle");
                }
            }
        }
        public void EnableModeless(bool fEnable)
        {
        }
    }
}
